'use strict'

const plaid = require('plaid');
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/main');
const Stats = require('fast-stats').Stats;
const plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, plaid.environments.tartan);

exports.getBasicUserInfo = function (financialData) {
	let accessToken = financialData.accessToken;
	let accountId = financialData.accountId;

	plaidClient.getConnectUser(accessToken, {}, function (err, response) {
		const selectedAccountTransactions = _.filter(response.transactions, function (transaction) {
			return transaction._account === accountId;
		});

		const selectedAccount = _.find(response.accounts, function (acct) {
			return acct._id === accountId;
		});

		const sortedTransactions = _.sortBy(selectedAccountTransactions, function (txn) {
			return moment(txn.date)
		});

		const oneYearAgo = moment(new Date()).subtract(1, 'years');
		const threeMonthsAgo = moment(newDate()).subtract(3, 'months');
		const today = moment(new Date());
		const days = today.diff(oneYearAgo, 'days');

		let pastYear = {currentBalance: selectedAccount.balance.available};

		let oneYearBalances = _.reduce(sortedTransactions, function(memo, txn, index) {
			memo[txn.date] = txn.amount;
			return memo;
		}, pastYear);

		let threeMonthsBalances = _.pickBy(oneYearBalances, function(balance, date) {
			return moment(date).isAfter(threeMonthsAgo);
		});

		_.times(days, function(index) {
			const today = today.format('YYYY-MM-DD');
			const dayBefore = today.add(1, 'day').format('YYYY-MM-DD');
			let newBalance;

			if (index === 0) {
				newBalance = oneYearBalances[today] ? oneYearBalances.currentBalance - oneYearBalances[today] : oneYearBalances.currentBalance;
			} else if (oneYearBalances[today]) {
				newBalance = oneYearBalances[dayBefore] - oneYearBalances[today];
			} else {
				newBalance = oneYearBalances[dayBefore];
			}
			oneYearBalances[today] = parseFloat(newBalance.toFixed(2));
		});

		return {
			sortedTransactions: sortedTransactions,
			threeMonthsBalances: threeMonthsBalances,
			oneYearBalances: oneYearBalances,
			lowestRecentBalance: _.minBy(_.values(threeMonthsBalances)),
			currentBalance: oneYearBalances[currentBalance]
		};
	});
}

exports.getDecisionInfo = function (basicInfo) {
	const {sortedTransactions,
		threeMonthsBalances,
		oneYearBalances,
		currentBalance,
		lowestRecentBalance} = basicInfo;

	let smallTransactions = {};
	let medTransactions = {};
	let largeTransactions = {};

	const today = moment(new Date());
	let extractAmount;
	let safeDelta = currentBalance - lowestRecentBalance;

	const rawTransactionAmounts = _.reduce(sortedTransactions, function (memo, txn) {
		if (txn.amount > 0) {
			memo.push(txn.amount);
		}
		return memo;
	}, []);

	if (rawTransactionAmounts.length < 10 && safeDelta > 0) {
		return getExtractAmount(safeDelta);
	}

	let oneYearStats = new Stats().push(rawTransactionAmounts);
	const lowerThird = oneYearStats.percentile(33);
	const upperThird = oneYearStats.percentile(67);

	_.each(sortedTransactions, function (txn) {
		const amount = txn.amount;
		if (amount <= lowerThird) {
			smallTransactions[txn.date] = txn;
		} else if (amount > lowerThird && amount < upperThird){
			medTransactions[txn.date] = txn;
		} else {
			largeTransactions[txn.date] = txn;
		}
	});

	const avgSmallTxn = _.meanBy(_.values(smallTransactions, 'amount'));
	const avgMedTxn = _.meanBy(_.values(medTransactions, 'amount'));
	const avgLargeTxn = _.meanBy(_.values(largeTransactions, 'amount'));

	const smallTxnFrequency = averageDaysBetweenTransactions(smallTransactions);
	const medTxnFrequency = averageDaysBetweenTransactions(medTransactions);
	const largeTxnFrequency = averageDaysBetweenTransactions(largeTransactions);
	const longestFrequency = _.max([smallTxnFrequency, medTxnFrequency, largeTxnFrequency]);

	const likelyWithdrawals = {
		small: smallTxnFrequency > 1 ? avgSmallTxn : ((1 / smallTxnFrequency) * avgSmallTxn),
		medium: medTxnFrequency > 1 ? avgMedTxn : ((1 / medTxnFrequency) * avgMedTxn),
		large: largeTxnFrequency > 1 ? avgLargeTxn : ((1 / largeTxnFrequency) * avgLargeTxn)
	};

	const sortedWithinLongestFrequency = _.filter(sortedTransactions, function (txn) {
		return today.diff(moment(txn.date), 'days') <= longestFrequency;
	});

	_.each(sortedWithinLongestFrequency, function (txn) {
		const amount = txn.amount;
		const txnDate = moment(txn.date);
		if (amount <= lowerThird) {
			if (smallTxnFrequency > 1 && today.diff(txnDate, 'days') <= smallTxnFrequency) {
				likelyWithdrawals.small = 0;
			}
		} else if (medTxnFrequency > 1 && amount > lowerThird && amount < upperThird) {
			if (today.diff(txnDate, 'days') <= medTxnFrequency) {
				likelyWithdrawals.med = 0;
			}
		} else if (largeTxnFrequency > 1) {
			if (today.diff(txnDate, 'days') <= largeTxnFrequency) {
				likelyWithdrawals.large = 0;
			}
		}
	});

	_.each(likelyWithdrawals, function (futureWithdrawalAmount) {
		safeDelta -= futureWithdrawalAmount;
	});

	if (safeDelta > 0) {
		return getExtractAmount(safeDelta);
	}

	return extractAmount;
}

function getExtractAmount (safeDelta) {
	const extractPercentage = .01;
	const percentageOfSafeDelta = safeDelta * extractPercentage;
	extractAmount = percentageOfSafeDelta > config.globalMax ?
		config.globalMax : percentageOfSafeDelta;
}

// TODO: handle < one day
function averageDaysBetweenTransactions (transactions) {
	let daysBetweenTransactions = [];
	const transactionsArrayByDate = _.sortBy(transactions, function (txn) { return moment(txn.date)});

	_.each(transactionsArrayByDate, function (currentTxn, index) {
		let nextTxn = transactionsArrayByDate[index + 1];
		if (nextTxn) {
			daysBetweenTransactions.push(moment(nextTxn.date).diff(moment(currentTxn.date), 'days'));
		}
	});

	return _.mean(daysBetweenTransactions);
}

'use strict'

const bluebird = require('bluebird');
const plaid = bluebird.promisifyAll(require('plaid'));
const _ = require('lodash');
const moment = require('moment');
const config = require('../config/main');
const Stats = require('fast-stats').Stats;
const plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, plaid.environments.tartan);

exports.getBasicUserInfo = function (financialData) {
	let accessToken = financialData.accessToken;
	let accountId = financialData.accountId;

	return plaidClient.getConnectUserAsync(accessToken, {}).then(function (response) {
		const selectedAccountTransactions = _.filter(response.transactions, function (transaction) {
			return transaction._account === accountId;
		});

		const selectedAccount = _.find(response.accounts, function (acct) {
			return acct._id === accountId;
		});

		const sortedTransactions = _.sortBy(selectedAccountTransactions, function (txn) {
			return moment(txn.date)
		});

		const oneYearAgo = moment().subtract(1, 'years');
		const threeMonthsAgo = moment().subtract(3, 'months');
		const days = moment().diff(oneYearAgo, 'days');
		let oneYearBalances = {currentBalance: selectedAccount.balance.available};
		let lowestRecentBalance;

		let transactionsByDate = _.reduce(sortedTransactions, function(memo, txn, index) {
			memo[txn.date] = txn.amount;
			return memo;
		}, {});

		_.times(days, function(index) {
			const today = moment().subtract(index, 'days').format('YYYY-MM-DD');
			const mostRecentlyParsedDate = moment(today).add(1, 'days').format('YYYY-MM-DD');
			let newBalance, balance;

			if (index === 0) {
				newBalance = transactionsByDate[today] ? oneYearBalances.currentBalance - transactionsByDate[today] : oneYearBalances.currentBalance;
			} else if (transactionsByDate[today]) {
				newBalance = oneYearBalances[mostRecentlyParsedDate] + transactionsByDate[today];
			} else {
				newBalance = oneYearBalances[mostRecentlyParsedDate];
			}

			balance = parseFloat(newBalance.toFixed(2));
			oneYearBalances[today] = balance;

			if (moment(today).isAfter(threeMonthsAgo) &&
				(_.isUndefined(lowestRecentBalance) ||
					lowestRecentBalance > balance)) {
				lowestRecentBalance = balance;
			}
		});



		return {
			sortedTransactions: sortedTransactions,
			oneYearBalances: oneYearBalances,
			lowestRecentBalance: lowestRecentBalance,
			currentBalance: oneYearBalances.currentBalance
		};
	});
}

exports.getDecisionInfo = function (basicInfo) {
	const {sortedTransactions,
		currentBalance,
		lowestRecentBalance} = basicInfo;
	let extractAmount;
	let txnsBySize = { small: 0, medium: 0, large: 0};
	let safeDelta = currentBalance - lowestRecentBalance;

	if (sortedTransactions.length < 10 && safeDelta > 0) {
		extractAmount = getExtractAmount(safeDelta);
	}

	const rawTransactionAmounts = getRawTransactionAmounts(sortedTransactions);
	const splitOutTransactions = getSplitTransactions(sortedTransactions, rawTransactionAmounts);
	const averageTransactionsBySize = getAverageTransactionsBySize(splitOutTransactions, _.clone(txnsBySize));
	const transactionFrequencies = getTransactionFrequencies(splitOutTransactions, _.clone(txnsBySize));
	const longestFrequency = _.max(_.values([transactionFrequencies]));
	let likelyWithdrawals = getLikelyWithdrawals(transactionFrequencies, averageTransactionsBySize, _.clone(txnsBySize));

	const sortedWithinLongestFrequency = _.filter(sortedTransactions, (txn) => {
		return moment().diff(moment(txn.date), 'days') <= longestFrequency;
	});

	likelyWithdrawals = updateLikelywithdrawals(likelyWithdrawals, sortedWithinLongestFrequency);

	_.each(likelyWithdrawals, function (futureWithdrawalAmount) {
		safeDelta -= futureWithdrawalAmount;
	});

	if (safeDelta > 0) {
		extractAmount = getExtractAmount(safeDelta);
	}

	return extractAmount;
}

function getLikelyWithdrawals(transactionFrequencies, averageTransactionsBySize, txns) {
	_.each(txns, function (value, size) {
		txns[size] = transactionFrequencies[size] > 1 ?
			averageTransactionsBySize[size] :
			((1 / transactionFrequencies[size]) * averageTransactionsBySize[size]);
	});
	return txns;
}

function getAverageTransactionsBySize(splitOutTransactions, txns) {
	_.each(txns, function (value, size) {
		txns[size] = _.meanBy(_.values(splitOutTransactions[size], 'amount'));
	});
	return txns;
}

function getTransactionFrequencies(splitOutTransactions, txns) {
	_.each(txns, function (freq, size) {
		txns[size] = averageDaysBetweenTransactions(splitOutTransactions[size])
	});
	return txns;
}

function getRawTransactionAmounts (sortedTransactions) {
	 return _.reduce(sortedTransactions, function (memo, txn) {
		if (txn.amount > 0) {
			memo.push(txn.amount);
		}
		return memo;
	}, []);
}

function getSplitTransactions(sortedTransactions, rawTransactionAmounts) {
	let oneYearStats = new Stats().push(rawTransactionAmounts);
	const lowerThird = oneYearStats.percentile(33);
	const upperThird = oneYearStats.percentile(67);
	const splitOutTransactions = {
		small: {},
		medium: {},
		large: {}
	};

	_.each(sortedTransactions, function (txn) {
		const amount = txn.amount;
		if (amount <= lowerThird) {
			splitOutTransactions.small[txn.date] = txn;
		} else if (amount > lowerThird && amount < upperThird){
			splitOutTransactions.medium[txn.date] = txn;
		} else {
			splitOutTransactions.large[txn.date] = txn;
		}
	});

	return splitOutTransactions;
}

function updateLikelywithdrawals(likelyWithdrawals, sortedWithinLongestFrequency) {
	const today = moment();

	_.each(sortedWithinLongestFrequency, function (txn) {
		const amount = txn.amount;
		const txnDate = moment(txn.date);
		if (amount <= lowerThird) {
			if (smallTxnFrequency > 1 && today.diff(txnDate, 'days') <= smallTxnFrequency) {
				likelyWithdrawals.small = 0;
			}
		} else if (medTxnFrequency > 1 && amount > lowerThird && amount < upperThird) {
			if (today.diff(txnDate, 'days') <= medTxnFrequency) {
				likelyWithdrawals.medium = 0;
			}
		} else if (largeTxnFrequency > 1) {
			if (today.diff(txnDate, 'days') <= largeTxnFrequency) {
				likelyWithdrawals.large = 0;
			}
		}
	});
	return likelyWithdrawals
}

function getExtractAmount (safeDelta) {
	const extractPercentage = _.random(0.01, 0.04);
	const percentageOfSafeDelta = safeDelta * extractPercentage;
	return percentageOfSafeDelta > config.globalMax ?
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

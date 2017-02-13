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

		let transactionsByDate = _.reduce(sortedTransactions, function(memo, txn, index) {
			memo[txn.date] = txn.amount;
			return memo;
		}, {});

		const oneYearAgo = moment().subtract(1, 'years');
		const oldestTransaction = moment(sortedTransactions[0].date);

		const start = oneYearAgo.isBefore(oldestTransaction) ? oldestTransaction : oneYearAgo;
		const threeMonthsAgo = moment().subtract(3, 'months');
		const days = moment().diff(start, 'days');
		const balances = {};
		const currentBalance = selectedAccount.balance.available;
		let lowestRecentBalance;

		_.times(days, function(index) {
			const today = moment().subtract(index, 'days').format('YYYY-MM-DD');
			const mostRecentlyParsedDate = moment(today).add(1, 'days').format('YYYY-MM-DD');
			let newBalance, balance;

			if (index === 0) {
				newBalance = transactionsByDate[today] ? currentBalance - transactionsByDate[today] : currentBalance;
			} else if (transactionsByDate[today]) {
				newBalance = balances[mostRecentlyParsedDate] + transactionsByDate[today];
			} else {
				newBalance = balances[mostRecentlyParsedDate];
			}

			balance = parseFloat(newBalance.toFixed(2));
			balances[today] = balance;

			if (moment(today).isAfter(threeMonthsAgo) &&
				(_.isUndefined(lowestRecentBalance) ||
					lowestRecentBalance > balance)) {
				lowestRecentBalance = balance;
			}
		});

		return {
			sortedTransactions: sortedTransactions,
			lowestRecentBalance: lowestRecentBalance,
			currentBalance: currentBalance
		};
	});
}

exports.getDecisionInfo = function (basicInfo) {
	const {
		sortedTransactions,
		currentBalance,
		lowestRecentBalance
	} = basicInfo;

	let extractAmount;
	let txnsBySize = { small: 0, medium: 0, large: 0};
	let safeDelta = currentBalance - lowestRecentBalance;

	if (safeDelta <= 0 || currentBalance < 50) {
		return 0;
	} else if (sortedTransactions.length < 10 && safeDelta > 0) {
		extractAmount = this.getExtractAmount(safeDelta);
	}

	let sortedWithdrawals = _.filter(sortedTransactions, (txn) => {
		return txn.amount > 0;
	});

	const rawWithdrawalData = this.getRawWithdrawalAmount(sortedWithdrawals);

	let oneYearStats = new Stats().push(rawWithdrawalData);
	const percentiles = {lower: oneYearStats.percentile(25), upper: oneYearStats.percentile(75)}
	const splitOutTransactions = this.getTransactionsInSizeBuckets(sortedWithdrawals, rawWithdrawalData, percentiles);
	const averageTransactionsBySize = this.getAverageTransactionsBySize(splitOutTransactions, _.clone(txnsBySize));
	const transactionFrequencies = this.getTransactionFrequencies(splitOutTransactions, _.clone(txnsBySize));
	const longestFrequency = _.max(_.values(transactionFrequencies));
	let likelyWithdrawals = this.getLikelyWithdrawals(transactionFrequencies, averageTransactionsBySize, _.clone(txnsBySize));

	const sortedWithinLongestFrequency = _.filter(sortedWithdrawals, (txn) => {
		return moment().diff(moment(txn.date), 'days') <= longestFrequency;
	});

	likelyWithdrawals = updateLikelyWithdrawals(transactionFrequencies, likelyWithdrawals, sortedWithinLongestFrequency, percentiles);

	_.each(likelyWithdrawals, function (futureWithdrawalAmount) {
		safeDelta -= futureWithdrawalAmount;
	});

	if (safeDelta > 0) {
		extractAmount = this.getExtractAmount(safeDelta);
	}
	return _.round(extractAmount, 2);
}

exports.getLikelyWithdrawals = function(transactionFrequencies, averageTransactionsBySize, txns) {
	_.each(txns, function (value, size) {
		txns[size] = transactionFrequencies[size] > 1 ?
			averageTransactionsBySize[size] :
			((1 / transactionFrequencies[size]) * averageTransactionsBySize[size]);
	});
	return txns;
}

exports.getAverageTransactionsBySize = function(splitOutTransactions, txns) {
	_.each(txns, function (value, size) {
		txns[size] = _.meanBy(_.map(_.values(splitOutTransactions[size]), 'amount'));
	});
	return txns;
}

exports.getTransactionFrequencies = function(splitOutTransactions, txns) {
	_.each(txns, function (freq, size) {
		txns[size] = averageDaysBetweenTransactions(splitOutTransactions[size])
	});
	return txns;
}

exports.getRawWithdrawalAmount = function (sortedWithdrawals) {
	 return _.reduce(sortedWithdrawals, function (memo, txn) {
		if (txn.amount > 0) {
			memo.push(txn.amount);
		}
		return memo;
	}, []);
}

exports.getTransactionsInSizeBuckets = function(sortedWithdrawals, rawWithdrawalData, percentiles) {

	const splitOutTransactions = {
		small: {},
		medium: {},
		large: {}
	};

	_.each(sortedWithdrawals, function (txn) {
		const amount = txn.amount;
		if (amount <= percentiles.lower) {
			splitOutTransactions.small[txn.date] = txn;
		} else if (amount > percentiles.lower && amount < percentiles.upper){
			splitOutTransactions.medium[txn.date] = txn;
		} else {
			splitOutTransactions.large[txn.date] = txn;
		}
	});

	return splitOutTransactions;
}

function updateLikelyWithdrawals (transactionFrequencies, likelyWithdrawals, sortedWithinLongestFrequency, percentiles) {
	const today = moment();

	_.each(sortedWithinLongestFrequency, function (txn) {
		const txnAmount = txn.amount;
		const txnDate = moment(txn.date);
		if (txnAmount <= percentiles.lower) {
			if (transactionFrequencies.small > 1 && today.diff(txnDate, 'days') <= transactionFrequencies.small) {
				likelyWithdrawals.small = 0;
			}
		} else if (transactionFrequencies.medium > 1 && txnAmount > percentiles.lower && txnAmount < percentiles.upper) {
			if (today.diff(txnDate, 'days') <= transactionFrequencies.medium) {
				likelyWithdrawals.medium = 0;
			}
		} else if (transactionFrequencies.large > 1) {
			if (today.diff(txnDate, 'days') <= transactionFrequencies.large) {
				likelyWithdrawals.large = 0;
			}
		}
	});
	return likelyWithdrawals
}

exports.getExtractAmount = function (safeDelta) {
	const extractPercentage = _.random(0.01, 0.04);
	const percentageOfSafeDelta = safeDelta * extractPercentage;
	return percentageOfSafeDelta > config.globalMax ?
		_.random(0.0, config.globalMax, true) : percentageOfSafeDelta;
}

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

'use strict'

const bluebird = require('bluebird'),
	  	 plaid = bluebird.promisifyAll(require('plaid')),
  			 _ = require('lodash'),
  		moment = require('moment'),
	  	config = require('../config/main'),
	  	 Stats = require('fast-stats').Stats,
	  	  User = require('../models/user'),
   plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, config.plaid.public, plaid.environments.development);

exports.getBasicUserInfo = function (financialData) {
	let accessToken = financialData.accessToken;
	let accountId = financialData.accountId;

	const now = moment();
	const today = now.format('YYYY-MM-DD');
	const oneYearAgo = now.subtract(1, 'years').format('YYYY-MM-DD');
	return plaidClient.getTransactions(accessToken, oneYearAgo, today).then(response => {
		const selectedAccountTransactions = _.filter(response.transactions, (transaction) => {
			return transaction._account === accountId;
		});

		const selectedAccount = _.find(response.accounts, (acct) => {
			return acct._id === accountId;
		});

		const sortedTransactions = _.sortBy(selectedAccountTransactions, (txn) => {
			return moment(txn.date)
		});

		let transactionsByDate = _.reduce(sortedTransactions, (memo, txn, index) => {
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

		_.times(days, (index) => {
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
				(_.isUndefined(lowestRecentBalance) || lowestRecentBalance > balance) && (balance > 0)) {
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
	const { sortedTransactions, currentBalance, lowestRecentBalance } = basicInfo;

	let extractAmount;
	let txnsBySize = { small: 0, medium: 0, large: 0};
	let safeDelta = currentBalance - lowestRecentBalance;
	// console.log('STARTING DECISION INFO:', '\n\n\n');
	// console.log('safeDelta:', safeDelta);

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
	
	const splitOutTransactions = this.getTransactionsInSizeBuckets(sortedWithdrawals, percentiles);
	// console.log('splitOutTransactions:', splitOutTransactions);
	
	const averageTransactionsBySize = this.getAverageTransactionsBySize(splitOutTransactions, _.clone(txnsBySize));
	// console.log('averageTransactionsBySize:', averageTransactionsBySize);
	
	const transactionFrequenciesBySize = this.getTransactionFrequencies(splitOutTransactions, _.clone(txnsBySize));
	// console.log('transactionFrequenciesBySize:', transactionFrequenciesBySize);
	
	const longestFrequency = _.max(_.values(transactionFrequenciesBySize));
	// console.log('longestFrequency:', longestFrequency);
	
	let likelyWithdrawals = this.getLikelyWithdrawals(transactionFrequenciesBySize, averageTransactionsBySize, _.clone(txnsBySize));
	// console.log('likelyWithdrawals:', likelyWithdrawals);
	
	const sortedWithinLongestFrequency = _.filter(sortedWithdrawals, (txn) => {
		return moment().diff(moment(txn.date), 'days') <= longestFrequency;
	});

	likelyWithdrawals = updateLikelyWithdrawals(transactionFrequenciesBySize, likelyWithdrawals, sortedWithinLongestFrequency, percentiles);
	// console.log('updated likelyWithdrawals:', likelyWithdrawals);
	
	_.each(likelyWithdrawals, (futureWithdrawalAmount) => {
		safeDelta -= futureWithdrawalAmount;
	});

	// console.log('safeDelta', safeDelta);

	if (safeDelta > 0) {
		extractAmount = this.getExtractAmount(safeDelta);
	}
	return _.round(extractAmount, 2);
}

exports.processUser = function (user) {
	var _this = this;
	_this.getBasicUserInfo(user.stripe).then(basicUserInfo => {
		let amountToExtract = Math.floor(_this.getDecisionInfo(basicUserInfo) * 100);
		let stripeCharges = 30 + Math.ceil(amountToExtract * 0.29);
		let total = amountToExtract + stripeCharges;

		if (_.isFinite(amountToExtract)) {
			stripe.charges.create({
				amount: total,
				currency: "usd",
				customer: user.stripe.customerId
			}).then((charge) => {
				user.stripe.lastCharge = Date.now();
				user.stripe.balance += amountToExtract;
				User.findOneAndUpdate({_id: user._id}, user, {runValidators: true});
			});
		}
	}).catch((err) => {
		console.error(err);
	});
}

exports.getLikelyWithdrawals = function(transactionFrequencies, averageTransactionsBySize, txns) {
	_.each(txns, (value, size) => {
		txns[size] = transactionFrequencies[size] > 1 ?
			averageTransactionsBySize[size] :
			((1 / transactionFrequencies[size]) * averageTransactionsBySize[size]);
	});
	return txns;
}

exports.getAverageTransactionsBySize = function(splitOutTransactions, txns) {
	_.each(txns, (value, size) => {
		txns[size] = _.meanBy(_.map(_.values(splitOutTransactions[size]), 'amount'));
	});
	return txns;
}

exports.getTransactionFrequencies = function(splitOutTransactions, txns) {
	_.each(txns, (freq, size) => {
		txns[size] = averageDaysBetweenTransactions(splitOutTransactions[size])
	});
	return txns;
}

exports.getRawWithdrawalAmount = function (sortedWithdrawals) {
	 return _.reduce(sortedWithdrawals, (memo, txn) => {
		if (txn.amount > 0) {
			memo.push(txn.amount);
		}
		return memo;
	}, []);
}

exports.getTransactionsInSizeBuckets = function(sortedWithdrawals, percentiles) {

	const splitOutTransactions = {
		small: {},
		medium: {},
		large: {}
	};

	_.each(sortedWithdrawals, (txn) => {
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

	_.each(sortedWithinLongestFrequency, (txn) => {
		const txnAmount = txn.amount;
		const txnDate = moment(txn.date);
		if (txnAmount <= percentiles.lower) {
			if (transactionFrequencies.small > 1 && today.diff(txnDate, 'days') <= (Math.round(transactionFrequencies.small / 2))) {
				likelyWithdrawals.small = 0;
			}
		} else if (transactionFrequencies.medium > 1 && txnAmount > percentiles.lower && txnAmount < percentiles.upper) {
			if (today.diff(txnDate, 'days') <= (Math.round(transactionFrequencies.medium / 2))) {
				likelyWithdrawals.medium = 0;
			}
		} else if (transactionFrequencies.large > 1) {
			if (today.diff(txnDate, 'days') <= (Math.round(transactionFrequencies.large / 2))) {
				likelyWithdrawals.large = 0;
			}
		}
	});
	return likelyWithdrawals
}

exports.getExtractAmount = function (safeDelta) {
	const extractPercentage = _.random(0.01, 0.04);
	const percentageOfSafeDelta = safeDelta * extractPercentage;
	percentageOfSafeDeltaOverMin = percentageOfSafeDelta < 1 ? 1 : percentageOfSafeDelta;

	return percentageOfSafeDelta > config.globalMax ? config.globalMax : percentageOfSafeDelta;
}

function averageDaysBetweenTransactions (transactions) {
	let daysBetweenTransactions = [];
	const transactionsArrayByDate = _.sortBy(transactions, (txn) => moment(txn.date));

	_.each(transactionsArrayByDate, (currentTxn, index) => {
		let nextTxn = transactionsArrayByDate[index + 1];
		if (nextTxn) {
			daysBetweenTransactions.push(moment(nextTxn.date).diff(moment(currentTxn.date), 'days'));
		}
	});

	return _.mean(daysBetweenTransactions);
}
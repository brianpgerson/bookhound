'use strict'

const bluebird = require('bluebird'),
	  	 plaid = bluebird.promisifyAll(require('plaid')),
  			 _ = require('lodash'),
  		moment = require('moment'),
	  	config = require('../config/main'),
	  	 Stats = require('fast-stats').Stats,
	  	  User = require('../models/user'),
	  	logger = require('../config/logger'),
	  	Charge = require('../models/charge'),
	  	stripe = bluebird.promisifyAll(require("stripe")(config.stripe.secret)),
   plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, config.plaid.public, plaid.environments.sandbox);

const DEFRAY_COST = parseInt(config.defray, 10);

exports.getBasicUserInfo = function (financialData) {
	const accessToken = financialData.accessToken;
	const accountId = financialData.accountId;
	const now = moment();
	const today = now.format('YYYY-MM-DD');
	const oneYearAgo = now.subtract(12, 'months').format('YYYY-MM-DD');

	let options = {
		account_ids: [accountId],
		count: 500
	};
	
	return plaidClient.getTransactions(accessToken, oneYearAgo, today, options).then(response => {
		const transactions = response.transactions;
		const selectedAccount = _.find(response.accounts, (acct) => acct.account_id === accountId);
		const selectedAccountTransactions = _.filter(transactions, (transaction) => transaction.account_id === accountId);
    
		if (_.isEmpty(selectedAccountTransactions)) {
      return {
        sortedTransactions: [],
				lowestRecentBalance: selectedAccount.balances.available,
				currentBalance: selectedAccount.balances.available
			};
		}
    
    const sortedTransactions = _.sortBy(selectedAccountTransactions, (txn) =>  moment(txn.date));
    
    let transactionsByDate = _.reduce(sortedTransactions, (memo, txn) => {
			memo[txn.date] = _.isUndefined(memo[txn.date]) ? txn.amount : memo[txn.date] + txn.amount;
			return memo;
		}, {});

		const oneYearAgo = moment().subtract(1, 'years');
		const oldestTransactionDate = moment(sortedTransactions[0].date);

		const start = oneYearAgo.isBefore(oldestTransactionDate) ? oldestTransactionDate : oneYearAgo;
		const threeMonthsAgo = moment().subtract(3, 'months');
		const days = moment().diff(start, 'days');
		const balances = {};
		const currentBalance = selectedAccount.balances.available;
		let lowestRecentBalance;

		_.times(days, (index) => {
			const currentDay = moment().subtract(index, 'days').format('YYYY-MM-DD');
			const mostRecentlyParsedDate = moment(currentDay).add(1, 'days').format('YYYY-MM-DD');
			let newBalance, balance;

			if (index === 0) {
				newBalance = transactionsByDate[currentDay] ? currentBalance - transactionsByDate[currentDay] : currentBalance;
			} else if (transactionsByDate[currentDay]) {
				newBalance = balances[mostRecentlyParsedDate] + transactionsByDate[currentDay];
			} else {
				newBalance = balances[mostRecentlyParsedDate];
			}

			balance = parseFloat(newBalance.toFixed(2));
			balances[currentDay] = balance;

			if (moment(currentDay).isAfter(threeMonthsAgo) &&
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

exports.getDecisionInfo = (basicInfo) => {
	const { currentBalance, lowestRecentBalance } = basicInfo;

  let safeDelta = (currentBalance - lowestRecentBalance) * 100;
  let extractAmount = safeDelta && safeDelta > 10000 ? 
    getExtractAmount(safeDelta) :
    currentBalance > 500 ? config.globalMin : 0;
    
  return Math.round(extractAmount);
}

const getExtractAmount = (safeDelta) => {
	// get some arbitrary small percentage within a small window
	const extractPercentage = _.random(0.01, 0.04);
	
	// take that from the "safe delta", or the buffer we've identified as acceptable to pull from
	const percentageOfSafeDelta = safeDelta * extractPercentage;
	
	// let's just make sure it's both under 15 (shouldn't go over that ever in one extraction to buy a book)
	// and over 1 (we should try and keep the total number of extractions relatively small since Stripe
	// takes fees per txn)
	let extractAmount = percentageOfSafeDelta > config.globalMax ? config.globalMax : percentageOfSafeDelta;

	return extractAmount < config.globalMin ? config.globalMin : extractAmount;
}

function getCheapest(items) {
	if (_.isUndefined(items) || items.length === 0) {
		logger.info('No items to extract charge for. Returning 0.')
		return 0;
	}

	return _.sortBy(items, (item) => (item.price + item.shipping))[0]
}

const getBalanceAfterStripeCharge = (total) => {
  return total - (total * Math.round(0.008));
}

exports.processUser = function (user, unpurchased) {
	this.getBasicUserInfo(user.stripe).then(basicUserInfo => {
		let amountToExtract = Math.floor(this.getDecisionInfo(basicUserInfo));
    let { price, shipping } = getCheapest(unpurchased);
    let cheapestPrice = price + shipping + DEFRAY_COST;
    
    console.log(`allowed to extract ${amountToExtract}, cheapest item: ${cheapestPrice}`);
    let priceGap = cheapestPrice - user.stripe.balance
    amountToExtract = priceGap < amountToExtract ? priceGap : amountToExtract;
    console.log(`price gap: ${priceGap}, amountToExtract: ${amountToExtract}`);
		let totalAfterCharge = getBalanceAfterStripeCharge(amountToExtract);

		if (_.isFinite(amountToExtract) && amountToExtract > 0) {
			stripe.charges.create({
				amount: amountToExtract,
				currency: "usd",
				customer: user.stripe.customerId
			}).then((charge) => {
				user.stripe.lastCharge = Date.now();
				console.log('current balance:', user.stripe.balance);
				console.log('current totalAfterCharge:', totalAfterCharge);
				user.stripe.balance += totalAfterCharge;

				console.log('balance now: ', user.stripe.balance);

				let charges = user.stripe.charges;
				let userCharge = new Charge({
					_creator: user._id,
					chargeId: charge.id,
					amount: charge.amount,
					balanceTransaction: charge.balance_transaction
				});

				userCharge.save().then(savedCharge => {
					charges.push(savedCharge);
					user.stripe.charges = charges;
					User.findOneAndUpdate({_id: user._id}, user, {runValidators: true})
						.catch(err => logger.error(`Error updating user: ${user._id}. Error: ${err}`));
				}).catch(err => logger.error(`Error saving charge: ${userCharge}. Error: ${err}`));
			}).catch(err => logger.error(`Error creating charge. Error: ${err}`));;
		}
	}).catch((err) => {
		logger.error(err);
	});
}
'use strict'

const AuthController = require('./authentication.controller'),
	  		 Promise = require('bluebird'),
	  		  config = require('../config/main'),
	  			   _ = require('lodash'),
	  	 BankService = Promise.promisifyAll(require('../services/bank.service')),
  	 WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
  	 PurchaseService = Promise.promisifyAll(require('../services/purchase.service')),
	  			User = require('../models/user'),
	  		   plaid = Promise.promisifyAll(require('plaid')),
	  	      moment = require('moment'),
	  	      stripe = Promise.promisifyAll(require("stripe")(config.stripe.secret)),
	     plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, config.plaid.public, plaid.environments.production);

exports.getPlaidConfig = function (req, res) {
	 res.status(200).json({public: config.plaid.public});
}

exports.findEligibleAccountsToCharge = function () {
	const cutoff = moment().startOf('day').subtract(3, 'days');
	User.find({'stripe.lastCharge': {$lte: cutoff.toDate()}}).then(users => {
		_.each(users, (user) => {
			BankService.processUser(user);
		});
	}).catch(err => {
		console.log('error', err);
	})
}

exports.findEligibleAccountsToBuyBooks = function () {
	const startOfMonth = moment().startOf('month').toDate();
	User.find({'stripe.balance': {$gte: 500}})
		.populate('wishlist.items')
		.then(users => {
		_.filter(users, (user) => {
			const qualified = PurchaseService.qualifyPurchaser(user, startOfMonth);
			console.log(qualified);
		});
	});
}

exports.exchange = function (req, res) {
	const currentUser = req.currentUser;
	const public_token = req.body.token;
	const account_id = req.body.metadata.account_id

	plaidClient.exchangePublicToken(public_token).then(exchangeTokenRes => {
		console.log('exchanged', exchangeTokenRes);
		const accessToken = exchangeTokenRes.access_token;
		const stripeBankToken = exchangeTokenRes.stripe_bank_account_token;

		stripe.customers.create({
		  	source: stripeBankToken,
		  	description: `Another bookhound customer`
		}).then(customer => {
			const stripeInfo = {
				customerId: customer.id,
				stripeBankToken: stripeBankToken,
				accountId: account_id,
				accessToken: accessToken,
				lastCharge: new Date(),
				balance: 0
			};
			currentUser.stripe = stripeInfo;
			User.findOneAndUpdate(
				{_id: currentUser._id},
				currentUser,
				{runValidators: true})
			.then(updatedUser => {
				res.status(200).send();
			}).catch(err => {
				res.status(422).json({error: err});
			});
		});

	}).catch(err => {
		res.status(500).json({error: err});
	});
};

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
	  	      logger = require('../config/logger'),
	  	      stripe = Promise.promisifyAll(require("stripe")(config.stripe.secret)),
	     plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, config.plaid.public, plaid.environments.sandbox);

exports.getPlaidConfig = function (req, res) {
	 res.status(200).json({public: config.plaid.public});
}

exports.findEligibleAccountsToCharge = function () {
	const cutoff = moment().startOf('day').subtract(3, 'days');
	
	logger.info('Finding users to charge');

	User.find({'stripe.lastCharge': {$lte: cutoff.toDate()}}).then(users => {
		logger.info(`Users to check: ${users.length}. User objects: ${users}`);
	
		_.each(users, (user) => {
			BankService.processUser(user);
		});
	}).catch(err => {
		logger.info('Error finding eligible accounts to charge:', err);
	})
}

exports.findEligibleAccountsToBuyBooks = function () {
	const startOfMonth = moment().startOf('month').toDate();

	logger.info('Finding users to buy books');

	User.find({'stripe.balance': {$gte: 100}})
		.populate('wishlist.items')
		.then(users => {
			let qualifiedUsers = _.filter(users, (user) => {
				const qualified = PurchaseService.qualifyPurchaser(user, startOfMonth);
				logger.info(qualified, user.profile.firstName);
			});

			_.forEach(qualifiedUsers, user => PurchaseService.buyBook(user));
	});
}

exports.exchange = function (req, res) {
	const currentUser = req.currentUser;
	const public_token = req.body.token;
	const account_id = req.body.metadata.account_id

	plaidClient.exchangePublicToken(public_token).then(exchangeTokenRes => {
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

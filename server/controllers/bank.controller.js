'use strict'

const AuthController = require('./authentication.controller'),
	  		 Promise = require('bluebird'),
	  		  config = require('../config/main'),
	  			   _ = require('lodash'),
	  	 BankService = Promise.promisifyAll(require('../services/bank.service')),
  	 WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
  	 PurchaseService = Promise.promisifyAll(require('../services/purchase.service')),
	  			User = require('../models/user'),
	  		Purchase = require('../models/purchase'),
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
	const startOfMonth = moment().startOf('month').toDate();
	
	logger.info('Finding users to charge');

	User.find({'stripe.lastCharge': {$lte: cutoff.toDate()}})
		.populate('stripe.charges')
		.then(users => {
			_.each(users, (user) => {
				const maxOrders = user.wishlist.maxMonthlyOrderFrequency;
	    		return Purchase.find({updatedAt : { $gte: startOfMonth} }).then((purchases) => {
	    			if (purchases.length < maxOrders) {
						BankService.processUser(user);
	    			}
	    		})
			});
		}).catch(err => {
			logger.info('Error finding eligible accounts to charge:', err);
		});
}

exports.findEligibleAccountsToBuyBooks = function () {
	const startOfMonth = moment().startOf('month').toDate();

	logger.info('Finding users to buy books');

	User.find({'stripe.balance': {$gte: 100}})
		.populate('wishlist.items')
		.populate('stripe.charges')
		.then(users => {
			_.forEach(users, (user) => {
				PurchaseService.qualifyPurchaser(user, startOfMonth).then(qualified => {
					logger.info(`${user.profile.firstName} is ${qualified ? '' : 'not'}qualified`);
					if (qualified) {
						PurchaseService.buyBook(user);
					}
				});
			});
	});
}

exports.exchange = function (req, res) {
	const currentUser = req.currentUser;
	const public_token = req.body.token;
	const accountId = req.body.metadata.account_id

	plaidClient.exchangePublicToken(public_token).then(exchangeTokenRes => {
		const accessToken = exchangeTokenRes.access_token;

		// WHY does this require the "(err, success)" callback? it does not work without it
		// and that is very annoying!
		plaidClient.createStripeToken(accessToken, accountId, (err, stripeTokenResponse) => {
			let stripeUserParams = {stripeTokenResponse, accountId, accessToken, currentUser};
			createStripeUser(err, stripeUserParams, res);
		});
	}).catch(err => {
		res.status(500).json({error: `error exchanging public token?! ${err}`});
	});
};

function createStripeUser (err, stripeUserParams, res) {
	if (!!err) {
		res.status(500).json({error: `error getting stripe token: ${err}`});	
	}
    
    let {stripeTokenResponse, accountId, accessToken, currentUser} = stripeUserParams;
    const stripeBankToken = stripeTokenResponse.stripe_bank_account_token;

	stripe.customers.create({
	  	source: stripeBankToken,
	  	description: `Another bookhound customer`
	}).then(customer => {

		const stripeInfo = {
			customerId: customer.id,
			stripeBankToken: stripeBankToken,
			accountId: accountId,
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
			res.status(422).json({error: `error saving user: ${err}`});
		});
	}).catch(err => {
		res.status(500).json({error: `error creating customer: ${err}` });	
	});
}	

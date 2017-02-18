'use strict'

const AuthController = require('./authentication.controller'),
	  		 Promise = require('bluebird'),
	  		  config = require('../config/main'),
	  			   _ = require('lodash'),
	  	 BankService = Promise.promisifyAll(require('../services/bank.service')),
  	 WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
	 	 Preferences = require('../models/preferences'),
	  		Wishlist = require('../models/wishlist').Wishlist,
	  			User = require('../models/user'),
	  		   plaid = require('plaid'),
	  	      moment = require('moment'),
	  	      stripe = Promise.promisifyAll(require("stripe")(config.stripe.secret));

exports.getPlaidConfig = function (req, res) {
	 res.status(200).json({public: config.plaid.public});
}

exports.findEligibleAccountsToCharge = function () {
	var cutoff = moment().startOf('day').subtract(3, 'days');
	User.find({
	  'stripe.lastCharge': {
	    $lte: cutoff.toDate(),
	  }
	}).then((err, users) => {
		_.each(users, (user) => {
			BankService.processUser(user);
		})
	});
}

exports.findEligibleAccountsToBuyBooks = function () {
	User.find({
		'stripe.balance': {
			$gte: 100
		}
	}).then((users) => {
		_.each(users, (user) => {
			let promisifiedPreferences = Preferences.findOne({userId: user.id}).exec();
  			let promisifiedWishlist = Wishlist.findOne({userId: user.id}).exec();

  			Promise.all([promisifiedPreferences, promisifiedWishlist])
		    .spread((preferences, wishlist) => {
		    	const items = wishlist.items;
		    	_.forEach(items, WishlistService.findCheapestPrice)
		    });
		});
	});
}

exports.exchange = function (req, res) {
	const currentUser = req.currentUser;
	const conf = config.plaid;
	const public_token = req.body.token;
	const account_id = req.body.metadata.account_id

	const plaidClient = new plaid.Client(
		conf.client,
		conf.secret,
		plaid.environments.tartan);

	plaidClient.exchangeToken(public_token, account_id).then(exchangeTokenRes => {
		const accessToken = exchangeTokenRes.access_token;
		const stripeBankToken = exchangeTokenRes.stripe_bank_account_token;

		plaidClient.upgradeUser(accessToken, 'connect', {}).then(response => {
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
		});
	}).catch(err => {
		res.status(500).json({error: err});
	});
};

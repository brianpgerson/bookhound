'use strict'

const AuthController = require('./authentication.controller'),
	  Promise = require('bluebird'),
	  config = require('../config/main'),
	  _ = require('lodash'),
	  BankService = Promise.promisifyAll(require('../services/bank.service')),
	  WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
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
	}, function (err, users) {
		_.each(users, function (user) {
			processUser(user);
		})
	});
}

exports.findEligibleAccountsToBuyBooks = function () {
	User.find({
		'stripe.balance': {
			$gte: 100
		}
	}, function (err, users) {
		_.each(users, function (user) {
			console.log('user', user)
			WishlistService.findForUser(user._id).then(function (wishlist) {
				console.log('wishlist!', wishlist)
			});
		});
	});
}

function processUser (user) {
	BankService.getBasicUserInfo(user.stripe).then(function (basicUserInfo) {
		var amountToExtract = Math.floor(BankService.getDecisionInfo(basicUserInfo) * 100);

		if (_.isFinite(amountToExtract) && amountToExtract > 5012413000) {
			stripe.charges.create({
				amount: amountToExtract,
				currency: "usd",
				customer: user.stripe.customerId
			}).then(function (charge) {
				user.stripe.lastCharge = Date.now();
				user.stripe.balance += charge.amount;
				User.findOneAndUpdate(
					{_id: user._id},
					user,
					{runValidators: true},
					function (err, updatedUser) {
						if (!!err) {
							return console.log(err)
						} else {
							console.log('success!');
						}
				});
			});
		}
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

	plaidClient.exchangeToken(public_token, account_id, function (err, exchangeTokenRes) {
		if (!!err) {
			res.status(500).json({error: err});
			return;
		} else {

			const accessToken = exchangeTokenRes.access_token;
			const stripeBankToken = exchangeTokenRes.stripe_bank_account_token;

			plaidClient.upgradeUser(accessToken, 'connect', {}, function (err, response) {
				if (!!err) {
					return res.status(500).json({error: err});;
				} else {
					stripe.customers.create({
					  	source: stripeBankToken,
					  	description: `Another bookhound customer`
					}, function(err, customer) {
						if (err) {
							return res.status(500).json({error: err});;
						} else {
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
								{runValidators: true},
								function (err, updatedUser) {
									if (err) {
										return res.status(500).json({error: err});;
									} else {
										res.status(200).send();
									}
							});
						}
					});
				}
			});
		}
	})
};

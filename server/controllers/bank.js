'use strict'

const AuthController = require('./authentication'),
	  bluebird = require('bluebird'),
	  config = require('../config/main'),
	  _ = require('lodash'),
	  transactionParser = bluebird.promisifyAll(require('./transactionParser')),
	  User = require('../models/user'),
	  plaid = require('plaid'),
	  moment = require('moment'),
	  stripe = require("stripe")(config.stripe.secret);

exports.getPlaidConfig = function (req, res) {
	 return res.status(200).json({public: config.plaid.public});
}

exports.findEligibleAccounts = function () {
	var cutoff = moment().startOf('day').subtract(3, 'days');
	console.log('finding usres');
	User.find({
	  'stripe.lastCharge': {
	    $lte: cutoff.toDate(),
	  }
	}, function (err, users) {
		let newCharges = {};
		_.each(users, function (user) {
			transactionParser.getBasicUserInfo(user.stripe).then(function (basicUserInfo) {
				var amountToExtract = transactionParser.getDecisionInfo(basicUserInfo)
				console.log('wow, fun', amountToExtract);
			})
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

	plaidClient.exchangeToken(public_token, account_id, function (err, exchangeTokenRes) {
		if (!!err) {
			return res.status(500).json({error: err});;
		} else {

			const accessToken = exchangeTokenRes.access_token;
			const stripeBankToken = exchangeTokenRes.stripe_bank_account_token;

			plaidClient.upgradeUser(accessToken, 'connect', {}, function (err, response) {
				if (!!err) {
					return res.status(500).json({error: err});;
				} else {
					stripe.customers.create({
					  	source: stripeBankToken,
					  	description: "Example customer"
					}, function(err, customer) {
						if (err) {
							return res.status(500).json({error: err});;
						} else {
							const stripeInfo = {
								customerId: customer.id,
								stripeBankToken: stripeBankToken,
								accountId: account_id,
								accessToken: accessToken,
								lastCharge: new Date()
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
										return res.status(200).send("success!");
									}
							});
						}
					});
				}
			});
		}
	})
};



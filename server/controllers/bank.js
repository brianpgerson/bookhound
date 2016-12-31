const AuthController = require('./authentication'),
	  config = require('../config/main'),
	  _ = require('lodash'),
	  plaid = require('plaid'),
	  stripe = require("stripe")(config.stripe.secret);

exports.getPlaidConfig = function (req, res) {
	 return res.status(200).json({public: config.plaid.public});
}

exports.exchange = function (req, res) {
	const conf = config.plaid;
	const public_token = req.body.token;
	const account_id = req.body.metadata.account_id

	const plaidClient = new plaid.Client(
		conf.client,
		conf.secret,
		plaid.environments.tartan);

	console.log('made plaid');

	AuthController.me(req).then(function (currentUser) {
		console.log('got me', currentUser);

	    const userId = currentUser._id;

		plaidClient.exchangeToken(public_token, account_id, function (err, exchangeTokenRes) {
			console.log('got token', exchangeTokenRes);

			if (!!err) {
				return res.status(500).json({error: err});;
			} else {
				const accessToken = exchangeTokenRes.access_token;
				const stripeBankToken = exchangeTokenRes.stripe_bank_account_token;


				stripe.customers.create({
				  	source: stripeBankToken,
				  	description: "Example customer"
				}, function(err, customer) {
					console.log('stripe', arguments);

					if (err) {
						return res.status(500).json({error: err});;
					} else {
						const stripeInfo = {
							customerId: customer.id,
							accountId: stripeBankToken
						};

						currentUser.stripe = stripeInfo;
						currentUser.save(function (err, updatedUser) {
							if (err) {
								return res.status(500).json({error: err});;
							} else {
								return res.status(200).send("success!");
							}
						})
					}
				});
			}
		});
	})
};



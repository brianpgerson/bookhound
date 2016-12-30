const Bank = require('../models/bank');
const AuthController = require('./authentication');
const config = require('../config/main');
const _ = require('lodash');
const plaid = require('plaid');

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

	AuthController.me(req).then(function (currentUser) {
	    const userId = currentUser._id;

		plaidClient.exchangeToken(public_token, account_id, function (err, exchangeTokenRes) {
			if (!!err) {
				return res.status(500).json({error: err});;
			} else {
				let newBank = new Bank({
					userId: userId,
					accessToken: exchangeTokenRes.access_token,
					stripeAccessToken: exchangeTokenRes.stripe_bank_account_token,
					accountId: account_id });

				console.log(newBank)

				newBank.save().then(bank => {
					console.log(bank);
				}).catch(err => {
					console.log(err);
				});
			}
		});
	})
};



'use strict'

const Promise = require('bluebird'),
       config = require('../config/main'),
            _ = require('lodash'),
   BankService = Promise.promisifyAll(require('../services/bank.service')),
PurchaseService = Promise.promisifyAll(require('../services/purchase.service')),
	  			User = require('../models/user'),
	  		Purchase = require('../models/purchase'),
	  		  Charge = require('../models/charge'),
	  		   plaid = Promise.promisifyAll(require('plaid')),
	  	      moment = require('moment'),
	  	      logger = require('../config/logger'),
	  	      stripe = Promise.promisifyAll(require("stripe")(config.stripe.secret)),
	     plaidClient = new plaid.Client(config.plaid.client, config.plaid.secret, config.plaid.public, plaid.environments.development);

exports.getPlaidConfig = function (req, res) {
	 res.status(200).json({public: config.plaid.public});
}

exports.refund = function (req, res) {
	let refundRequest = req.body;
	let currentUser = req.currentUser;

	return Charge.findById(refundRequest.id).then(charge => {
		return stripe.refunds.create({charge: charge.chargeId}).then(ref => {
			console.log('RESPONSE: ', ref);
			if (ref.status === 'succeeded' || ref.status === 'pending') {
				charge.refund.amount = ref.amount;
				charge.refund.date = new Date();
				currentUser.stripe.balance -= ref.amount;
				return User.findOneAndUpdate({_id: currentUser._id}, currentUser, {new: true})
					.then(user => {
						Charge.findOneAndUpdate({_id: refundRequest.id}, charge).then(charge => {
							res.status(200).json({newBalance: user.stripe.balance, id: refundRequest.id});
						});
					});
			}
		}).catch(err => {
			res.status(500).json({error: `error creating refund: ${err}`});	
		});

	});


}

exports.findEligibleAccountsToCharge = function () {
	const cutoff = moment().startOf('day').subtract(2, 'days');
	logger.info('Finding users to charge');

	User.find({'stripe.lastCharge': {$lte: cutoff.toDate()}})
		.populate('stripe.charges wishlist.items')
		.then(users => {
      logger.info(`found ${users.length} users to charge`);
			_.each(users, (user) => {
        logger.info(`checking purchases and conditionally charging ${user.email}`);
				return Purchase.find({userId: user._id})
          .then(purchases => checkPurchasesAndCharge(purchases, user))
          .catch(err => logger.info(`couldn't check purchases or charge ${user}. Error: ${err}`));
			});
		}).catch(err => {
			logger.info('Error finding eligible accounts to charge', err);
		});
}

const checkPurchasesAndCharge = (purchases, user) => {
	let items = user.wishlist.items;
	if (items.length === 0) {
		logger.info(`User ${user._id} has no wishlist items!`);	
		return;
	}

	let thisMonthsPurchases = _.filter(purchases, (p) => moment(p.createdAt).isAfter(moment().startOf('month')))
	let maxOrders = user.wishlist.maxMonthlyOrderFrequency;
	if (thisMonthsPurchases.length && thisMonthsPurchases < maxOrders) {
		logger.info(`User ${user._id} has purchased the max amount for this month!`);	
		return;
	}
	let unpurchased = getUnpurchased(items, purchases);
	if (unpurchased.length === 0) {
		logger.info(`User ${user._id} has no remaining items that haven't been purchased!`);
	}

	return BankService.processUser(user, unpurchased);
}

const getUnpurchased = (want, bought) => {
	let boughtIdSet = new Set(_.map(bought, (purchased) => purchased.productId));
	return _.filter(want, (item) => !boughtIdSet.has(item.productId));
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
					logger.info(`${user.profile.firstName} is ${qualified ? '' : 'not '}qualified`);
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
	  	description: `Another bookhound customer: ${currentUser.profile.firstName} ${currentUser.profile.lastName}`
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

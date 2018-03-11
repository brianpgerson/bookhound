'use strict'

const Promise = require('bluebird'),
       config = require('../config/main'),
         User = require('../models/user'),
  ZincService = require('zinc-fetch')(config.zinc),
     Purchase = require('../models/purchase'),
            _ = require('lodash');


exports.buyBook = function (user) {
    const candidates = purchasableBooks(user.wishlist.items, user.stripe.balance, config.defray);
    const bookToBuy = _.sample(candidates);
    const orderObj = createOrderObject(user, bookToBuy);
    ZincService.order.create(orderObj)
        .then(res => {
            logger.log(res);
            let totalCost = config.defray + bookToBuy.price + bookToBuy.shipping;
            let remainingBalance = user.stripe.balance - totalCost;
            
            user.stripe.balance = remainingBalance;
            User.findOneAndUpdate({_id: user._id}, user, {runValidators: true})
                .catch(err => logger.error(`Couldn't update user: ${user._id}`));

            let purchase = new Purchase({
                userId: user._id,
                productId: bookToBuy.productId,
                requestId: res.request_id,
                title: bookToBuy.title,
                price: totalCost
            });

            purchase.save()
                .then(success => logger.log(`Successfully completed purchase: ${purchase}`))
                .catch(err => logger.error(`Error completing purchase: ${err}`));

        }).catch(err => logger.error(`Error creating Zinc order for ${bookToBuy}: ${err}`));
}

function createOrderObject(user, bookToBuy) {
    const preferences = user.wishlist.preferences;
    const conditions = _.map(_.filter(_.keys(preferences), pref => preferences[pref]), (pref) => _.upperFirst(pref));
    const shippingMethod = bookToBuy.shipping > 0 ? 'cheapest' : 'free';

    return {
        retailer: 'amazon',
        products: [{
            product_id: bookToBuy.productId,
            quantity: 1,
            seller_selection_criteria: {
                condition_in: conditions
            }
        }],
        shipping_address: {
            first_name: user.profile.firstName,
            last_name: user.profile.lastName,
            address_line1: user.address.streetAddressOne,
            address_line2: user.address.streetAddressTwo,
            zip_code: user.address.zip,
            city: user.address.city,
            state: user.address.state,
            country: 'US',
            phone_number: config.billing.address.phone_number
        },
        shipping_method: shippingMethod,
        billing_address: config.billing.address,
        retailer_credentials: config.billing.retailer_credentials,
        payment_method: config.billing.payment_method,
        max_price: user.stripe.balance
    }
}

exports.qualifyPurchaser = function (user, startOfMonth) {
    const _this = this;
    const maxOrders = user.wishlist.maxMonthlyOrderFrequency;
    return Purchase.find({updatedAt : { $gte: startOfMonth} }).then((purchases) => {
        if (purchases.length < maxOrders) {
            const wishlist = user.wishlist;
            if (_.isUndefined(wishlist) || _.isNull(wishlist)) {
                return false;
            } else {
                return purchasableBooks(wishlist.items, user.stripe.balance, config.defray)
                    .then(purchasable => purchasable.length > 0);
            }
                
        }
    });
}

const purchasableBooks = (candidates, balance, defray) => {
    return Promise.filter(candidates, (b) => {
        return Purchase.find({productId: b.productId, userId: b._creator}).then(purchased => {
            return (b.price + b.shipping + defray < balance) && (!purchased || purchased.length === 0);
        })
    });
};

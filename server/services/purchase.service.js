'use strict'

const Promise = require('bluebird'),
       config = require('../config/main'),
       logger = require('../config/logger'),
         User = require('../models/user'),
  ZincService = require('zinc-fetch')(config.zinc),
     Purchase = require('../models/purchase'),
        Order = require('../models/order'),
            _ = require('lodash');


const second = 1000;
const minute = second * 60;
const waitingRequests = {};

function isValid(book) {
    let requiredFields = ['shipping', 'price', 'productId'];
    return !_.isUndefined(book) && !_.some(requiredFields, field => _.isUndefined(book[field]));
}

exports.orderRequestPoller = function () {
    Order.find({status: 'IN_PROGRESS'}).then(orders => {
        _.each(orders, order => {
            let orderId = order.orderId;
           
            if (_.isUndefined(waitingRequests[orderId])) {
                logger.info('polling for order', order);
               
                // create the poller
                let waitingOrder = setInterval(() => {
                    waitForResponse(order);
                }, 10 * second);

                // save reference to the poller
                waitingRequests[orderId] = waitingOrder;

                // prepare ten minute timeout to kill the poller and set the order object to FAILED
                setTimeout(() => {
                    if (waitingRequests[orderId]) {
                        clearForId(orderId);
                    }
                }, 10 * minute);
            }
        })
    }).catch(err => logger.error(`Couldn't find orders. Error: ${err}`))
}

exports.buyBook = function (user) {
    Purchase.find({userId: user._id}).then(purchased => {
        let candidates = purchasableBooks(user.wishlist.items, purchased, user.stripe.balance, parseInt(config.defray, 10));
        const bookToBuy = _.sample(candidates);

        if (!isValid(bookToBuy)) {
            logger.error(`Something went wrong when finding a book for user ${user._id} and bookToBuy ${bookToBuy}`);
            return;
        }
        const orderObj = createOrderObject(user, bookToBuy);

        ZincService.order.create(orderObj).then(res => {
            let order = new Order({
                _creator: user._id,
                orderId: res.request_id,
                title: bookToBuy.title,
                productId: bookToBuy.productId,
                totalCost: parseInt(config.defray, 10) + bookToBuy.price + bookToBuy.shipping,
                status: 'IN_PROGRESS'
            });

            order.save()
                .then(success => logger.log(`Queued order ${order.orderId}`))
                .catch(err => logger.error(`Error queuing order: ${order.orderId}. Error: ${err}`));
        }).catch(err => logger.error(`Error creating Zinc order for ${bookToBuy.title}: ${err}`));
    });
}

function clearForId (reqId, success) {
    let status = success ? 'COMPLETE' : 'FAILED';

    Order.findOneAndUpdate({orderId: reqId}, {$set:{'status': status}}, {runValidators: true})
        .then(() => {
            clearInterval(waitingRequests[reqId]);
            delete waitingRequests[reqId];
        }).catch(err => logger.error(`Error updating order: ${reqId}. Error: ${err}`));
}

function waitForResponse (order) {
    let reqId = order.orderId;
    ZincService.order.retrieve(reqId).then(res => {
        if (res._type === 'error') {
            if (res.code === 'request_processing') {
                logger.info(`Still processing order ${reqId}.`)
            } else {
                logger.error(`Order ${reqId} failed! Error: ${res.code}. Data: ${res.data}`);
                clearForId(reqId);
            }
        } else if (res._type === 'order_response') {
            logger.info(`Order ${reqId} finished. Handling success.`)
            handleSuccess(order, res);
        }
    })
}

function handleSuccess(order, res) {
    let totalCost = order.totalCost;
    let reqId = order.reqId;

    let costViaZinc = parseInt(config.defray, 10) + res.price_components.total;

    if (totalCost != costViaZinc) {
        logger.error(`Cost reported by Zinc was different than cost calculated by bookhound! Zinc: ${costViaZinc}, bookhound: ${totalCost}, order: ${reqId}`)
        totalCost = costViaZinc;
    }

    User.findById(order._creator).then(user => {
        let remainingBalance = user.stripe.balance - totalCost;
    
        user.stripe.balance = remainingBalance;
        User.findOneAndUpdate({_id: user._id}, user, {runValidators: true})
            .then(() => {})
            .catch(err => logger.error(`Couldn't update user: ${user._id}`));

        let purchase = new Purchase({
            userId: user._id,
            productId: order.productId,
            title: order.title,
            requestId: reqId,
            price: totalCost
        });

        clearForId(reqId, true);

        purchase.save()
            .then(success => logger.log(`Successfully completed purchase: ${purchase}`))
            .catch(err => logger.error(`Error completing purchase: ${err}`));
    }).catch(err => logger.error(`Couldn't find user: ${order._creator}, error: ${err}`));
}

function createOrderObject(user, bookToBuy) {
    const preferences = user.wishlist.preferredConditions;
    let conditions = [];
    
    if (preferences.new) {
        conditions.push('New');
    } 

    if (preferences.used) {
        conditions = conditions.concat(['Refurbished', 'Used - Like New', 'Used - Very Good', 'Used - Good', 'Used - Acceptable']);
    }
    const shippingMethod = bookToBuy.shipping > 0 ? 'cheapest' : 'free';

    return {
        retailer: 'amazon',
        products: [{
            product_id: 'bookfun',
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
                return purchasableBooks(wishlist.items, purchases, user.stripe.balance, parseInt(config.defray, 10)).length > 0
            }
        }
    });
}

const purchasableBooks = (candidates, purchased, balance, defray) => {
    return _.filter(candidates, (b) => {
        let alreadyPurchased = _.some(purchased, purchase => purchase.productId === b.productId);
        let hasEnoughToBuyBook = ((b.price + b.shipping + defray) < balance);

        return (hasEnoughToBuyBook) && !alreadyPurchased;
    });
};

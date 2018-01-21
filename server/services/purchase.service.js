'use strict'

const Promise = require('bluebird'),
       config = require('../config/main'),
  ZincService = require('zinc-fetch')(config.zinc),
     Purchase = require('../models/purchase'),
            _ = require('lodash');


exports.buyBook = function (user) {
    const candidates = purchasableBooks(user.wishlist.items);
    const bookToBuy = _.sample(candidates);
    
}

exports.qualifyPurchaser = function (user, startOfMonth) {
    const _this = this;
    const maxOrders = user.wishlist.maxMonthlyOrderFrequency;
    return Purchase.find({updatedAt : { $gte: startOfMonth} }).then((purchases) => {
        if (purchases.length < maxOrders) {
            const defray = 1.5;
            const wishlist = user.wishlist;
            return _.isUndefined(wishlist) || _.isNull(wishlist) ? 
                false : purchasableBooks(wishlist.items).length > 0;
                
        }
    });
}

const purchasableBooks = (candidates) => _.filter(wishlist.items, (b) => b.price + b.shipping + defray < user.balance);

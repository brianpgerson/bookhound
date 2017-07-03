'use strict'

const Promise = require('bluebird'),
  ZincService = require('zinc-fetch'),
     Purchase = require('../models/purchase'),
            _ = require('lodash');


exports.buyBooks = function (user, candidates) {
    console.log(candidates);
}

exports.qualifyPurchaser = function (user, startOfMonth) {
    const _this = this;

    Purchase.find({updatedAt : { $gte: startOfMonth} }).then((purchases) => {
        if (purchases.length < preferences.maxMonthlyOrderFrequency) {
            const wishlist = user.wishlist;
            if (wishlist) {
                const candidates = _.filter(wishlist.items, (item) => {
                    item.price + item.shipping + 1.5 < user.balance;
                });
                if (!_.isEmpty(candidates)) {
                    _this.buyBook(user, candidates);
                }
            }
        }
    });
}

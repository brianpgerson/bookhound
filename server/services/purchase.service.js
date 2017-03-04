'use strict'

const Promise = require('bluebird'),
  ZincService = Promise.promisifyAll(require('./zinc.service')),
     Purchase = require('../models/purchase'),
  Preferences = require('../models/preferences'),
     Wishlist = require('../models/wishlist').Wishlist,
            _ = require('lodash');


exports.buyBooks = function (user, candidates) {
    console.log(candidates);
}

exports.qualifyPurchaser = function (user, startOfMonth) {
    const promisifiedPurchases = Purchase.find({updatedAt : { $gte: startOfMonth} }).exec();
    const promisifiedPreferences = Preferences.find({userId: user._id}).exec();
    const _this = this;

    Promise.all([promisifiedPurchases, promisifiedPreferences])
    .spread((purchases, preferences) => {
        if (purchases.length < preferences.maxMonthlyOrderFrequency) {
            Wishlist.findOne({userId: user._id}).then(wishlist => {
                if (wishlist) {
                    const candidates = _.filter(wishlist.items, (item) => {
                        item.price + item.shipping + 1.5 < user.balance;
                    });
                    if (!_.isEmpty(candidates)) {
                        _this.buyBook(user, candidates);
                    }
                }
            });
        }
    });
}

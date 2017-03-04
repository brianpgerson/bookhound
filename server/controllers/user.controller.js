'use strict'

const AuthController = require('./authentication.controller'),
                User = require('../models/user'),
             Address = require('../models/address'),
            Wishlist = require('../models/wishlist').Wishlist,
         Preferences = require('../models/preferences'),
                   _ = require('lodash'),
              moment = require('moment'),
             Promise = require("bluebird");

//= =======================================
// User Routes
//= =======================================
exports.getSetup = function (req, res) {
    const currentUser = req.user;
    let userSetup = _.assign({}, {user: _.pick(currentUser, ['email', 'profile'])});
    const userId = currentUser._id.toString();
    const date = moment(currentUser.lastCharge);

    let promisifiedAddress = Address.findOne({userId: userId}).exec();
    let promisifiedWishlist = Wishlist.findOne({userId: userId}).exec();
    let promisifiedPreferences = Preferences.findOne({userId: userId}).exec();

    Promise.all([promisifiedAddress, promisifiedWishlist, promisifiedPreferences])
        .spread((address, wishlist, preferences) => {
            userSetup.address = _.pick(address, ['streetAddressOne', 'streetAddressTwo', 'state', 'city', 'zip']);
            userSetup.wishlist = wishlist;
            userSetup.bank = !!currentUser.stripe.customerId;
            userSetup.preferences = _.pick(preferences, ['preferredConditions', 'maxMonthlyOrderFrequency']);
            res.status(200).json(userSetup);
    });
};
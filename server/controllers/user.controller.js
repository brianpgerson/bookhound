'use strict'

const AuthController = require('./authentication.controller'),
                User = require('../models/user'),
                   _ = require('lodash'),
              moment = require('moment'),
             Promise = require("bluebird");

//= =======================================
// User Routes
//= =======================================
exports.getSetup = function (req, res) {
    const currentUser = req.user;
    const userId = currentUser._id.toString();
    const date = moment(currentUser.lastCharge);
    
    let userSetup = _.assign({}, {user: _.pick(currentUser, ['email', 'profile'])});
    userSetup.address = _.pick(currentUser.address, ['streetAddressOne', 'streetAddressTwo', 'state', 'city', 'zip']);
    userSetup.wishlist = currentUser.wishlist;
    userSetup.bank = !!currentUser.stripe.customerId;

    res.status(200).json(userSetup);
};

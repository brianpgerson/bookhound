'use strict'

const AuthController = require('./authentication.controller'),
                User = require('../models/user'),
              Charge = require('../models/charge'),
            Purchase = require('../models/purchase'),
                   _ = require('lodash'),
              moment = require('moment'),
             Promise = require("bluebird");

//= =======================================
// User Routes
//= =======================================
exports.getSetup = function (req, res) {
    const currentUser = req.currentUser;
    const userId = currentUser._id.toString();
    const date = moment(currentUser.lastCharge);
    
    let userSetup = _.assign({}, {user: _.pick(currentUser, ['email', 'profile'])});

    Purchase.find({userId: userId}).then(purchases => {
        Charge.find({_creator: userId}).then(charges => {
            userSetup.address = _.pick(currentUser.address, ['streetAddressOne', 'streetAddressTwo', 'state', 'city', 'zip']);
            userSetup.wishlist = currentUser.wishlist;
            userSetup.purchases = purchases;
            userSetup.charges = _.map(charges, charge => _.pick(charge, ['amount', 'id', 'createdAt', 'refund']));
            userSetup.bank = {
                connected: !!currentUser.stripe.customerId,
                balance: currentUser.stripe.balance
            };
        
            res.status(200).json(userSetup);
        });
    });

};

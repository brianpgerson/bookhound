'use strict'

const WishlistService = require('../services/wishlist.service'),
             Wishlist = require('../models/wishlist').Wishlist,
           Preference = require('../models/preferences'),
       AuthController = require('./authentication.controller'),
       AmazonWishlist = require('amazon-wish-list'),
                    _ = require('lodash');

exports.saveWishlist = function (req, res, next) {

    const currentUser = req.currentUser;
    let wishlist = WishlistService.getWishlist(req.body);

    if (!wishlist.id) {
        res.status(422).send({ error: 'Wishlist URL is invalid' });
        return;
    }

    WishlistService.saveWishlist(wishlist, currentUser, res);
}

exports.updateWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let newWishlist = WishlistService.getWishlist(req.body);

    if (!newWishlist.id) {
        res.status(422).send({ error: 'Wishlist is invalid' });
        return;
    }

    WishlistService.updateWishlist(newWishlist, currentUser, res);
};

'use strict'

const         Promise = require('bluebird'),
      WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
       AmazonWishlist = require('amazon-wish-list'),
                  aws = new AmazonWishlist.default('com'),
             Wishlist = require('../models/wishlist').Wishlist,
           Preference = require('../models/preferences'),
       AuthController = require('./authentication.controller'),
                    _ = require('lodash');

exports.saveWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let wishlist = WishlistService.getWishlist(req.body);

    if (!wishlist.id) {
        res.status(422).send({ error: 'Wishlist URL is invalid' });
        return;
    }

    aws.getById(wishlist.id).then(list => {
        if (!list) {
            throw new Error(`Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?`);
            return;
        }

        WishlistService.saveWishlist(wishlist, list, currentUser).then(wishlist => {
            console.log('saved it!', wishlist);
            res.status(200).json({wishlist: wishlist});
        }).catch(err => {
            res.status(500).json({error: err});
        });
    });
}

exports.refreshWishlistItems = function (req, res, next) {
    const currentUser = req.currentUser;
    let reqWishlist = WishlistService.getWishlist(req.body);

    if (!reqWishlist.id) {
        res.status(422).send({ error: 'Wishlist is invalid' });
        return;
    }

    Wishlist.findOne({id: reqWishlist.id}).then(wishlist => {
        WishlistService.refreshWishlistItemPrices(wishlist, currentUser).then(udpatedWishlist => {
            res.status(200).send({wishlist: udpatedWishlist});
        }).catch(error => {
            res.status(500).send({error: error});
        });
    });
};

exports.updateWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let newWishlist = WishlistService.getWishlist(req.body);

    if (!newWishlist.id) {
        res.status(422).send({ error: 'Wishlist is invalid' });
        return;
    }

    aws.getById(newWishlist.id).then(list => {
        if (!list) {
            throw new Error(`Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?`);
            return;
        }

        WishlistService.updateWishlist(newWishlist, list, currentUser).then(wishlist => {
            res.status(200).json({wishlist: wishlist});
        }).catch(err => {
            res.status(500).json({error: err});
        });
    });
};

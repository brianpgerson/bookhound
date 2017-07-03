'use strict'

const         Promise = require('bluebird'),
      WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
       AmazonWishlist = require('amazon-wish-list'),
    AmazonListScraper = require('amazon-list-scraper'),
                  als = new AmazonListScraper(),
                  aws = new AmazonWishlist.default('com'),
       AuthController = require('./authentication.controller'),
                    _ = require('lodash');

exports.saveWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let wishlist = WishlistService.getWishlist(req.body);

    if (!wishlist.id) {
        res.status(422).send({ error: 'Wishlist URL is invalid' });
        return;
    }

    als.scrape(wishlist.id).then(list => {
        if (!list) {
            throw new Error(`Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?`);
            return;
        }

        WishlistService.saveWishlist(wishlist, list, currentUser).then(user => {
            res.status(200).json({wishlist: user.wishlist});
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

    WishlistService.refreshWishlistItemPrices(currentUser.wishlist).then(refreshedWishlistItems => {
        const refreshedWishlist = currentUser.wishlist;
        refreshedWishlist.items = refreshedWishlistItems;
        res.status(200).send({wishlist: refreshedWishlist});
    }).catch(error => {
        res.status(500).send({error: error});
    });
};

exports.updateWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let newWishlist = WishlistService.getWishlist(req.body);

    if (!newWishlist.id) {
        res.status(422).send({ error: 'Wishlist is invalid' });
        return;
    }

    als.scrape(newWishlist.id).then(list => {
        if (!list) {
            throw new Error(`Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?`);
            return;
        }

        WishlistService.updateWishlist(newWishlist, list, currentUser).then(user => {
            res.status(200).json({wishlist: user.wishlist});
        }).catch(err => {
            res.status(500).json({error: err});
        });
    }).catch(err => {
        console.error(err);
    })
};

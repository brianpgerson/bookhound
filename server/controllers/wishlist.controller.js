'use strict'

const         Promise = require('bluebird'),
      WishlistService = Promise.promisifyAll(require('../services/wishlist.service')),
                 User = require('../models/user'),
               logger = require('../config/logger'),
    AmazonListScraper = require('amazon-list-scraper'),
                  als = new AmazonListScraper(),
       AuthController = require('./authentication.controller'),
                    _ = require('lodash');

exports.saveWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let wishlist = WishlistService.getWishlist(req.body);

    if (!wishlist.url) {
        res.status(422).send({ error: 'Wishlist URL is invalid' });
        return;
    }

    als.scrape(wishlist.url).then(list => {
        if (!list) {
            throw new Error(`Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?`);
            return;
        }

        list = _.filter(list, item => {
            return _.isFinite(item.price);
        });

        WishlistService.saveWishlist(wishlist, list, currentUser).then(user => {
            res.status(200).json({wishlist: user.wishlist});
        }).catch(err => {
            res.status(500).json({error: err});
        });
    });
}

exports.refreshWishlistItems = function (req, res, next) {
    const currentUser = req.currentUser;
    const refreshed = {
        url: currentUser.wishlist.url,
        preferredConditions: currentUser.wishlist.preferredConditions,
        maxMonthlyOrderFrequency: currentUser.wishlist.maxMonthlyOrderFrequency
    };

    scrapeAndUpdate(refreshed, currentUser, res)
};

exports.updateWishlist = function (req, res, next) {
    const currentUser = req.currentUser;
    let newWishlist = WishlistService.getWishlist(req.body);

    if (!newWishlist.url) {
        res.status(422).send({ error: 'Wishlist is invalid' });
        return;
    }

    scrapeAndUpdate(newWishlist, currentUser, res)
};

exports.scrapeWishlist = (wishlistUrl) => {
    return als.scrape(wishlistUrl);
}

function scrapeAndUpdate(wishlist, currentUser, res) {
    als.scrape(wishlist.url).then(scrapedList => {
        if (!scrapedList) {
            res.status(500).json({error: `Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?`});
            return
        }

        scrapedList = _.filter(scrapedList, item => {
            return _.isFinite(item.price);
        });

        WishlistService.removeOldItems(currentUser).then(() => {
            WishlistService.updateWishlist(wishlist, scrapedList, currentUser).then(user => {
                res.status(200).json({wishlist: user.wishlist});
            }).catch(err => {
                res.status(500).json({error: err});
            });
        })
    }).catch(err => logger.error(`Error with scraping amazon: ${err}`));
}



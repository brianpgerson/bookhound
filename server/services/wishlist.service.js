'use strict'

const   Promise = require('bluebird'),
         config = require('../config/main'),
         logger = require('../config/logger'),
    ZincService = require('zinc-fetch')(config.zinc),
   WishlistItem = require('../models/wishlist-item'),
              _ = require('lodash');

exports.getWishlist = function (requestBody) {
    let wishlistUrl = requestBody.wishlistUrl;
    return {
        url: wishlistUrl,
        preferredConditions: requestBody.preferredConditions,
        maxMonthlyOrderFrequency: requestBody.maxMonthlyOrderFrequency
    };
}

exports.getWishlistItems = function (list, userId) {
    return Promise.mapSeries(list, (item) => {
        let newItem = new WishlistItem({
            _creator: userId,
            productId: item.link.split('/')[4],
            title: item.title,
            link: item.link,
            price: item.price,
            shipping: 0
        });
        return newItem.save();
    });
}

exports.saveWishlist = function (wishlist, list, currentUser) {
    return this.getWishlistItems(list, currentUser._id).then(items => {
        wishlist.items = items;    
        currentUser.wishlist = wishlist;

        if (_.isEmpty(currentUser.wishlist.items)) {
            return currentUser.save();
        } else {
            return this.refreshWishlistItemPrices(currentUser.wishlist)
                .then(refreshedItems => {
                    currentUser.wishlist.items = refreshedItems;
                    return currentUser.save();
                });
        }
    });
}

exports.removeOldItems = function (currentUser) {
    return WishlistItem.find({_creator: currentUser._id}).then(items => {
        _.forEach(items, item => item.remove())
    });
}

exports.updateWishlist = function (newWishlist, listOfItems, currentUser) {
    return this.getWishlistItems(listOfItems, currentUser._id).then(items => {
        let preferences = {
            new: newWishlist.preferredConditions.new,
            used: newWishlist.preferredConditions.used,
        }

        currentUser.wishlist = newWishlist;
        currentUser.wishlist.items = items;
        currentUser.wishlist.preferredConditions = preferences;
        
        if (_.isEmpty(items)) {
            return currentUser.save();
        } else {
            return this.refreshWishlistItemPrices(currentUser.wishlist).then(refreshedItems => {
                    currentUser.wishlist.items = refreshedItems;
                    return currentUser.save();
                });
        }
    })
}

exports.refreshWishlistItemPrices = function (wishlist) {
    return Promise.mapSeries(wishlist.items, (item) => {
        return findCheapestPrice(item, wishlist).then(cheapestOffer => {
            if (!cheapestOffer) {
                item.unavailable = true;
            } else {
                item.price = cheapestOffer.price;
                item.shipping = cheapestOffer.ship_price;
                item.merchantId = cheapestOffer.merchantId;
            }
            return item.save();
        });
    })
}

function findCheapestPrice (item, wishlist) {
    return ZincService.product.getPrices(item.productId)
        .then(response => {
            logger.info('findCheapestPrice() got offers for ', item.title)
            let cheapestOffer = false;
            return Promise.each(response.offers, (candidateOffer) => {
                candidateOffer.price = Math.round(candidateOffer.price * 100);
                candidateOffer.ship_price = Math.round(candidateOffer.ship_price * 100);

                if (suitableCondition(candidateOffer, wishlist) && isCheaper(candidateOffer, cheapestOffer)) {
                    cheapestOffer = candidateOffer;
                }
        }).then(resolved => {
            logger.info('done with', item.title)
            return cheapestOffer;
        }).catch(err => {
            logger.error('an err', err)
            return null;
        });
    });
}

function isCheaper(candidateOffer, currentCheapest) {
    return (!currentCheapest || (currentCheapest.price + currentCheapest.ship_price) >= (candidateOffer.price + candidateOffer.ship_price));
};

function suitableCondition(offer, wishlist) {
    const offerCondition = _.lowerCase(_.first(_.get(offer, 'condition', 'new').split(' ')));
    return wishlist.preferredConditions[offerCondition];
};

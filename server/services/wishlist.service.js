'use strict'

const   Promise = require('bluebird'),
   WishlistItem = require('../models/wishlist-item'),
    ZincService = require('zinc-fetch'),
              _ = require('lodash');

exports.getWishlist = function (requestBody) {
    let wishlistUrl = requestBody.wishlistUrl;
    return {
        id: wishlistUrl,
        preferredConditions: requestBody.preferredConditions,
        maxMonthlyOrderFrequency: requestBody.maxMonthlyOrderFrequency
    };
}

exports.getWishlistItems = function (list, userId) {
    return _.map(list, (item) => {
        return new WishlistItem({
            _creator: userId,
            productId: item.link.split('/')[4],
            title: item.title,
            link: item.link,
            price: item.price,
            shipping: 0
        });
    });
}

exports.saveWishlist = function (wishlist, list, currentUser) {
    wishlist.items = this.getWishlistItems(list, currentUser._id);
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
}

exports.updateWishlist = function (newWishlist, list, currentUser) {
    newWishlist.items = this.getWishlistItems(list);
    currentUser.wishlist = newWishlist;
    if (_.isEmpty(newWishlist.items)) {
        return currentUser.save();
    } else {
        return this.refreshWishlistItemPrices(currentUser.wishlist).then(refreshedItems => {
                currentUser.wishlist.items = refreshedItems;
                return currentUser.save();
            });
    }
}

exports.refreshWishlistItemPrices = function (wishlist) {
    return Promise.mapSeries(wishlist.items, (item) => {
        return findCheapestPrice(item, wishlist).then(cheapestOffer => {
            console.log('cheapestOffer', cheapestOffer)
            if (!cheapestOffer) {
                item.unavailable = true;
            } else {
                item.price = cheapestOffer.price;
                item.shipping = cheapestOffer.ship_price;
                item.merchantId = cheapestOffer.merchantId;
            }
            return item;
        });
    })
}

function findCheapestPrice (item, wishlist) {
    console.log(ZincService.product);
    return ZincService.product.getPrices(item)
        .then(response => {
            console.log('a response!', response)
            let cheapestOffer = false;
            return Promise.each(response.offers, (candidateOffer) => {
                candidateOffer.price = Math.round(candidateOffer.price * 100);
                candidateOffer.ship_price = Math.round(candidateOffer.ship_price * 100);
                if (suitableCondition(candidateOffer, wishlist) && isCheaper(candidateOffer, cheapestOffer)) {
                    cheapestOffer = candidateOffer;
            }
        }).then(resolved => {
            return cheapestOffer;
        }).catch(err => console.log(err))
    }).catch(err => console.log(err));
}

function isCheaper(candidateOffer, currentCheapest) {
    return (!currentCheapest || (currentCheapest.price + currentCheapest.ship_price) > (candidateOffer.price + candidateOffer.ship_price));
};

function suitableCondition(offer, wishlist) {
    const offerCondition = _.lowerCase(_.first(_.get(offer, 'condition', 'new').split(' ')));
    return wishlist.preferredConditions[offerCondition];
};

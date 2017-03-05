'use strict'

const   Promise = require('bluebird'),
     Preference = require('../models/preferences'),
       Wishlist = require('../models/wishlist').Wishlist,
   WishlistItem = require('../models/wishlist').WishlistItem,
    ZincService = Promise.promisifyAll(require('./zinc.service')),
              _ = require('lodash');

exports.getWishlist = function (requestBody) {
    let wishlistUrl = requestBody.wishlistUrl;
    return {id: wishlistUrl.split('www.amazon.com/gp/registry/wishlist/')[1].split('/')[0]};
}

exports.getWishlistItems = function (list) {
    return _.map(list.items, (item) => {
        return new WishlistItem({
            productId: item.id,
            title: item.title,
            link: item.link,
            price: item.price,
            shipping: 0
        });
    });
}

exports.saveWishlist = function (wishlist, list, currentUser) {
    const _this = this;
    wishlist.items = this.getWishlistItems(list);
    wishlist.userId = currentUser._id;
    const newWishlist = new Wishlist(wishlist);
    return new Preference({userId: currentUser._id}).save().then(prefs => {
        if (_.isEmpty(newWishlist.items)) {
            return newWishlist.save().then(savedWishlist => savedWishlist);
        } else {
            return _this.refreshWishlistItemPrices(newWishlist, currentUser)
                .then(refreshedWishlist => refreshedWishlist);
        }
    });
}

exports.updateWishlist = function (newWishlist, list, currentUser) {
    const _this = this;

    newWishlist.items = this.getWishlistItems(list);

    if (_.isEmpty(newWishlist.items)) {
        return Wishlist.findOneAndUpdate(
            {userId: currentUser._id},
            newWishlist,
            {runValidators: true, new: true}).then(savedWishlist => savedWishlist);
    } else {
        return _this.refreshWishlistItemPrices(newWishlist, currentUser)
            .then(refreshedWishlist => refreshedWishlist);
    }
}

exports.refreshWishlistItemPrices = function (wishlist, user) {
    return Preference.findOne({userId: user.id}).then((preferences) => {
        return Promise.mapSeries(wishlist.items, (item) => {
            return findCheapestPrice(item, preferences).then(cheapestOffer => {
                item.price = cheapestOffer.price;
                item.shipping = cheapestOffer.ship_price;
                item.merchantId = cheapestOffer.merchantId;
                return item;
            });
        }).then((updatedWishlistItems) => {
            wishlist.items = updatedWishlistItems;
            return Wishlist.findOneAndUpdate(
                {userId: user._id},
                wishlist,
                {   runValidators: true,
                    new: true,
                    upsert: true
                }).then(updated => {
                    return updated;
                });
        });
    });
}

function findCheapestPrice (item, preferences) {
  return ZincService.product.getPrices(item)
    .then(response => {
        let cheapestOffer = false;
        return Promise.each(response.offers, (candidateOffer) => {
            candidateOffer.price = Math.round(candidateOffer.price * 100);
            candidateOffer.ship_price = Math.round(candidateOffer.ship_price * 100);
            if (suitableCondition(candidateOffer, preferences) && isCheaper(candidateOffer, cheapestOffer)) {
                cheapestOffer = candidateOffer;
            }
        }).then(resolved => cheapestOffer);
  });
}

function isCheaper(candidateOffer, currentCheapest) {
    return (!currentCheapest || (currentCheapest.price + currentCheapest.ship_price) > (candidateOffer.price + candidateOffer.ship_price));
};

function suitableCondition(offer, preferences) {
    const offerCondition = _.lowerCase(_.first(_.get(offer, 'condition', 'new').split(' ')));
    return preferences.preferredConditions[offerCondition];
};

'use strict'

const AmazonWishlist = require('amazon-wish-list'),
             Promise = require('bluebird'),
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

exports.saveWishlist = function (wishlist, currentUser, res) {
    aws.getById(wishlist.id).then(list => {
        if (!list) {
            res.status(500).send({ error: `Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?` });
            return;
        }

        wishlist.items = this.getWishlistItems(list);
        wishlist.userId = currentUser._id;
        const newWishlist = new Wishlist(wishlist);
        newWishlist.save().then(savedWishlist => {
            new Preference({userId: currentUser._id}).save(prefs => {
                res.status(201).json({
                    wishlist: savedWishlist
                });
            }).catch(err => {
                res.status(422).send({ error: err });
            });
        });
    }).catch(err => {
        res.status(500).send({error: err});
    });
}

exports.updateWishlist = function (newWishlist, currentUser, res) {
    const _this = this;
    const aws = new AmazonWishlist.default('com');
    aws.getById(newWishlist.id).then(list => {
        if (!list) {
            res.status(422).send({ error: `Couldn't access your wishlist at ${newWishlist.id}. Try again?` });
            return;
        }

        newWishlist.items = this.getWishlistItems(list);
        Wishlist.findOneAndUpdate(
            {userId: currentUser._id},
            newWishlist,
            {runValidators: true})
        .then(modifiedWishlist => {
            if (_.isEmpty(modifiedWishlist.items)) {
                res.status(201).json({
                    wishlist: refreshedWishlist
                });
            } else {
                _this.refreshWishlistItemPrices(modifiedWishlist, currentUser).then(refreshedWishlist => {
                    res.status(201).json({
                        wishlist: refreshedWishlist
                    });
                }).catch(err => {
                    res.status(500).send({error: err});
                });
            }
        }).catch(err => {
            res.status(422).send({error: err});
        });
    }).catch(err => {
        res.status(500).send({error: err});
    });
}

exports.refreshWishlistItemPrices = function (wishlist, user) {
    return Preferences.findOne({userId: user.id}).then((preferences) => {
        const items = wishlist.items;
        return Promise.each(items, (item) => {
            return WishlistService.findCheapestPrice(item, preferences).then(cheapestOffer => {
                item.price = cheapestOffer.price;
                item.shipping = cheapestOffer.ship_price;
                item.merchantId = cheapestOffer.merchantId;
                return item.save()
            });
        }).then(() => {
            return wishlist;
        });
    });
}

function findCheapestPrice (item) {
  return ZincService.product.getPrices(item)
    .then(response => {
        let cheapestOffer;
        _.forEach(response.offers, (offer) => {
            if (suitableConfition(offer, preferences) && isCheaper(offer, cheapestOffer)) {
                cheapestOffer = offer;
            }
        });
        return cheapestOffer;
  });
}

function isCheaper(candidateOffer, currentCheapest) {
    return (_.isUndefined(candidateOffer) || currentCheapest < (candidateOffer.price + candidateOffer.ship_price));
};

function suitableCondition(offer, preferences) {
    const offerCondition = _.lowerCase(_.first(_.get(offer, 'condition', 'new').split(' ')));
    return preferences.preferredConditions[offerCondition];
};

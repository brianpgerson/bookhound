'use strict'

const _ = require('lodash'),
      Promise = require('bluebird'),
      Wishlist = require('../models/wishlist').Wishlist,
      WishlistItem = require('../models/wishlist').WishlistItem,
      ZincService = Promise.promisifyAll(require('./zinc.service')),
      AmazonWishlist = require('amazon-wish-list');


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
            price: item.price
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
            if (err) {
                res.status(422).send({ error: err });
                return;
            }

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
    const aws = new AmazonWishlist.default('com');
    aws.getById(newWishlist.id).then(list => {
        if (!list) {
          res.status(500).send({ error: `Couldn't access your wishlist at ${newWishlist.id}. Try again?` });
          return;
        }

        newWishlist.items = this.getWishlistItems(list);
        Wishlist.findOneAndUpdate(
            {userId: currentUser._id},
            newWishlist,
            {runValidators: true})
        .then(modifiedWishlist => {
            res.status(201).json({
              wishlist: modifiedWishlist
            });
        }).catch(err => {
            res.status(422).send({error: err});
        });;
    }).catch(err => {
        res.status(500).send({error: err});
    });
}

exports.findCheapestPrice = function (item) {
  ZincService.product.getPrices(item)
  .then(response => {
    console.log(response)
  })
}

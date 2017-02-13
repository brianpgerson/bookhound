'use strict'

const Wishlist = require('../models/wishlist').Wishlist,
      WishlistService = require('../services/wishlist.service'),
      AuthController = require('./authentication.controller'),
      AmazonWishlist = require('amazon-wish-list'),
      _ = require('lodash');

exports.saveWishlist = function (req, res, next) {
  const aws = new AmazonWishlist.default('com');
  const currentUser = req.currentUser;
  let wishlist = WishlistService.getWishlist(req.body);

  if (!wishlist.id) {
    res.status(422).send({ error: 'Wishlist URL is invalid' });
    return;
  }

  aws.getById(wishlist.id).then(function (list) {
    if (!list) {
      res.status(500).send({ error: `Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?` });
      return;
    }

    wishlist.items = WishlistService.getWishlistItems(list);
    wishlist.userId = currentUser._id;
    const newWishlist = new Wishlist(wishlist);
    newWishlist.save((err, savedWishlist) => {
      if (err) {
        res.status(422).send({ error: err });
        return;
      }

      res.status(201).json({
        wishlist: savedWishlist
      });
    });
  });

}

exports.updateWishlist = function (req, res, next) {
  const aws = new AmazonWishlist.default('com');
  const currentUser = req.currentUser;
  let newWishlist = WishlistService.getWishlist(req.body);

  if (!newWishlist.id) {
    res.status(422).send({ error: 'Wishlist is invalid' });
    return;
  }

  aws.getById(newWishlist.id).then(function (list) {
    if (!list) {
      res.status(500).send({ error: `Couldn't access your wishlist at ${req.body.wishlistUrl}. Try again?` });
      return;
    }

    newWishlist.items = WishlistService.getWishlistItems(list);
    Wishlist.findOneAndUpdate(
      {userId: currentUser._id},
      newWishlist,
      {runValidators: true},
      function (err, modifiedWishlist) {
        if (err) {
          res.status(422).send({ error: 'Error saving wishlist' });
          return;
        }
        res.status(201).json({
          wishlist: modifiedWishlist
        });
    });
  });

};

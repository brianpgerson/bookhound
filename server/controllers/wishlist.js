'use strict'

const Wishlist = require('../models/wishlist');
const AuthController = require('./authentication');
const _ = require('lodash');

function getWishlist(requestBody) {
  let wishlistUrl = requestBody.wishlistUrl;
  return {id: wishlistUrl.split('www.amazon.com/gp/registry/wishlist/')[1].split('/')[0]};
}

exports.saveWishlist = function (req, res, next) {
  let wishlist = getWishlist(req.body);
  const currentUser = req.currentUser;

  if (!wishlist.id) {
    res.status(422).send({ error: 'Wishlist is invalid' });
    return;
  }

  wishlist.userId = currentUser._id;
  const newWishlist = new Wishlist(wishlist);

  newWishlist.save((err, savedWishlist) => {
    if (err) {
      return next(err);
    }

    res.status(201).json({
      wishlist: savedWishlist
    });
  });
}

exports.updateWishlist = function (req, res, next) {
  let newWishlist = getWishlist(req.body);
  const currentUser = req.currentUser;
  console.log('fun')

  if (!newWishlist.id) {
    res.status(422).send({ error: 'Wishlist is invalid' });
    return;
  }

  Wishlist.findOneAndUpdate(
    {userId: currentUser._id},
    newWishlist,
    {runValidators: true},
    function (err, modifiedWishlist) {
      if (err) {
        res.status(422).send({ error: 'Error saving wishlist' });
      } else {
        res.status(201).json({
          wishlist: modifiedWishlist
        });
      }
  });
};

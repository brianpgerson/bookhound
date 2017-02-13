'use strict'

const _ = require('lodash'),
      WishlistItem = require('../models/wishlist').WishlistItem;


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

exports.updatePrices = function (items) {
	//do the thing

}

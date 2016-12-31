const AuthController = require('./authentication');
const User = require('../models/user');
const Address = require('../models/address');
const Wishlist = require('../models/wishlist');
const _ = require('lodash');
const Promise = require("bluebird");

//= =======================================
// User Routes
//= =======================================
exports.getSetup = function (req, res) {
  AuthController.me(req).then(function (currentUser) {
    let userSetup = _.assign({}, {user: _.pick(currentUser, ['email', 'profile'])});
    const userId = currentUser._id.toString();

    let promisifiedAddress = Address.findOne({userId: userId}).exec();
    let promisifiedWishlist = Wishlist.findOne({userId: userId}).exec();

    Promise.all([promisifiedAddress, promisifiedWishlist])
      .spread((address, wishlist) => {
        userSetup.address = _.pick(address, ['streetAddressOne', 'streetAddressTwo', 'state', 'city', 'zip']);
        userSetup.wishlist = _.pick(wishlist, ['id']);
        userSetup.bank = !!currentUser.stripe.customerId;
        return res.status(200).json(userSetup);
      })
  });
};

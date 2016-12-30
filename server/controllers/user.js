const AuthController = require('./authentication');
      User = require('../models/user'),
      Address = require('../models/address'),
      Wishlist = require('../models/wishlist'),
      Bank = require('../models/bank'),
      _ = require('lodash'),
      Promise = require("bluebird");

//= =======================================
// User Routes
//= =======================================
exports.getSetup = function (req, res) {
  AuthController.me(req).then(function (currentUser) {
    let userSetup = _.assign({}, {user: _.pick(currentUser, ['email', 'profile'])});
    const userId = currentUser._id.toString();

    let promisifiedAddress = Address.findOne({userId: userId}).exec();
    let promisifiedWishlist = Wishlist.findOne({userId: userId}).exec();
    let promisifiedBank = Bank.findOne({userId: userId}).exec();

    Promise.all([promisifiedAddress, promisifiedWishlist, promisifiedBank])
      .spread((address, wishlist, bank) => {
        userSetup.address = _.pick(address, ['streetAddressOne', 'streetAddressTwo', 'state', 'city', 'zip']);
        userSetup.wishlist = _.pick(wishlist, ['id']);
        userSetup.bank = bank !== null;
        return res.status(200).json(userSetup);
      })
  });
};

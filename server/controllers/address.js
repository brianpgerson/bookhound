'use strict'
const Address = require('../models/address');
const AuthController = require('./authentication');
const _ = require('lodash');

function getAddress(requestBody) {
  let address = _.assign({}, {
    streetAddressOne: requestBody.streetAddressOne,
    streetAddressTwo: requestBody.streetAddressTwo,
    city: requestBody.city,
    state: requestBody.state,
    zip: requestBody.zip
  });

  const valid = _.every(address, (value, key) => {
    return !_.isUndefined(value) || key === 'streetAddressTwo';
  });

  return valid ? address : valid;
}

exports.saveAddress = function (req, res, next) {
  let address = getAddress(req.body);
  const currentUser = req.currentUser;
  if (!address) {
    res.status(422).send({ error: 'You are missing a required address field' });
    return;
  }

  address.userId = currentUser._id;
  const newAddress = new Address(address);

  newAddress.save((err, savedAddress) => {
    if (err) {
      return next(err);
    }

    res.status(201).json({
      address: savedAddress
    });
  });
};


exports.updateAddress = function (req, res, next) {
  let newAddress = getAddress(req.body);
  const currentUser = req.currentUser;

  if (!newAddress) {
    res.status(422).send({ error: 'You are missing a required address field' });
    return;
  }

  Address.findOneAndUpdate(
    {userId: currentUser._id},
    newAddress,
    {runValidators: true},
    function (err, modifiedAddress) {
      if (err) {
        res.status(422).send({ error: 'Error saving address' });
      } else {
        res.status(201).json({
          address: modifiedAddress
        });
      }
  });
};

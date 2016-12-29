const Address = require('../models/address');
const AuthController = require('./authentication');
const setAddressInfo = require('../helpers').setAddressInfo;
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

//= =======================================
// Address Routes
//= =======================================
exports.saveAddress = function (req, res, next) {
  let address = getAddress(req.body);
  if (!address) {
    res.status(422).send({error: 'You are missing a required address field'});
    return;
  }

  AuthController.me(req).then(function (currentUser) {
    address.userId = currentUser._id;
    const newAddress = new Address(address);

    newAddress.save((err, savedAddress) => {
      if (err) {
        return next(err);
      }

      console.log('address saved!');

      res.status(201).json({
        address: savedAddress
      });
    });
  }).catch(function (err) {
    console.log(err);
  })
};

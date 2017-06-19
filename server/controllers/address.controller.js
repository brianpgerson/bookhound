'use strict'
const AuthController = require('./authentication.controller'),
                   _ = require('lodash');

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

    currentUser.address = address;
    currentUser.save().then(user => {
        res.status(201).json({address: user.address});
    });
};


exports.updateAddress = function (req, res, next) {
    let newAddress = getAddress(req.body);
    const currentUser = req.currentUser;

    if (!newAddress) {
        res.status(422).send({ error: 'You are missing a required address field' });
        return;
    }

    currentUser.address = newAddress
    currentUser.save().then(user => {
        res.status(201).json({address: user.address});
    }).catch(err => {
        res.status(422).send({error: 'Error saving address: ' + err});
    });
};

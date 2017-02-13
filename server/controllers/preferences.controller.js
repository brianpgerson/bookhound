'use strict'
const Preferences = require('../models/preferences');
const AuthController = require('./authentication.controller');
const _ = require('lodash');

function getPreferencesFromRequest(requestBody) {
  console.log(requestBody.preferredConditions);
  let preferences = _.assign({}, {
    preferredConditions: requestBody.preferredConditions,
    maxMonthlyOrderFrequency: requestBody.maxMonthlyOrderFrequency
  });
  return preferences;
}

exports.updatePreferences = function (req, res, next) {
  let newPreferences = getPreferencesFromRequest(req.body);
  const currentUser = req.currentUser;
  console.log(newPreferences)

  Preferences.findOneAndUpdate(
    {userId: currentUser._id},
    newPreferences,
    {runValidators: true},
    function (err, modifiedPreferences) {
      if (err) {
        res.status(422).send({ error: 'Error saving preferences' });
      } else {
        res.status(201).json({
          preferences: modifiedPreferences
        });
      }
  });
};

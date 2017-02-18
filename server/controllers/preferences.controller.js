'use strict'
const Preferences = require('../models/preferences'),
   AuthController = require('./authentication.controller'),
                _ = require('lodash');

function getPreferencesFromRequest(requestBody) {
    let preferences = _.assign({}, {
        preferredConditions: requestBody.preferredConditions,
        maxMonthlyOrderFrequency: requestBody.maxMonthlyOrderFrequency
    });
    return preferences;
}

exports.updatePreferences = function (req, res, next) {
    let newPreferences = getPreferencesFromRequest(req.body);
    const currentUser = req.currentUser;

    Preferences.findOneAndUpdate(
        {userId: currentUser._id},
        newPreferences,
        {runValidators: true})
    .then(modifiedPreferences => {
            res.status(201).json({preferences: modifiedPreferences});
    });
};

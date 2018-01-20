'use strict'

const setUserInfo = require('../helpers').setUserInfo,
         Bluebird = require('bluebird'),
              jwt = require('jsonwebtoken'),
           crypto = require('crypto'),
             User = require('../models/user'),
           Mailer = Bluebird.promisifyAll(require('../services/mailer.service')),
          getRole = require('../helpers').getRole,
           config = require('../config/main');

function invalidEmail (email) {
    return email.indexOf('@') < 0;
}

function invalidPassword (password) {
    return password.length < 8 || !/\d/.test(password);
}

// Generate JWT
// TO-DO Add issuer and audience
function generateToken(user) {
    return jwt.sign(user, config.secret, {
        expiresIn: 10080
    });
}

exports.me = function(req, doPopulate) {
    if (req.headers && req.headers.authorization) {
        const authorization = req.headers.authorization.slice(4);
        const decoded = jwt.verify(authorization, config.secret);

        if (doPopulate) {
            return User.findById(decoded._id)
                .populate('wishlist.items')
                .then(user => {
                    return user;
                });
        } else {
            return User.findById(decoded._id).then(user => {
                return user;
            });
        }
    }
}

//= =======================================
// Login Route
//= =======================================
exports.login = function (req, res, next) {
    const userInfo = setUserInfo(req.user);

    res.status(200).json({
        token: `JWT ${generateToken(userInfo)}`,
        user: userInfo
    });
};


//= =======================================
// Registration Route
//= =======================================
exports.register = function (req, res, next) {
    const email = req.body.email;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const password = req.body.password;

    // Return error if no email provided
    if (!email || invalidEmail(email)) {
        res.status(422).send({ error: 'You must enter a valid email address.' });
        return;
    }

    // Return error if full name not provided
    if (!firstName || !lastName) {
        res.status(422).send({ error: 'You must enter your full name.' });
        return;
    }

    // Return error if no password provided
    if (!password || invalidPassword(password)) {
        res.status(422).send({ error: 'You must enter a valid password.' });
        return;
    }

    User.findOne({ email }).then(existingUser => {
        // If user is not unique, return error
        if (existingUser) {
            res.status(422).send({ error: 'That email address is already in use.' });
            return;
        }

        // If email is unique and password was provided, create account
        const user = new User({
            email,
            password,
            profile: { firstName, lastName }
        });

        user.save().then(user => {
            // Respond with JWT if user was created
            const userInfo = setUserInfo(user);

            res.status(201).json({
                token: `JWT ${generateToken(userInfo)}`,
                user: userInfo
            });
        }).catch(err => {
            return next(err);
        });
    }).catch(err => {
        return next(err);
    });
};

//= =======================================
// Authorization Middleware
//= =======================================

// Role authorization check
exports.roleAuthorization = function (requiredRole) {
    return function (req, res, next) {
        const user = req.user;

        User.findById(user._id).then(foundUser => {
            if (getRole(foundUser.role) >= getRole(requiredRole)) {
                return next();
            }

            res.status(401).json({ error: 'You are not authorized to view this content.' });
        }).catch(err => {
            res.status(422).json({ error: 'No user was found.' });
            return next(err);
        });
    };
};

//= =======================================
// Forgot Password Route
//= =======================================

exports.forgotPassword = function (req, res, next) {
    const email = req.body.email;

    User.findOne({ email }).then(existingUser => {

        crypto.randomBytes(48, (err, buffer) => {
            const resetToken = buffer.toString('hex');
            if (err) { return next(err); }

            existingUser.resetPasswordToken = resetToken;
            existingUser.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            existingUser.save().then(user => {}).catch(err => {
                res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
                return next(err);
            });

            Mailer.sendResetPasswordEmail(req.headers.host, email, resetToken).then(success => {
                res.status(200).json({success: 'Email sent successfully. Please check your inbox to reset your password'});
            }).catch(error => {
                res.send(error);
            })

        });
    }).catch(err => {
        res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
        return next(err);
    })
}

//= =======================================
// Reset Password Route
//= =======================================

exports.verifyToken = function (req, res, next) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }).then(resetUser => {
        // If query returned no results, token expired or was invalid. Return error.
        if (!resetUser) {
            res.status(422).json({ error: 'Your token has expired. Please attempt to reset your password again.' });
        }

        // Otherwise, save new password and clear resetToken from database
        resetUser.password = req.body.password;
        resetUser.resetPasswordToken = undefined;
        resetUser.resetPasswordExpires = undefined;

        resetUser.save().then(() => {
            // If password change saved successfully, alert user via email
            const message = {
                subject: 'Password Changed',
                text: 'You are receiving this email because you changed your password. \n\n' +
                'If you did not request this change, please contact us immediately.'
            };

            // Otherwise, send user email confirmation of password change via Mailgun
            // mailgun.sendEmail(resetUser.email, message);

            res.status(200).json({ message: 'Password changed successfully. Please login with your new password.' });
        })
    }).catch(err => {
        res.status(422).json({ error: 'Your request could not be processed as entered. Please try again.' });
        return next(err);
    });
};


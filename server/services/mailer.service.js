'use strict'

const nodemailer = require('nodemailer'),
             jwt = require('jsonwebtoken'),
          crypto = require('crypto'),
            User = require('../models/user'),
          config = require('../config/main');


const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        type: 'OAuth2',
        user: `${config.gmail.mailUser}`,
        clientId: `${config.gmail.clientId}`,
        clientSecret: `${config.gmail.clientSecret}`,
        refreshToken: `${config.gmail.refreshToken}`,
        accessToken: `${config.gmail.accessToken}`
    }
});

exports.sendResetPasswordEmail = function (host, email, resetToken) {
    const message = `${'You are receiving this because you (or someone else) have requested a reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://'}${host}/reset-password/${resetToken}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`

    const mailOptions = {
        from: `${config.gmail.mailUser}`,
        to: `${email}`,
        subject: `Your bookhound password reset request has arrived.`,
        text: message
    };

    return transporter.sendMail(mailOptions, function(error, info){
        return !error;
    });
}
'use strict'

const nodemailer = require('nodemailer'),
             jwt = require('jsonwebtoken'),
          crypto = require('crypto'),
            User = require('../models/user'),
          config = require('../config/main');


const transport = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: config.gmail.mailUser,
        pass: config.gmail.mailPass,
    },
});

exports.sendResetPasswordEmail = function (host, email, resetToken) {
    const message = `${'You are receiving this because you (or someone else) have requested a reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://'}${host}/reset-password/${resetToken}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`

    console.log('sending');
    const mailOptions = {
        from: `${config.gmail.mailUser}`,
        to: `${email}`,
        subject: `Your bookhound password reset request has arrived.`,
        text: message
    };

    return transport.sendMail(mailOptions);
}

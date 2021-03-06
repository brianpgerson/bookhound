const mongoose = require('mongoose'),
        bcrypt = require('bcrypt-nodejs'),
   ROLE_NORMAL = require('../constants').ROLE_NORMAL,
    ROLE_ADMIN = require('../constants').ROLE_ADMIN;

const Schema = mongoose.Schema;

//= ===============================
// User Schema
//= ===============================
const UserSchema = new Schema(
    {
        email: {
            type: String,
            lowercase: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        profile: {
            firstName: { type: String },
            lastName: { type: String },
        },
        role: {
            type: String,
            enum: [ROLE_NORMAL, ROLE_ADMIN],
            default: ROLE_NORMAL
        },
        stripe: {
            active: {type: Boolean},
            customerId: { type: String },
            stripeBankToken: { type: String },
            accessToken: { type: String},
            accountId: { type: String },
            lastCharge: { type: Date },
            charges: [{ type: Schema.Types.ObjectId, ref: 'Charge' }],
            balance: { type: Number }
        },
        address: {
            streetAddressOne: String,
            streetAddressTwo: String,
            city: String,
            state: String,
            zip: String
        },
        wishlist: {
            url: String,
            items: [{ type: Schema.Types.ObjectId, ref: 'WishlistItem' }],
            preferredConditions: {
                new: {
                    type: Boolean,
                    default: true
                },
                used: {
                    type: Boolean,
                    default: true
                },

            },
            maxMonthlyOrderFrequency: {
                type: Number,
                default: 1
            }
        },
        firstMessageShown: {
          type: Boolean,
          default: false
        },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
    },
    {
        timestamps: true
    }
);

//= ===============================
// User ORM Methods
//= ===============================

// Pre-save of user to database, hash password if password is modified or new
UserSchema.pre('save', function (next) {
    const user = this,
    SALT_FACTOR = 5;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Method to compare password for login
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) { return cb(err); }

        cb(null, isMatch);
    });
};

module.exports = mongoose.model('User', UserSchema);

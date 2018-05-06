const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Charge Schema
//= ===============================

const ChargeSchema = new Schema({
    _creator: {
        type: String,
        ref: 'User',
        required: true
    },
    refund: {
        amount: {        
            type: Number,
            required: true,
            default: 0
        },
        date: {
            type: Date
        }
    },
    chargeId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balanceTransaction: {
        type: String,
        required: true
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model('Charge', ChargeSchema);

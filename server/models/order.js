const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Order Schema
//= ===============================

const OrderSchema = new Schema({
    _creator: {
        type: String,
        ref: 'User',
        required: true
    },
    orderId: {
        type: String,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    productId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['IN_PROGRESS', 'FAILED', 'COMPLETE'],
        required: true
    }
}, 
{
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);

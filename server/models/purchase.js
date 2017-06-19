const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Purchase Schema
//= ===============================

const PurchaseSchema = new Schema(
    {
        userId: {
            type: String,
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
        payment: {
            type: Number,
            required: true
        },
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Purchase', PurchaseSchema);

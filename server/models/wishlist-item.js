const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Wishlist Schema
//= ===============================

const WishlistItemSchema = new Schema({
    productId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    shipping: {
        type: Number,
        required: true,
        default: 0
    },
    merchantId: {
        type: String
    },
    unavailable: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = {
  WishlistItem: mongoose.model('WishlistItem', WishlistItemSchema)
}

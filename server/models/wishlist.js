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
    }
});

const WishlistSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    id: {
        type: String,
        required: true
    },
    items: [WishlistItemSchema]
},
    {
        timestamps: true
    });

module.exports = {
  Wishlist: mongoose.model('Wishlist', WishlistSchema),
  WishlistItem: mongoose.model('WishlistItem', WishlistItemSchema)
}

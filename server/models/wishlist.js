// Importing Node packages required for schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Wishlist Schema
//= ===============================
const WishlistSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true
  }
},
  {
    timestamps: true
  });

//= ===============================
// Wishlist ORM Methods
//= ===============================

module.exports = mongoose.model('Wishlist', WishlistSchema);

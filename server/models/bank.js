// Importing Node packages required for schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Bank Schema
//= ===============================

var BankSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  stripeAccessToken: {
    type: String,
    required: true
  },
 },
  {
    timestamps: true
  });


module.exports = mongoose.model('Bank', BankSchema);

// Importing Node packages required for schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Address Schema
//= ===============================
const AddressSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  streetAddressOne: {
    type: String,
    required: true
  },
  streetAddressTwo: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
},
  {
    timestamps: true
  });

//= ===============================
// Address ORM Methods
//= ===============================

module.exports = mongoose.model('Address', AddressSchema);

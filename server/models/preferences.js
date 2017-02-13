// Importing Node packages required for schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//= ===============================
// Preferences Schema
//= ===============================
const PreferencesSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  preferredConditions: {
    new: {
      type: Boolean,
      default: true,
      required: true
    },
    used: {
      type: Boolean,
      default: true,
      required: true
    }
  },
  maxMonthlyOrderFrequency: {
    type: Number,
    default: 1,
    required: true
  }
},
  {
    timestamps: true
  });

//= ===============================
// Preferences ORM Methods
//= ===============================

module.exports = mongoose.model('Preferences', PreferencesSchema);

const mongoose = require('mongoose'),
        Schema = mongoose.Schema;

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

module.exports = mongoose.model('Address', AddressSchema);

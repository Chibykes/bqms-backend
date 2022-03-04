const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OfficesSchema = new Schema({

    id: {type: String, uppercase: true},
    name: {type: String, lowercase: true},

}, {timestamps: true});

module.exports = mongoose.model('offices', OfficesSchema);

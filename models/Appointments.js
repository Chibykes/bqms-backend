const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Users = require('./Users')

const AppointmentsSchema = new Schema({
    id: {type: String, uppercase: true},
    user : {
        type: String,
        ref: Users
    },
    ewt: {type: Number},
    est: {type: Number},
    office: {type: String, lowercase: true},
    reason: {type: String, lowercase: true},
    status: {type: String, lowercase: true, default: 'pending'},
    date: {type: String},
    queue_no: {type: Number}
}, {timestamps: true});


module.exports = mongoose.model('appointments', AppointmentsSchema);

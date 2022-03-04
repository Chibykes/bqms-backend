const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({

    id: {type: String, uppercase: true},
    role: {type: String, lowercase: true, default: 'student'},
    name: {type: String, lowercase: true},
    phone: {type: String},
    reg_no: {type: String, uppercase: true},
    password: {type: String},

}, {timestamps: true});

module.exports = mongoose.model('users', UserSchema);

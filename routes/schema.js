const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phone:Number,
    password:String,
    resetPasswordToken:String,
    resetPasswordExpires:Date,
})
const user = mongoose.model('userData', userSchema);
module.exports = user;
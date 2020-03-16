const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    phone:Number,
    password:String
})
const user = mongoose.model('userData', userSchema);
module.exports = user;
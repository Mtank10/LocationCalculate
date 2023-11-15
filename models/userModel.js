const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    address:String,
    latitude: Number,
    longitude: Number,
    status: {
        type:String,
        default: 'active'
    },
    week_number:{type:Number,required:true,min:0,max:6},
})
const User = mongoose.model('User',userSchema);

module.exports = User;
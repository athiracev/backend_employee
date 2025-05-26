const mongoose = require('mongoose');

const employeeScheme = new mongoose.Schema({
    name:{type:String, required:true},
    phone:{type:String, required:true, unique:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    designation:{type:String,enum:['manager','hr','techsupport'],required:false},
    manager:{type:String,enum:['hr','manager']},
    leave_balance:{type:Number,default:0},
})

module.exports= mongoose.model('Employee',employeeScheme)
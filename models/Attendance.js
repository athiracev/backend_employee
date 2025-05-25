const mongoose= require('mongoose')

const attendanceScheme = new mongoose.SchemaType({
    employee:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Employee',
        required:true
    },
    today_date:{
        type:Date,
        default:Date.now,
        required:true
    },
    punch_in:{
        type:Date,
    },
    punch_out:{
        type:Date,
    },
    current_location:{
        type:String,
    },
    status:{
        type:String,
        enum:['present','absent','leave'],
        default:'present'
    }
}, {timestamps:true});

module.exports=mongoose.model('Attendance',attendanceScheme);
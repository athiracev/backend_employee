const mongoose = require('mongoose')

const leaveScheme = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    type_of_leave: {
        type: String, required: true
    },
    reason: { type: String, required: true },
    from_date: {
        type: Date,
        required: true
    },
    to_date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveScheme);
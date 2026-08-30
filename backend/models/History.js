// 🟢 Import mongoose
const mongoose = require('mongoose');

// 🟢 Create Schema for storing user disease history
const historySchema = new mongoose.Schema({

// 🟢 User ID
userId: {

    type: mongoose.Schema.Types.ObjectId,

    ref: 'User',

    required: true
},

// 🟢 Predicted Disease
disease: {

    type: String,

    required: true
},

// 🟢 User Symptoms
symptoms: {

    type: [String],

    required: true
},

// 🟢 Severity Level
severity: {

    type: String,

    enum: [
        'Low',
        'Medium',
        'High'
    ],

    required: true
},

// 🟢 Recovery Status
status: {

    type: String,

    enum: [
        'Under Treatment',
        'Recovering',
        'Recovered'
    ],

    default: 'Under Treatment'
},

// 🟢 Diagnosis Date
date: {

    type: Date,

    default: Date.now
}

}, {

    // 🟢 Automatic timestamps
timestamps: true

});

// 🟢 Export Model
module.exports =
mongoose.model(
'History',
historySchema
);

// 🟢 Import mongoose library (used to connect MongoDB with Node.js)
const mongoose = require('mongoose');

// 🟢 Create Schema (Structure of User data in database)
const userSchema = new mongoose.Schema({

    // 🟢 User Name
    // Type: String → stores text
    // Required: true → cannot be empty
    name: {
        type: String,
        required: true
    },

    // 🟢 Email
    // Unique: true → prevents duplicate accounts
    email: {
        type: String,
        required: true,
        unique: true
    },

    // 🟢 Password
    // (Currently plain text, later you can hash it for security)
    password: {
        type: String,
        required: true
    },

    // 🟢 Phone Number
    // Default: null → better than "Not Set" (clean database)
    phone: {
        type: String,
        default: null
    },

    // 🟢 Age
    // Stored as Number for better calculations
    age: {
        type: Number,
        default: null
    },

    // 🟢 Gender
    // Enum → restrict values (Male, Female, Other)
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: null
    },

    // 🟢 Created Date (Auto-generated)
    date: {
        type: Date,
        default: Date.now
    },
    // 🟢 Profile Completion Fields
bloodGroup: {
    type: String,
    default: null
},

emergencyContact: {
    type: String,
    default: null
},

address: {
    type: String,
    default: null
},

height: {
    type: String,
    default: null
},

weight: {
    type: String,
    default: null
},

// 🟢 Profile completion flag
profileCompleted: {
    type: Boolean,
    default: false
}

});

// 🟢 Export model (this creates "users" collection in MongoDB)
module.exports = mongoose.model('User', userSchema);
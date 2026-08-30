const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema({

    disease: {
        type: String,
        required: true,
        unique: true
    },

    precaution_1 : {
        type: [String],
        required: true
    },

    precaution_2 : {
        type: [String],
        default: []
    },

    precaution_3 : {
        type: [String],
        default: []
    },

    precaution_4 : {
        type: [String],
        default: []
    },

    doctor: {
        type: String,
        default: "General Physician"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Disease", diseaseSchema);
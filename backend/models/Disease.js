const mongoose = require("mongoose");

const diseaseSchema = new mongoose.Schema({

    disease: String,
    severity: String,
    causes: [String],
    advice: [String],
    medicines: [String],
    doctor: String

});

module.exports = mongoose.model("Disease", diseaseSchema);
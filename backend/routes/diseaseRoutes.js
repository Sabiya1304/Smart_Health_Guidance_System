const express = require("express");
const router = express.Router();

const DiseaseDetails = require("../models/Disease"); 
// (we will create model OR use JSON logic)

const diseaseData = require("../data/diseaseDetails.json");

// ================================
// GET DISEASE DETAILS
// ================================
router.get("/:diseaseName", (req, res) => {

    const name = req.params.diseaseName.toLowerCase();

    const result = diseaseData.find(d =>
        d.disease.toLowerCase() === name
    );

    if (!result) {
        return res.status(404).json({
            message: "Disease details not found"
        });
    }

    res.json(result);
});

module.exports = router;
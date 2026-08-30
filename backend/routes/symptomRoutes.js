//symptomRoutes.js
// ================================
// 🟢 IMPORT REQUIRED MODULES
// ================================
const express = require('express');
const router = express.Router();

// 🟢 Import disease data (JSON file)
const diseases = require('../data/diseases.json');
const followUps = require('../data/followUpQuestions.json');

// ================================
// 🧠 ANALYZE SYMPTOMS API
// ================================

router.post('/analyze', (req, res) => {

    // 🟢 Step 1: Get symptoms from frontend
    const { symptoms } = req.body;

    // 🛑 Step 2: Validation
    if (!symptoms || symptoms.length === 0) {
        return res.status(400).json({
            message: "No symptoms provided ❌"
        });
    }

    // 🟢 Step 3: Prepare result array
    let results = [];

    // 🟢 Step 4: Loop through all diseases
    diseases.forEach(disease => {

        // 🟢 Count matching symptoms
        const matchCount = symptoms.filter(userSymptom =>
            disease.symptoms.some(dbSymptom =>
                dbSymptom.toLowerCase() === userSymptom.toLowerCase()
            )
        ).length;

        // 🟢 If at least 1 symptom matches → consider it
        if (matchCount > 0) {
            results.push({
                disease: disease.disease,
                matchCount: matchCount
            });
        }
    });

    // 🛑 Step 5: No match found
    if (results.length === 0) {
        return res.json({
            message: "No disease found ❌"
        });
    }

    // 🟢 Step 6: Sort diseases by highest match
    results.sort((a, b) => b.matchCount - a.matchCount);

    // 🟢 Step 7: Take top 3 diseases
    const topResults = results.slice(0, 3);

    // 🟢 Step 8: Calculate severity (based on best match)
    let severity = "Low";

    if (topResults[0].matchCount >= 4) {
        severity = "High";
    } else if (topResults[0].matchCount >= 2) {
        severity = "Medium";
    }

    // 🟢 Step 9: Send response
    res.json({
        possibleDiseases: topResults,   // Top 3 diseases
        severity: severity              // Overall severity
    });
});
// ============== Get follow up Questions ==================
// ================================
// 🟢 FOLLOW-UP QUESTIONS API
// ================================
router.get('/followup/:disease', (req, res) => {

    const disease = req.params.disease.trim().toLowerCase();

    const data = followUps.find(
        d => d.disease.toLowerCase() === disease
    );

    if (!data) {
        return res.json({
            primaryQuestions: [],
            deepQuestions: [],
            redFlagQuestions: []
        });
    }

    res.json(data);
});

// ================================
// 🟢 EXPORT ROUTER
// ================================
module.exports = router;
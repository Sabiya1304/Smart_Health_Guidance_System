const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const Disease = require("../models/Diseases");

// ================= CONNECT DATABASE =================

mongoose.connect("mongodb://127.0.0.1:27017/healthDB_clean")
.then(() => {
    console.log("MongoDB Connected ✅");
})
.catch((error) => {
    console.log("MongoDB Error ❌", error);
});

// ================= CSV FILE PATH =================

const results = [];

const csvFilePath = path.join(
    __dirname,
    "../datasets/disease_dataset.csv"
);

// ================= READ CSV =================

fs.createReadStream(csvFilePath)
.pipe(csv())
.on("data", (data) => {

    const diseaseName = data["Disease"];

    const symptoms = [];

    // ================= EXTRACT SYMPTOMS =================

    Object.keys(data).forEach((key) => {

        if (
            key !== "Disease" &&
            data[key] === "1"
        ) {
            symptoms.push(
                key
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .trim()
            );
        }
    });

    // ================= SAVE CLEAN DATA =================

    results.push({
        disease: diseaseName.trim(),

        symptoms: symptoms,

        precautions: [],

        medicines: [],

        advice: [],

        doctor: "General Physician"
    });

})

.on("end", async () => {

    console.log("CSV Read Complete ✅");

    try {

        // ================= REMOVE OLD DATA =================

        await Disease.deleteMany();

        console.log("Old Diseases Deleted ✅");

        // ================= REMOVE DUPLICATES =================

        const uniqueDiseases = [];

        const diseaseMap = new Map();

        results.forEach((item) => {

            if (!diseaseMap.has(item.disease)) {

                diseaseMap.set(item.disease, true);

                uniqueDiseases.push(item);
            }

        });

        // ================= INSERT DATA =================

        await Disease.insertMany(uniqueDiseases);

        console.log("Diseases Imported Successfully ✅");

        console.log(
            `Total Diseases Imported: ${uniqueDiseases.length}`
        );

        mongoose.connection.close();

    }

    catch (error) {

        console.log("Import Error ❌", error);

        mongoose.connection.close();
    }

});
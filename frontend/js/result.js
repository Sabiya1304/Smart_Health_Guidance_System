    // ===============================
    // RESULT.JS (Smart Health System)
    // ===============================

    // Base API URL
    const API_URL = "http://localhost:5000/api/symptoms/analyze";

    // DOM Elements
    const topDiseaseEl = document.getElementById("topDisease");
    const topPercentageEl = document.getElementById("topPercentage");
    const severityBadgeEl = document.getElementById("severityBadge");
    const diseaseGridEl = document.getElementById("diseaseGrid");
    const confirmBtn = document.getElementById("confirmBtn");
    const chartCanvas = document.getElementById("resultChart");

    // ===============================
    // INIT
    // ===============================
    document.addEventListener("DOMContentLoaded", () => {
        initResultPage();
    });

    // ===============================
    // MAIN INIT FUNCTION
    // ===============================
    async function initResultPage() {
        try {
            const symptoms = JSON.parse(localStorage.getItem("selectedSymptoms"));

            // Redirect if no symptoms
            if (!symptoms || symptoms.length === 0) {
                window.location.href = "symptoms.html";
                return;
            }

            // Show loading state
            setLoadingState();

            // Fetch predictions
            const data = await fetchPredictions(symptoms);

            // Handle backend "no result"
            if (data.message) {
                alert(data.message);
                window.location.href = "symptoms.html";
                return;
            }

            // Process predictions
            const predictions = processPredictions(data, symptoms);

            // Safety check
            if (!predictions || predictions.length === 0) {
                alert("No matching diseases found.");
                window.location.href = "symptoms.html";
                return;
            }

            // Render UI
            renderTopDisease(predictions[0]);
            renderDiseaseGrid(predictions.slice(0, 3));
            renderChart(predictions.slice(0, 5));

            // Store for confirmation page
            localStorage.setItem("predictionResult", JSON.stringify(predictions));

            // Setup button
            setupConfirmButton();

        } catch (error) {
            console.error("Error initializing result page:", error);
            alert("Server error. Please try again.");
        }
    }

    // ===============================
    // LOADING STATE
    // ===============================
    function setLoadingState() {
        topDiseaseEl.innerText = "Analyzing...";
        topPercentageEl.innerText = "--%";
        severityBadgeEl.innerText = "--";
    }

    // ===============================
    // FETCH DATA FROM BACKEND
    // ===============================
    async function fetchPredictions(symptoms) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ symptoms })
            });

            if (!response.ok) {
                throw new Error("Failed to fetch predictions");
            }

            return await response.json();

        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }

    // ===============================
    // PROCESS RESPONSE DATA
    // ===============================
    function processPredictions(data, symptoms) {
        if (!data || !data.possibleDiseases) return [];

        return data.possibleDiseases
            .map(item => {
                const percentage = Math.round(
                    (item.matchCount / symptoms.length) * 100
                );

                return {
                    disease: item.disease,
                    matchCount: item.matchCount,
                    percentage: percentage
                };
            })
            .sort((a, b) => b.percentage - a.percentage);
    }

    // ===============================
    // RENDER TOP DISEASE
    // ===============================
    function renderTopDisease(disease) {
        if (!disease) return;

        topDiseaseEl.innerText = disease.disease;
        topPercentageEl.innerText = `${disease.percentage}% Match`;

        applySeverity(disease.percentage);
    }

    // ===============================
    // APPLY SEVERITY LOGIC
    // ===============================
    function applySeverity(percentage) {
        let severity = "";
        let className = "";

        if (percentage < 40) {
            severity = "Low";
            className = "severity-low";
        } else if (percentage <= 70) {
            severity = "Medium";
            className = "severity-medium";
        } else {
            severity = "High";
            className = "severity-high";
        }

        severityBadgeEl.innerText = severity;
        severityBadgeEl.className = `severity-badge ${className}`;
    }

    // ===============================
    // RENDER DISEASE GRID (TOP 3)
    // ===============================
    function renderDiseaseGrid(diseases) {
        diseaseGridEl.innerHTML = "";

        diseases.forEach((item, index) => {
            const card = document.createElement("div");
            card.classList.add("disease-card");

            if (index === 0) {
                card.classList.add("top");
            }

            card.innerHTML = `
                <h4 class="disease-name">${item.disease}</h4>
                <p class="match-count">Matched Symptoms: ${item.matchCount}</p>
                <p class="percentage">${item.percentage}%</p>
            `;

            diseaseGridEl.appendChild(card);
        });
    }

    // ===============================
    // RENDER CHART (TOP 5)
    // ===============================
    function renderChart(diseases) {
        const ctx = chartCanvas.getContext("2d");

        const labels = diseases.map(d => d.disease);
        const values = diseases.map(d => d.percentage);

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Match Percentage",
                    data: values,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // ===============================
    // CONFIRM BUTTON
    // ===============================
    function setupConfirmButton() {
        if (!confirmBtn) return;

        confirmBtn.addEventListener("click", () => {
            window.location.href = "confirmation.html";
        });
    }

    // ===============================
    // NAVIGATION FUNCTIONS
    // ===============================
    function goBack() {
        window.location.href = "symptoms.html";
    }

    function goHistory() {
        window.location.href = "dash.html";
    }

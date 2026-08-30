const API_BASE_URL = "http://localhost:5000/api";

const loggedInUser = JSON.parse(
    localStorage.getItem("user") ||
    "{}"
);

const loggedInUserId =
    loggedInUser._id ||
    localStorage.getItem("userId");

const healthTips = [
    "Drink enough water today and take proper rest.",
    "Eat light food when you feel sick.",
    "Wash your hands often to avoid infection.",
    "Sleep on time so your body can recover.",
    "Avoid smoke, dust, and cold drinks when you have cough or breathing trouble."
];

if (!loggedInUserId) {
    window.location.href = "index.html";
}

function getEl(id) {
    return document.getElementById(id);
}

function normalizeSeverity(severity) {
    const value = String(severity || "").trim().toLowerCase();

    if (value === "high") return "High";
    if (value === "medium") return "Medium";
    if (value === "low") return "Low";

    return "Low";
}

function getSeverityClass(severity) {
    const normalized = normalizeSeverity(severity);

    if (normalized === "High") return "high-badge";
    if (normalized === "Medium") return "medium-badge";

    return "low-badge";
}

function formatDate(date) {
    return date
        ? new Date(date).toLocaleDateString()
        : "--";
}

async function fetchHistory() {
    try {
        const response = await fetch(
            `${API_BASE_URL}/history/${encodeURIComponent(loggedInUserId)}`,
            { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
            throw new Error(
                data.message ||
                data.error ||
                "Unable to load history"
            );
        }

        const uniqueHistory = getUniqueHistory(data);

        renderDashboardStats(uniqueHistory);
        await renderPatientGuide(uniqueHistory);
        renderHistoryCards(uniqueHistory);

    } catch (error) {
        console.log("History error:", error);
        renderDashboardStats([]);
        renderEmptyPatientGuide();
        renderHistoryError(error.message);
    }
}

function getUniqueHistory(historyData) {
    const seen = new Set();

    return historyData.filter(item => {
        const symptoms = Array.isArray(item.symptoms)
            ? [...item.symptoms].sort().join("|")
            : "";

        const key = [
            item.userId,
            item.disease,
            normalizeSeverity(item.severity),
            symptoms
        ].join("::");

        if (seen.has(key)) {
            return false;
        }

        seen.add(key);
        return true;
    });
}

function renderUserInfo() {

    const dashboardUserName =
        getEl("dashboardUserName");

    const dashboardUserEmail =
        getEl("dashboardUserEmail");

    const heroUserName =
        getEl("heroUserName");

    if (dashboardUserName) {
        dashboardUserName.innerText =
            loggedInUser.name || "User";
    }

    if (dashboardUserEmail) {
        dashboardUserEmail.innerText =
            loggedInUser.email || "user@email.com";
    }

    if (heroUserName) {
        heroUserName.innerText =
            loggedInUser.name || "User";
    }
}

function renderDashboardStats(historyData) {
    const highCount = historyData.filter(
        item => normalizeSeverity(item.severity) === "High"
    ).length;

    getEl("totalCheckups").innerText = historyData.length;
    getEl("lastDisease").innerText = historyData[0]?.disease || "--";
    getEl("highSeverityCount").innerText = highCount;
    getEl("lastCheckupDate").innerText =
        formatDate(historyData[0]?.date);
}

async function renderPatientGuide(historyData) {
    if (!historyData.length) {
        renderEmptyPatientGuide();
        return;
    }

    const latest = historyData[0];
    const severity = normalizeSeverity(latest.severity);
    const details = await fetchDiseaseDetails(latest.disease);
    const symptoms = Array.isArray(latest.symptoms)
        ? latest.symptoms
        : [];

    getEl("currentStatusText").innerText =
        getStatusTitle(severity);

    getEl("currentStatusMessage").innerText =
        getStatusMessage(severity);

    getEl("heroStatusText").innerText =
        `Your latest checkup shows ${latest.disease || "a health result"} with ${severity.toLowerCase()} risk.`;

    getEl("statusCard").className =
        `status-card status-${severity.toLowerCase()}`;

    getEl("latestDiseaseName").innerText =
        latest.disease || "Unknown";

    getEl("latestSeverityBadge").innerText = severity;
    getEl("latestSeverityBadge").className =
        `severity-badge ${getSeverityClass(severity)}`;

    getEl("latestPlainMessage").innerText =
        getPlainMessage(latest.disease, severity);

    getEl("latestDate").innerText =
        formatDate(latest.date);

    getEl("recommendedDoctor").innerText =
        details?.doctor || getDoctorFallback(latest.disease);

    getEl("latestSymptoms").innerHTML = symptoms.length
        ? symptoms.map(symptom => `<span>${symptom}</span>`).join("")
        : "<span>No symptoms listed</span>";

    getEl("nextStepsList").innerHTML =
        getNextSteps(details, severity)
            .map(step => `<li>${step}</li>`)
            .join("");

    getEl("warningMessage").innerText =
        getWarningMessage(severity);

    getEl("warningCard").classList.toggle(
        "high-warning",
        severity === "High"
    );

    getEl("dailyHealthTip").innerText =
        getDailyTip();
}

function renderEmptyPatientGuide() {
    getEl("currentStatusText").innerText = "No checkup yet";
    getEl("currentStatusMessage").innerText =
        "Complete a symptom check to get simple guidance.";
    getEl("heroStatusText").innerText =
        "Your latest checkup summary will appear here.";
    getEl("statusCard").className = "status-card";
    getEl("latestDiseaseName").innerText = "No checkup yet";
    getEl("latestSeverityBadge").innerText = "--";
    getEl("latestSeverityBadge").className =
        "severity-badge low-badge";
    getEl("latestPlainMessage").innerText =
        "Start a new checkup to see your latest result.";
    getEl("latestDate").innerText = "--";
    getEl("recommendedDoctor").innerText = "--";
    getEl("latestSymptoms").innerHTML =
        "<span>No symptoms yet</span>";
    getEl("nextStepsList").innerHTML =
        "<li>Start a checkup to get personal advice.</li>";
    getEl("warningMessage").innerText =
        "If your symptoms feel serious or continue for many days, please talk to a doctor.";
    getEl("warningCard").classList.remove("high-warning");
    getEl("dailyHealthTip").innerText =
        getDailyTip();
}

function renderHistoryCards(historyData) {
    const grid = getEl("historyCardGrid");
    grid.innerHTML = "";

    if (!historyData.length) {
        grid.innerHTML = `
            <article class="empty-history-card">
                <i class="fa-solid fa-notes-medical"></i>
                <h3>No saved checkups yet</h3>
                <p>Start a new checkup and save the diagnosis to see it here.</p>
                <a href="symptoms.html">Start New Checkup</a>
            </article>
        `;
        return;
    }

    historyData.forEach(item => {
        const severity = normalizeSeverity(item.severity);
        const symptoms = Array.isArray(item.symptoms)
            ? item.symptoms.slice(0, 4)
            : [];

        grid.innerHTML += `
            <article class="history-card">
                <div class="history-card-top">
                    <div>
                        <span>${formatDate(item.date)}</span>
                        <h3>${item.disease || "--"}</h3>
                    </div>
                    <span class="severity-badge ${getSeverityClass(severity)}">
                        ${severity}
                    </span>
                </div>

                <div class="symptom-tags history-symptoms">
                    ${
                        symptoms.length
                            ? symptoms.map(symptom => `<span>${symptom}</span>`).join("")
                            : "<span>No symptoms listed</span>"
                    }
                </div>

                <button
                    class="view-btn"
                    onclick="viewDetails('${encodeURIComponent(item.disease || "")}', '${encodeURIComponent(severity)}')">
                    View Advice
                </button>
            </article>
        `;
    });
}

function renderHistoryError(message) {
    getEl("historyCardGrid").innerHTML = `
        <article class="empty-history-card">
            <i class="fa-solid fa-circle-exclamation"></i>
            <h3>History could not load</h3>
            <p>${message || "Please try again after restarting the backend."}</p>
        </article>
    `;
}

async function fetchDiseaseDetails(diseaseName) {
    if (!diseaseName) return null;

    try {
        const response = await fetch(
            `${API_BASE_URL}/disease/${encodeURIComponent(diseaseName)}`
        );

        if (!response.ok) return null;

        return await response.json();

    } catch (error) {
        console.log("Disease detail error:", error);
        return null;
    }
}

function getStatusTitle(severity) {
    if (severity === "High") return "Needs Attention";
    if (severity === "Medium") return "Watch Carefully";
    return "Low Risk";
}

function getStatusMessage(severity) {
    if (severity === "High") {
        return "Please contact a doctor soon and do not ignore serious symptoms.";
    }

    if (severity === "Medium") {
        return "Follow the advice and visit a doctor if symptoms continue.";
    }

    return "Take care and check again if symptoms become worse.";
}

function getPlainMessage(disease, severity) {
    if (severity === "High") {
        return `Your symptoms may match ${disease}. Because the risk is high, please contact a doctor soon.`;
    }

    if (severity === "Medium") {
        return `Your symptoms may match ${disease}. Take care, follow the advice, and see a doctor if symptoms continue.`;
    }

    return `Your symptoms may match ${disease}. The risk is low, but keep watching your symptoms.`;
}

function getNextSteps(details, severity) {
    const advice = Array.isArray(details?.advice)
        ? details.advice.slice(0, 3)
        : [];

    const steps = advice.length
        ? advice
        : [
            "Drink enough water",
            "Take proper rest",
            "Eat light and healthy food"
        ];

    if (severity === "High") {
        return [
            "Contact the recommended doctor soon",
            ...steps,
            "Do not ignore breathing trouble, chest pain, or very high fever"
        ];
    }

    return [
        ...steps,
        "Check again if symptoms continue"
    ];
}

function getWarningMessage(severity) {
    if (severity === "High") {
        return "Please do not delay. Visit a doctor quickly if your symptoms are strong.";
    }

    if (severity === "Medium") {
        return "See a doctor if symptoms continue, increase, or make daily work difficult.";
    }

    return "Most low-risk symptoms can improve with rest, but visit a doctor if you feel worse.";
}

function getDoctorFallback(disease) {
    const value = String(disease || "").toLowerCase();

    if (value.includes("asthma") || value.includes("bronchitis")) {
        return "Pulmonologist";
    }

    if (value.includes("diabetes")) {
        return "Endocrinologist";
    }

    if (value.includes("anxiety") || value.includes("depression")) {
        return "Psychiatrist";
    }

    return "General Physician";
}

function getDailyTip() {
    return healthTips[new Date().getDate() % healthTips.length];
}

async function viewDetails(encodedDisease, encodedSeverity) {
    try {
        const diseaseName = decodeURIComponent(encodedDisease);
        const savedSeverity = decodeURIComponent(encodedSeverity);

        const response = await fetch(
            `${API_BASE_URL}/disease/${encodeURIComponent(diseaseName)}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load disease details");
        }

        getEl("modalDiseaseName").innerText = data.disease || diseaseName;
        getEl("modalSeverity").innerText = savedSeverity;
        fillList("modalCauses", data.causes || []);
        fillList("modalAdvice", data.advice || []);
        fillList("modalMedicines", data.medicines || []);
        getEl("modalDoctor").innerText =
            data.doctor || "Consult a physician";

        getEl("diseaseModal").style.display = "block";

    } catch (error) {
        console.log("Modal error:", error);
    }
}

function fillList(id, items) {
    const list = getEl(id);
    if (!list) return;

    list.innerHTML = "";

    items.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
    });
}

function closeModal() {
    getEl("diseaseModal").style.display = "none";
}

function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

async function init() {
    renderUserInfo();
    await fetchHistory();
}

window.addEventListener("DOMContentLoaded", init);

getEl("logoutBtn")?.addEventListener("click", logout);
getEl("closeModalBtn")?.addEventListener("click", closeModal);

window.addEventListener("click", event => {
    if (event.target === getEl("diseaseModal")) {
        closeModal();
    }
});


// ================= DASHBOARD PROTECTION (AUTH) =================

if (!loggedInUserId) {
    alert("Please login first.");
    window.location.href = "index.html";
}
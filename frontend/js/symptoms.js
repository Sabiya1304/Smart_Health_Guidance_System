// ===============================
// 🔹 ELEMENTS
// ===============================
const symptomContainer = document.getElementById("symptomGrid");
const selectedContainer = document.getElementById("selectedList");
const analyzeBtn = document.getElementById("analyzeBtn");
const searchInput = document.getElementById("searchInput");
const clearBtn = document.getElementById("clearBtn");

// ===============================
// 🔹 STATE
// ===============================
let selectedSymptoms = new Set();

// ===============================
// 🔹 ALL SYMPTOMS (FROM BACKEND DATA)
// ===============================
const allSymptoms = [
    "fever","cough","cold","body pain","fatigue",
    "sneezing","runny nose","sore throat",
    "headache","nausea","vomiting","light sensitivity",
    "diarrhea","stomach pain","weakness",
    "high fever","chills","sweating",
    "joint pain","rash","eye pain",
    "continuous fever","loss of appetite",
    "chest burning","bloating","burping",
    "itchy eyes","thirst","dry mouth","dizziness",
    "shortness of breath","chest tightness","wheezing",
    "persistent cough","mucus",
    "frequent urination","blurred vision",
    "pale skin","lower right abdominal pain",
    "burning urination","pelvic pain",
    "severe back pain","blood in urine",
    "sadness","loss of interest","sleep problems",
    "restlessness","rapid heartbeat","nervousness"
];

// ===============================
// 🔹 RENDER SYMPTOMS
// ===============================
function renderSymptoms(filter = "") {

    symptomContainer.innerHTML = "";

    const filtered = allSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(filter.toLowerCase())
    );

    filtered.forEach(symptom => {

        const card = document.createElement("div");
        card.className = "symptom-card";

        if (selectedSymptoms.has(symptom)) {
            card.classList.add("active");
        }

        card.textContent = symptom;

        card.addEventListener("click", () => toggleSymptom(symptom));

        symptomContainer.appendChild(card);
    });
}

// ===============================
// 🔹 TOGGLE
// ===============================
function toggleSymptom(symptom) {

    if (selectedSymptoms.has(symptom)) {
        selectedSymptoms.delete(symptom);
    } else {
        selectedSymptoms.add(symptom);
    }

    updateSelectedUI();
    renderSymptoms(searchInput.value);
}

// ===============================
// 🔹 UPDATE SELECTED PANEL
// ===============================
function updateSelectedUI() {

    selectedContainer.innerHTML = "";

    if (selectedSymptoms.size === 0) {
        selectedContainer.innerHTML =
            `<p class="empty-text">No symptoms selected</p>`;
    }

    selectedSymptoms.forEach(symptom => {

        const item = document.createElement("span");
        item.className = "selected-item";
        item.innerHTML = `${symptom} ✕`;

        item.addEventListener("click", () => {
            selectedSymptoms.delete(symptom);
            updateSelectedUI();
            renderSymptoms(searchInput.value);
        });

        selectedContainer.appendChild(item);
    });

    analyzeBtn.disabled = selectedSymptoms.size === 0;
}

// ===============================
// 🔹 SEARCH
// ===============================
searchInput.addEventListener("input", (e) => {
    renderSymptoms(e.target.value);
});

// ===============================
// 🔹 CLEAR ALL
// ===============================
clearBtn.addEventListener("click", () => {
    selectedSymptoms.clear();
    updateSelectedUI();
    renderSymptoms();
});

// ===============================
// 🔹 ANALYZE
// ===============================
analyzeBtn.addEventListener("click", async () => {

    const symptomsArray = Array.from(selectedSymptoms);

    try {
        analyzeBtn.innerText = "Analyzing...";
        analyzeBtn.disabled = true;

        const response = await fetch("http://localhost:5000/api/symptoms/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                symptoms: symptomsArray
            })
        });

        const data = await response.json();

        // Save result
        localStorage.setItem("analysisResult", JSON.stringify(data));
        localStorage.setItem("selectedSymptoms", JSON.stringify(symptomsArray));

        // Redirect
        window.location.href = "result.html";

    } catch (error) {
        console.error(error);
        alert("Server error ❌");
    }
});

// ===============================
// 🔹 INIT
// ===============================
renderSymptoms();

// =====================================
// LOGOUT SYSTEM
// =====================================

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logoutUser
    );
}

function logoutUser() {

    // Remove login session
    localStorage.removeItem(
        "loggedInUser"
    );

    // Optional remember me remove
    localStorage.removeItem(
        "rememberedUser"
    );

    // Redirect to login
    window.location.href =
        "index.html";
}
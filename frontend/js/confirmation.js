// =========================================================
// SMART HEALTH SYSTEM
// confirmation.js
// =========================================================

// =========================================================
// BASE API
// =========================================================

const BASE_URL =
    "http://localhost:5000/api/symptoms";

// =========================================================
// DOM ELEMENTS
// =========================================================

const diseaseContainer =
    document.getElementById("diseaseContainer");

const questionText =
    document.getElementById("questionText");

const questionCounter =
    document.getElementById("questionCounter");

const answerGrid =
    document.getElementById("answerGrid");

const mainProgressFill =
    document.getElementById("mainProgressFill");

const mainProgressText =
    document.getElementById("mainProgressText");

const finalResult =
    document.getElementById("finalResult");

const detailsBox =
    document.getElementById("detailsBox");

const resultSkeleton =
    document.getElementById("resultSkeleton");

const detailsSkeleton =
    document.getElementById("detailsSkeleton");

const saveBtn =
    document.getElementById("saveBtn");

// =========================================================
// STATE MANAGEMENT
// =========================================================

const state = {

    diseases: [],

    questions: [],

    currentQuestionIndex: 0,

    confidenceMap: {},

    completed: false,

    finalDisease: null,

    symptoms: [],

    isTransitioning: false
};

// =========================================================
// ANSWER CONFIGURATION
// =========================================================

const ANSWERS = [

    {
        label: "Yes",
        icon: "fa-check",
        score: 10,
        description: "Frequently experienced",
        class: "yes"
    },

    {
        label: "Maybe",
        icon: "fa-circle-question",
        score: 5,
        description: "Unsure or occasional",
        class: "maybe"
    },

    {
        label: "Sometimes",
        icon: "fa-wave-square",
        score: 3,
        description: "Mild occurrence",
        class: "sometimes"
    },

    {
        label: "No",
        icon: "fa-xmark",
        score: -5,
        description: "Not experienced",
        class: "no"
    },

    {
        label: "Never",
        icon: "fa-ban",
        score: -10,
        description: "Completely absent",
        class: "never"
    }
];

// =========================================================
// INITIALIZATION
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeConfirmationEngine
);

// =========================================================
// INITIALIZE ENGINE
// =========================================================

async function initializeConfirmationEngine() {

    try {

        // =================================================
        // LOAD SYMPTOMS
        // =================================================

        state.symptoms =
            JSON.parse(
                localStorage.getItem(
                    "selectedSymptoms"
                )
            ) || [];

        if (state.symptoms.length === 0) {

            renderError(
                "No symptoms selected."
            );

            return;
        }

        // =================================================
        // LOAD RESULT PAGE PREDICTIONS
        // =================================================

        state.diseases =
            JSON.parse(
                localStorage.getItem(
                    "predictionResult"
                )
            ) || [];

        if (state.diseases.length === 0) {

            renderError(
                "No disease prediction found."
            );

            return;
        }

        // =================================================
        // INITIALIZE CONFIDENCE
        // =================================================

        initializeConfidence();

        // =================================================
        // RENDER DISEASE UI
        // =================================================

        renderDiseaseCards();

        // =================================================
        // LOAD QUESTIONS
        // =================================================

        const loadedSuccessfully =
            await loadQuestionsForTopDisease();

        if (
            loadedSuccessfully &&
            state.questions.length > 0
        ) {

            renderQuestion();

        } else {

            renderError(
                "Unable to load AI clinical questions."
            );
        }

    } catch (error) {

        console.error(
            "Initialization Error:",
            error
        );

        renderError(
            "System failed to initialize."
        );
    }
}

// =========================================================
// INITIALIZE CONFIDENCE
// =========================================================

function initializeConfidence() {

    state.diseases.forEach(disease => {

        const percentage =
            disease.percentage || 0;

        state.confidenceMap[
            disease.disease
        ] = percentage;
    });
}

// =========================================================
// LOAD QUESTIONS FOR TOP DISEASE
// =========================================================

async function loadQuestionsForTopDisease() {

    try {

        // =================================================
        // GET TOP DISEASE
        // =================================================

        const topDisease =
            state.diseases[0];

        if (!topDisease) {

            return false;
        }

        const diseaseName =
            topDisease.disease;

        // =================================================
        // FETCH QUESTIONS
        // =================================================

        const response = await fetch(
            `${BASE_URL}/followup/${encodeURIComponent(diseaseName)}`
        );

        if (!response.ok) {

            return false;
        }

        const data =
            await response.json();

        // =================================================
        // COMBINE QUESTIONS
        // =================================================

        const allQuestions = [

            ...(data.primaryQuestions || []),

            ...(data.deepQuestions || []),

            ...(data.redFlagQuestions || [])
        ];

        // =================================================
        // FORMAT QUESTIONS
        // =================================================

        state.questions =
            allQuestions
                .filter(question =>
                    typeof question === "string"
                )
                .slice(0, 6)
                .map(question => ({

                    disease: diseaseName,

                    question: question.trim()
                }));

        console.log(
            "Loaded Questions:",
            state.questions
        );

        return state.questions.length > 0;

    } catch (error) {

        console.error(
            "Question Loading Error:",
            error
        );

        return false;
    }
}

// =========================================================
// RENDER QUESTION
// =========================================================

function renderQuestion() {

    if (state.completed) {

        return;
    }

    if (
        state.currentQuestionIndex >=
        state.questions.length
    ) {

        completeDiagnosis();

        return;
    }

    const currentQuestion =
        state.questions[
            state.currentQuestionIndex
        ];

    if (!currentQuestion) {

        completeDiagnosis();

        return;
    }

    // =====================================================
    // QUESTION TEXT
    // =====================================================

    questionText.innerHTML = `

        <div class="question-fade">

            ${currentQuestion.question}

        </div>
    `;

    // =====================================================
    // QUESTION COUNTER
    // =====================================================

    questionCounter.innerHTML = `

        <i class="fa-solid fa-layer-group"></i>

        Question
        ${state.currentQuestionIndex + 1}
        /
        ${state.questions.length}
    `;

    // =====================================================
    // UPDATE PROGRESS
    // =====================================================

    updateProgress();

    // =====================================================
    // RENDER ANSWERS
    // =====================================================

    renderAnswerCards();
}

// =========================================================
// UPDATE PROGRESS
// =========================================================

function updateProgress() {

    const baseProgress = 35;

    const dynamicProgress =

        (
            state.currentQuestionIndex /
            state.questions.length
        ) * 65;

    const finalProgress =
        baseProgress +
        dynamicProgress;

    mainProgressFill.style.width =
        `${finalProgress}%`;

    mainProgressText.innerText =
        `${Math.round(finalProgress)}%`;
}

// =========================================================
// RENDER ANSWERS
// =========================================================

function renderAnswerCards() {

    answerGrid.innerHTML = "";

    ANSWERS.forEach(answer => {

        const card =
            document.createElement("div");

        card.className =
            "answer-card";

        card.innerHTML = `

            <div class="answer-icon ${answer.class}">

                <i class="fa-solid ${answer.icon}"></i>

            </div>

            <div class="answer-content">

                <h4>
                    ${answer.label}
                </h4>

                <p>
                    ${answer.description}
                </p>

            </div>
        `;

        // =================================================
        // ANSWER CLICK
        // =================================================

        card.addEventListener(
            "click",
            () => {

                if (
                    state.isTransitioning ||
                    state.completed
                ) {

                    return;
                }

                selectAnswer(
                    answer,
                    card
                );
            }
        );

        answerGrid.appendChild(card);
    });
}

// =========================================================
// HANDLE ANSWER
// =========================================================

function selectAnswer(
    answer,
    selectedCard
) {

    state.isTransitioning = true;

    // =====================================================
    // REMOVE OLD SELECTION
    // =====================================================

    document
        .querySelectorAll(".answer-card")
        .forEach(card => {

            card.classList.remove(
                "selected"
            );
        });

    // =====================================================
    // APPLY NEW SELECTION
    // =====================================================

    selectedCard.classList.add(
        "selected"
    );

    // =====================================================
    // UPDATE CONFIDENCE
    // =====================================================

    updateConfidence(answer.score);

    // =====================================================
    // NEXT QUESTION
    // =====================================================

    setTimeout(() => {

        state.currentQuestionIndex++;

        state.isTransitioning = false;

        renderQuestion();

    }, 500);
}

// =========================================================
// UPDATE CONFIDENCE
// =========================================================

function updateConfidence(score) {

    const currentQuestion =
        state.questions[
            state.currentQuestionIndex
        ];

    const diseaseName =
        currentQuestion.disease;

    // =====================================================
    // UPDATE SCORE
    // =====================================================

    state.confidenceMap[diseaseName] +=
        score;

    // =====================================================
    // CLAMP VALUES
    // =====================================================

    state.confidenceMap[diseaseName] =
        Math.max(
            0,
            Math.min(
                100,
                state.confidenceMap[
                    diseaseName
                ]
            )
        );

    // =====================================================
    // LIVE UPDATE UI
    // =====================================================

    renderDiseaseCards();
}

// =========================================================
// RENDER DISEASE CARDS
// =========================================================

function renderDiseaseCards() {

    diseaseContainer.innerHTML = "";

    const sortedDiseases =

        [...state.diseases].sort(
            (a, b) => {

                return (

                    state.confidenceMap[
                        b.disease
                    ] -

                    state.confidenceMap[
                        a.disease
                    ]
                );
            }
        );

    sortedDiseases.forEach(
        (disease, index) => {

            const confidence =

                state.confidenceMap[
                    disease.disease
                ];

            const riskLevel =
                getRiskLevel(confidence);

            const card =
                document.createElement("div");

            card.className =

                `disease-item ${
                    index === 0
                        ? "active"
                        : ""
                }`;

            card.innerHTML = `

                <div class="
                    risk-badge
                    ${riskLevel.class}
                ">

                    ${riskLevel.label}

                </div>

                <h3>
                    ${disease.disease}
                </h3>

                <div class="
                    confidence-percent
                ">

                    ${confidence}%

                </div>

                <div class="
                    confidence-bar
                ">

                    <div
                        class="
                            confidence-fill
                        "
                        style="
                            width:${confidence}%
                        "
                    ></div>

                </div>
            `;

            diseaseContainer.appendChild(
                card
            );
        }
    );
}

// =========================================================
// RISK LEVEL
// =========================================================

function getRiskLevel(confidence) {

    if (confidence >= 70) {

        return {
            label: "High",
            class: "risk-high"
        };
    }

    if (confidence >= 40) {

        return {
            label: "Medium",
            class: "risk-medium"
        };
    }

    return {
        label: "Low",
        class: "risk-low"
    };
}

// =========================================================
// COMPLETE DIAGNOSIS
// =========================================================

async function completeDiagnosis() {

    if (state.completed) {

        return;
    }

    state.completed = true;

    // =====================================================
    // COMPLETE PROGRESS
    // =====================================================

    mainProgressFill.style.width =
        "100%";

    mainProgressText.innerText =
        "Completed";

    // =====================================================
    // STOP QUESTIONS
    // =====================================================

    answerGrid.innerHTML = "";

    questionText.innerHTML = `

        <div style="
            display:flex;
            align-items:center;
            gap:14px;
            color:#0d6efd;
        ">

            <i class="
                fa-solid fa-circle-check
            "></i>

            Diagnosis completed successfully

        </div>
    `;

    // =====================================================
    // SORT FINAL RESULT
    // =====================================================

    const sortedDiseases =

        [...state.diseases].sort(
            (a, b) => {

                return (

                    state.confidenceMap[
                        b.disease
                    ] -

                    state.confidenceMap[
                        a.disease
                    ]
                );
            }
        );

    state.finalDisease =
        sortedDiseases[0];

    // =====================================================
    // RENDER RESULT
    // =====================================================

    renderFinalResult();

    // =====================================================
    // LOAD DETAILS
    // =====================================================

    await renderDiseaseDetails();

    // =====================================================
    // ENABLE SAVE
    // =====================================================

    saveBtn.disabled = false;
}

// =========================================================
// RENDER FINAL RESULT
// =========================================================

function renderFinalResult() {

    resultSkeleton.style.display =
        "none";

    finalResult.style.display =
        "block";

    const diseaseName =
        state.finalDisease.disease;

    const confidence =

        state.confidenceMap[
            diseaseName
        ];

    const risk =
        getRiskLevel(confidence);

    finalResult.innerHTML = `

        <div class="
            result-header
        ">

            <div class="
                diagnosis-icon
            ">

                <i class="
                    fa-solid
                    fa-file-waveform
                "></i>

            </div>

            <div>

                <h2 class="
                    result-disease
                ">
                    ${diseaseName}
                </h2>

                <p class="
                    result-subtitle
                ">
                    AI-generated clinical prediction
                </p>

            </div>

        </div>

        <div class="
            diagnosis-metrics
        ">

            <div class="
                metric-card
            ">

                <span>
                    Confidence
                </span>

                <h3>
                    ${confidence}%
                </h3>

            </div>

            <div class="
                metric-card
            ">

                <span>
                    Severity
                </span>

                <h3>
                    ${risk.label}
                </h3>

            </div>

        </div>

        <div class="
            recommendation-box
        ">

            <i class="
                fa-solid fa-user-doctor
            "></i>

            <div>

                <h4>
                    Medical Recommendation
                </h4>

                <p>
                    Please consult a healthcare
                    professional for proper
                    clinical diagnosis.
                </p>

            </div>

        </div>
    `;
}

// =========================================================
// DISEASE DETAILS
// =========================================================

async function renderDiseaseDetails() {

    try {

        const response =
            await fetch(
                `http://localhost:5000/api/disease/${encodeURIComponent(state.finalDisease.disease)}`
            );

        if (!response.ok) {

            throw new Error(
                "Disease details not found"
            );
        }

        const diseaseDetails =
            await response.json();

        detailsSkeleton.style.display =
            "none";

        detailsBox.style.display =
            "block";

        if (!diseaseDetails) {

            detailsBox.innerHTML = `
                <p>
                    No details found.
                </p>
            `;

            return;
        }

        detailsBox.innerHTML = `

            <div class="detail-section">

                <div class="detail-title">

                    <i class="
                        fa-solid fa-triangle-exclamation
                    "></i>

                    Severity

                </div>

                    <p>
                        ${getRiskLevel(
                            state.confidenceMap[
                                state.finalDisease.disease
                            ]
                        ).label}
                    </p>

            </div>

            <div class="detail-section">

                <div class="detail-title">

                    <i class="
                        fa-solid fa-virus
                    "></i>

                    Causes

                </div>

                <p>
                    ${diseaseDetails.causes.join(", ")}
                </p>

            </div>

            <div class="detail-section">

                <div class="detail-title">

                    <i class="
                        fa-solid fa-pills
                    "></i>

                    Medicines

                </div>

                <p>
                    ${diseaseDetails.medicines.join(", ")}
                </p>

            </div>

            <div class="detail-section">

                <div class="detail-title">

                    <i class="
                        fa-solid fa-shield-heart
                    "></i>

                    Advice

                </div>

                <p>
                    ${diseaseDetails.advice.join(", ")}
                </p>

            </div>

            <div class="detail-section">

                <div class="detail-title">

                    <i class="
                        fa-solid fa-user-doctor
                    "></i>

                    Recommended Doctor

                </div>

                <p>
                    ${diseaseDetails.doctor}
                </p>

            </div>
        `;

    } catch (error) {

        console.error(
            "Details Loading Error:",
            error
        );
    }
}

// =========================================================
// SAVE DIAGNOSIS
// =========================================================

if (saveBtn) {

    saveBtn.addEventListener(
        "click",
        saveDiagnosis
    );
}

async function saveDiagnosis() {

    if (!state.completed || saveBtn.disabled) {

        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = "Saving...";

    const diseaseName =
        state.finalDisease.disease;

    const confidence =

        state.confidenceMap[
            diseaseName
        ];

    let storedUser = {};

    const userData =
        localStorage.getItem("user");

    if (
        userData &&
        userData !== "undefined"
    ) {
        storedUser =
            JSON.parse(userData);
    }

    const diagnosisReport = {

        userId:
            storedUser._id ||
            localStorage.getItem("userId"),

        disease: diseaseName,

        confidence,

        severity:
            getRiskLevel(confidence)
                .label,

        symptoms:
            state.symptoms,

        timestamp:
            new Date().toISOString(),

        date:
            new Date().toLocaleString(),

        doctorRecommendation:
            "Consult healthcare professional"
    };

    if (!diagnosisReport.userId) {

        renderError(
            "Please login before saving diagnosis."
        );

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1200);

        return;
    }

    try {

        const response = await fetch(
            "http://localhost:5000/api/history/save",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(
                    diagnosisReport
                )
            }
        );

        const data =
            await response.json();

        const savedSuccessfully =
            data.success === true ||
            data.message?.toLowerCase().includes("history saved successfully");

        if (!response.ok || !savedSuccessfully) {

            throw new Error(
                data.message ||
                data.error ||
                "History was not saved"
            );
        }

        console.log(
            "Diagnosis Saved:",
            data
        );

        localStorage.setItem(
            "lastSavedHistory",
            JSON.stringify(data.history)
        );

        saveBtn.innerHTML = `

        <i class="
            fa-solid fa-circle-check
        "></i>

        Diagnosis Saved
    `;

    saveBtn.disabled = true;

    setTimeout(() => {

        window.location.assign(
            new URL(
                "dash.html",
                window.location.href
            ).href
        );

    }, 1200);


    } catch (error) {

        console.error(
            "Save Error:",
            error
        );

        renderError(
            error.message ||
            "History was not saved. Please try again."
        );

        saveBtn.disabled = false;
        saveBtn.innerHTML = `
            <i class="fa-solid fa-floppy-disk"></i>
            Save Diagnosis Report
        `;
    }

}    

// =========================================================
// ERROR UI
// =========================================================

function renderError(message) {

    questionText.innerHTML = `

        <div style="
            color:#dc3545;
            font-weight:700;
        ">

            <i class="
                fa-solid fa-circle-exclamation
            "></i>

            ${message}

        </div>
    `;

    answerGrid.innerHTML = "";
}

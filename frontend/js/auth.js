// ================= AUTH HELPERS =================

function getUser() {
    try {
        const user = localStorage.getItem("user");

        if (!user || user === "undefined") {
            return null;
        }

        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid user data:", error);
        return null;
    }
}

function isLoggedIn() {
    return !!localStorage.getItem("token") && !!getUser();
}

function logoutUser() {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

// =====================================================
// REGISTER FORM VALIDATION (ONLY IF EXISTS)
// Submission is handled by auth-modal.js.
// =====================================================

(function () {
    const registerForm = document.getElementById("registerForm");

    if (!registerForm) return;

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmInput = document.getElementById("confirmPassword");
    const phoneInput = document.getElementById("registerPhone");
    const ageInput = document.getElementById("registerAge");
    const genderInput = document.getElementById("registerGender");

    function setError(input) {
        const parent = input?.parentElement;
        if (!parent) return;

        parent.classList.add("error");
        parent.classList.remove("success");
    }

    function setSuccess(input) {
        const parent = input?.parentElement;
        if (!parent) return;

        parent.classList.add("success");
        parent.classList.remove("error");
    }

    nameInput?.addEventListener("input", () => {
        if (nameInput.value.trim().length < 3) setError(nameInput);
        else setSuccess(nameInput);
    });

    emailInput?.addEventListener("input", () => {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(emailInput.value)) setError(emailInput);
        else setSuccess(emailInput);
    });

    passwordInput?.addEventListener("input", () => {
        if (passwordInput.value.length < 6) setError(passwordInput);
        else setSuccess(passwordInput);
    });

    confirmInput?.addEventListener("input", () => {
        if (confirmInput.value !== passwordInput.value) setError(confirmInput);
        else setSuccess(confirmInput);
    });

    phoneInput?.addEventListener("input", () => {
        const pattern = /^[0-9]{10}$/;
        if (!pattern.test(phoneInput.value)) setError(phoneInput);
        else setSuccess(phoneInput);
    });

    ageInput?.addEventListener("input", () => {
        const age = parseInt(ageInput.value, 10);
        if (age < 1 || age > 120 || Number.isNaN(age)) setError(ageInput);
        else setSuccess(ageInput);
    });

    genderInput?.addEventListener("change", () => {
        if (!genderInput.value) setError(genderInput);
        else setSuccess(genderInput);
    });
})();

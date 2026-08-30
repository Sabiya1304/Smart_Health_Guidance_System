// ================= AUTH MODAL CONTROLLER =================

const authModalOverlay = document.getElementById("authModalOverlay");
const closeAuthModalBtn = document.getElementById("closeAuthModal");

const loginTabBtn = document.getElementById("loginTabBtn");
const registerTabBtn = document.getElementById("registerTabBtn");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const loginNavItem = document.getElementById("loginNavItem");
const registerNavItem = document.getElementById("registerNavItem");
const logoutBtn = document.getElementById("logoutBtn");

const API_BASE_URL = "http://localhost:5000/api/auth";

function showToast(message, type = "success") {
    const toast = document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.innerText = message;
    toast.style.display = "block";
    toast.style.background = type === "error" ? "#e74c3c" : "#2ecc71";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}

function openAuthModal(type = "login") {
    if (!authModalOverlay) return;

    authModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";

    if (type === "register") showRegisterForm();
    else showLoginForm();
}

function closeAuthModal() {
    if (!authModalOverlay) return;

    authModalOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}
function showLoginForm() {
    loginForm?.classList.add("active-form");
    registerForm?.classList.remove("active-form");

    loginTabBtn?.classList.add("active");
    registerTabBtn?.classList.remove("active");
}

function showRegisterForm() {
    registerForm?.classList.add("active-form");
    loginForm?.classList.remove("active-form");

    registerTabBtn?.classList.add("active");
    loginTabBtn?.classList.remove("active");
}

function updateNavbarUI() {
    const user = localStorage.getItem("user");

    if (user) {
        if (loginNavItem) loginNavItem.style.display = "none";
        if (registerNavItem) registerNavItem.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "block";
    } else {
        if (loginNavItem) loginNavItem.style.display = "block";
        if (registerNavItem) registerNavItem.style.display = "block";
        if (logoutBtn) logoutBtn.style.display = "none";
    }
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            console.log("Login Response:", data); //REMOOVE AFTER TESTING
            if (!response.ok || !data.success || !data.user) {
                throw new Error(data.message || data.error || "Login failed");
            }

            localStorage.setItem("user", JSON.stringify(data.user));
            localStorage.setItem("token", data.token || data.user._id);
            localStorage.setItem("userId", data.user._id);

            showToast("Login successful");
            updateNavbarUI();
            closeAuthModal();

            setTimeout(() => {
                window.location.href = data.user.profileCompleted ? "dash.html" : "profile.html";
            }, 800);
        } catch (error) {
            showToast(error.message, "error");
        }
    });
}

if (registerForm) { 
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword")?.value;
        const phone = document.getElementById("registerPhone")?.value.trim();
        const age = document.getElementById("registerAge")?.value;
        const gender = document.getElementById("registerGender")?.value;

        if (confirmPassword && password !== confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, phone, age, gender })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || data.error || "Registration failed");
            }

            showToast("Account created successfully");
            registerForm.reset();
            showLoginForm();
        } catch (error) {
            showToast(error.message, "error");
        }
    });
}

document.querySelectorAll(".open-login-modal").forEach(button => {
    button.addEventListener("click", () => openAuthModal("login"));
});

document.querySelectorAll(".open-register-modal").forEach(button => {
    button.addEventListener("click", () => openAuthModal("register"));
});

closeAuthModalBtn?.addEventListener("click", closeAuthModal);
loginTabBtn?.addEventListener("click", showLoginForm);
registerTabBtn?.addEventListener("click", showRegisterForm);

document.addEventListener("DOMContentLoaded", updateNavbarUI);

const switchToLogin = document.getElementById("switchToLogin");

switchToLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    showLoginForm();
});

// LOGOUT EVENT
logoutBtn?.addEventListener("click", () => {

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");

    window.location.reload();

});
/* ======================================================
    SMART HEALTH HOME PAGE CONTROLLER
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initializeNavbar();
    initializeProtectedLinks();
    initializeCounterAnimation();
    initializeScrollAnimations();
    initializeGreeting();

    loadHomeData();   // 👈     LOAD DATA ON HOME PAGE 

});



/* ======================================================
   USER HELPERS
====================================================== */

function getCurrentUser() {
    try {
        const user = localStorage.getItem("user");

        if (!user || user === "undefined") {
            return null;
        }

        return JSON.parse(user);

    } catch (error) {
        return null;
    }
}

function isUserLoggedIn() {
    return !!localStorage.getItem("token");
}


/* ======================================================
   NAVBAR ACTIVE LINK
====================================================== */

function initializeNavbar() {

    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(link => {

        link.addEventListener("click", function () {

            navLinks.forEach(item => {
                item.classList.remove("active");
            });

            this.classList.add("active");

        });

    });

}


/* ======================================================
   PROTECTED PAGE ACCESS
====================================================== */

function initializeProtectedLinks() {

    const dashboardLinks = document.querySelectorAll(
        'a[href="dash.html"]'
    );

    const profileLinks = document.querySelectorAll(
        'a[href="profile.html"]'
    );

    const symptomLinks = document.querySelectorAll(
        'a[href="symptoms.html"]'
    );

    dashboardLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            if (!isUserLoggedIn()) {

                e.preventDefault();

                if (typeof openAuthModal === "function") {
                    openAuthModal("login");
                }

                alert("Please login first");
            }

        });

    });

    profileLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            if (!isUserLoggedIn()) {

                e.preventDefault();

                if (typeof openAuthModal === "function") {
                    openAuthModal("login");
                }

                alert("Please login first");
            }

        });

    });

    symptomLinks.forEach(link => {

        link.addEventListener("click", (e) => {

            if (!isUserLoggedIn()) {

                e.preventDefault();

                if (typeof openAuthModal === "function") {
                    openAuthModal("login");
                }

                alert("Please login first to start health analysis");
            }

        });

    });

}


/* ======================================================
   STATS COUNTER ANIMATION
====================================================== */

function initializeCounterAnimation() {

    const stats = document.querySelectorAll(".stat-item h3");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const element = entry.target;

                const text = element.textContent;

                let target = parseInt(text.replace(/[^0-9]/g, ""));

                if (isNaN(target)) return;

                let count = 0;

                const speed = target / 80;

                const updateCounter = () => {

                    if (count < target) {

                        count += speed;

                        element.textContent =
                            Math.floor(count).toLocaleString() + "+";

                        requestAnimationFrame(updateCounter);

                    } else {

                        if (text.includes("%")) {
                            element.textContent = target + "%";
                        }
                        else if (text.includes("24/7")) {
                            element.textContent = "24/7";
                        }
                        else {
                            element.textContent = text;
                        }

                    }

                };

                updateCounter();

                observer.unobserve(element);

            }

        });

    });

    stats.forEach(stat => {
        observer.observe(stat);
    });

}


/* ======================================================
   SCROLL ANIMATION
====================================================== */

function initializeScrollAnimations() {

    const animatedElements = document.querySelectorAll(
        ".feature-card, .timeline-card, .stat-item"
    );

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

            }

        });

    }, {
        threshold: 0.1
    });

    animatedElements.forEach(element => {

        element.style.opacity = "0";
        element.style.transform = "translateY(40px)";
        element.style.transition =
            "all 0.6s ease";

        observer.observe(element);

    });

}


/* ======================================================
   USER GREETING
====================================================== */

function initializeGreeting() {

    const user = getCurrentUser();

    if (!user) return;

    const heroBadge = document.querySelector(".hero-badge");

    if (!heroBadge) return;

    heroBadge.innerHTML =
        `👋 Welcome Back, ${user.name}`;

}
/* ======================================================
   LOAD HOME PAGE DATA
====================================================== */

async function loadHomeData() {

    try {

        const response =
            await fetch("http://localhost:5000/api/home");

        const data =
            await response.json();

        console.log(data);

        if (!data.success) return;

        // Health Overview

        document.getElementById("overallHealth").textContent =
            data.stats.overallHealth;

        document.getElementById("riskLevel").textContent =
            data.stats.riskLevel;

        document.getElementById("healthScore").textContent =
            data.stats.healthScore + "%";

        // Stats

        document.getElementById("totalUsers").textContent =
            data.stats.totalUsers + "+";

        document.getElementById("totalCheckups").textContent =
            data.stats.totalChecks + "+";

        document.getElementById("accuracyRate").textContent =
            data.stats.accuracy + "%";

        document.getElementById("supportStatus").textContent =
            "24/7";

        // Recent Checkups

        const container =
            document.getElementById("recentCheckups");

        container.innerHTML = "";

        data.recentChecks.forEach(check => {

            container.innerHTML += `

                <div class="check-item">

                    <span>${check.disease}</span>

                    <label>
                        ${check.severity}
                    </label>

                </div>

            `;

        });

    }
    catch (error) {

        console.error(
            "Home API Error:",
            error
        );

    }

}

/* ======================================================
   AUTO REDIRECT IF ALREADY LOGGED IN
====================================================== */

window.addEventListener("load", () => {

    const user = getCurrentUser();

    if (!user) return;

    const loginButtons = document.querySelectorAll(
        ".open-login-modal, .open-register-modal"
    );

    loginButtons.forEach(button => {
        button.style.display = "none";
    });

});


// =====================================
// SMART HEALTH SYSTEM
// INDEX.JS
// =====================================

// =====================================
// DOM ELEMENTS
// =====================================

// const logoutBtn =
//     document.getElementById("logoutBtn");

//  

// =====================================
// LOGIN STATUS
// =====================================

function isLoggedIn() {

    return !!localStorage.getItem(
        "token"
    );
}
// =====================================
// NAVBAR UI CONTROL
// =====================================

function updateUI() {

    if (isLoggedIn()) {

        if (loginNavItem)
            loginNavItem.style.display = "none";

        if (registerNavItem)
            registerNavItem.style.display = "none";

        if (dashboardNavItem)
            dashboardNavItem.style.display = "block";

        if (profileNavItem)
            profileNavItem.style.display = "block";

        if (logoutBtn)
            logoutBtn.style.display = "flex";

    } else {

        if (loginNavItem)
            loginNavItem.style.display = "block";

        if (registerNavItem)
            registerNavItem.style.display = "block";

        if (dashboardNavItem)
            dashboardNavItem.style.display = "none";

        if (profileNavItem)
            profileNavItem.style.display = "none";

        if (logoutBtn)
            logoutBtn.style.display = "none";
    }
}

// =====================================
// START BUTTON PROTECTION
// =====================================

function setupProtectedButtons() {

    const startButtons = [

        document.getElementById(
            "startCheckBtn"
        ),

        document.getElementById(
            "heroStartBtn"
        ),

        document.getElementById(
            "ctaBtn"
        )
    ];

    startButtons.forEach(button => {

        if (!button) return;

        button.addEventListener(
            "click",
            (event) => {

                if (!isLoggedIn()) {

                    event.preventDefault();

                    alert(
                        "Please login first to continue."
                    );

                    localStorage.setItem(
                        "openLoginModal",
                        "true"
                    );

                    window.location.href =
                        "index.html";
                }
            }
        );
    });
}

// =====================================
// LOGOUT
// =====================================

// We select it directly here to avoid redeclaration conflicts
const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser(); // This function comes from auth.js
    });
}

// =====================================
// INITIALIZE
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateUI();

        setupProtectedButtons();
    }
);

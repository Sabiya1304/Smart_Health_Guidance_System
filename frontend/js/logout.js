/* ======================================================
   GLOBAL LOGOUT SYSTEM
====================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", (event) => {
            event.preventDefault();

            /* REMOVE LOGIN DATA */

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userId");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("currentUser");

            /* REDIRECT */

            window.location.href = "index.html";
        });
    }
});

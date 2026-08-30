(function () {
    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
        user = null;
    }

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    const currentPage = window.location.pathname.split("/").pop();
    const allowedPagesWithoutProfile = ["profile.html"];

    if (!user.profileCompleted && !allowedPagesWithoutProfile.includes(currentPage)) {
        alert("Complete your profile first!");
        window.location.href = "profile.html";
    }
})();

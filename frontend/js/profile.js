const PROFILE_API_URL = "http://localhost:5000/api/profile";
const HISTORY_API_URL = "http://localhost:5000/api/history";

let currentUser = null;

function readStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch (error) {
        return null;
    }
}

function writeStoredUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userId", user._id);
    localStorage.setItem("token", localStorage.getItem("token") || user._id);
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.innerText = value || "Not Set";
}

function clean(value) {
    return value === null || value === undefined || value === "" ? "Not Set" : value;
}

function initials(name) {
    const parts = String(name || "User").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map(part => part[0]).join("").toUpperCase() || "U";
}

function patientId(userId) {
    return userId ? `PNT-${String(userId).slice(-6).toUpperCase()}` : "Not Set";
}

function formatDate(date) {
    return date ? new Date(date).toLocaleDateString() : "Not Set";
}

function isProfileComplete(user) {
    return [
        user?.name,
        user?.phone,
        user?.age,
        user?.gender,
        user?.bloodGroup,
        user?.emergencyContact,
        user?.address,
        user?.height,
        user?.weight
    ].every(Boolean);
}

async function fetchLatestUser(userId) {
    const response = await fetch(`${PROFILE_API_URL}/${encodeURIComponent(userId)}`, {
        cache: "no-store"
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.user) {
        throw new Error(data.message || "Unable to load profile");
    }

    return data.user;
}

async function fetchLastCheckup(userId) {
    try {
        const response = await fetch(`${HISTORY_API_URL}/${encodeURIComponent(userId)}`, {
            cache: "no-store"
        });

        const history = await response.json();

        if (!response.ok || !Array.isArray(history) || !history.length) {
            return "Not Set";
        }

        return formatDate(history[0].date);
    } catch (error) {
        return "Not Set";
    }
}

function renderProfile(user) {
    const complete = isProfileComplete(user);
    const userInitials = initials(user.name);

    setText("topUserInitials", userInitials);
    setText("profileInitials", userInitials);
    setText("topUserName", clean(user.name));

    setText("profileName", clean(user.name));
    setText("profileEmail", `Email: ${clean(user.email)}`);
    setText("profilePhone", `Phone: ${clean(user.phone)}`);

    setText("memberSince", formatDate(user.date));
    setText("patientId", patientId(user._id));
    setText("bloodGroup", clean(user.bloodGroup));

    setText("infoName", clean(user.name));
    setText("infoEmail", clean(user.email));
    setText("infoPhone", clean(user.phone));
    setText("infoAge", user.age ? `${user.age} Years` : "Not Set");
    setText("infoGender", clean(user.gender));
    setText("infoAddress", clean(user.address));
    setText("infoHeight", clean(user.height));
    setText("infoWeight", clean(user.weight));
    setText("infoBloodGroup", clean(user.bloodGroup));
    setText("infoEmergencyContact", clean(user.emergencyContact));
    setText("profileStatus", complete ? "Complete" : "Incomplete");
    setText("recommendedAction", complete ? "Keep your profile updated" : "Fill missing profile details");
}

function fillEditForm(user) {
    const fields = {
        editName: user.name,
        editPhone: user.phone,
        editAge: user.age,
        editGender: user.gender,
        editBloodGroup: user.bloodGroup,
        editEmergencyContact: user.emergencyContact,
        editAddress: user.address,
        editHeight: user.height,
        editWeight: user.weight
    };

    Object.entries(fields).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input) input.value = value || "";
    });
}

function openPanel() {
    if (!currentUser) return;

    fillEditForm(currentUser);

    document.getElementById("panelOverlay").hidden = false;
    document.getElementById("editPanel").classList.add("open");
    document.getElementById("editPanel").setAttribute("aria-hidden", "false");
}

function closePanel() {
    document.getElementById("panelOverlay").hidden = true;
    document.getElementById("editPanel").classList.remove("open");
    document.getElementById("editPanel").setAttribute("aria-hidden", "true");
}

function readFormUpdates() {
    return {
        name: document.getElementById("editName").value.trim(),
        phone: document.getElementById("editPhone").value.trim(),
        age: document.getElementById("editAge").value,
        gender: document.getElementById("editGender").value,
        bloodGroup: document.getElementById("editBloodGroup").value.trim(),
        emergencyContact: document.getElementById("editEmergencyContact").value.trim(),
        address: document.getElementById("editAddress").value.trim(),
        height: document.getElementById("editHeight").value.trim(),
        weight: document.getElementById("editWeight").value.trim()
    };
}

async function saveProfile(event) {
    event.preventDefault();

    if (!currentUser?._id) return;

    const saveButton = document.getElementById("saveProfileBtn");
    saveButton.disabled = true;
    saveButton.innerText = "Saving...";

    try {
        const response = await fetch(`${PROFILE_API_URL}/${encodeURIComponent(currentUser._id)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(readFormUpdates())
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
            throw new Error(data.message || "Unable to update profile");
        }

        currentUser = data.user;
        writeStoredUser(currentUser);
        renderProfile(currentUser);
        closePanel();
    } catch (error) {
        alert(error.message);
    } finally {
        saveButton.disabled = false;
        saveButton.innerText = "Save Profile";
    }
}

function changePassword() {
    alert("Password update can be added after a backend password API is available.");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    const storedUser = readStoredUser();
    const token = localStorage.getItem("token");

    if (!storedUser?._id || !token) {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    currentUser = storedUser;
    renderProfile(currentUser);

    try {
        currentUser = await fetchLatestUser(storedUser._id);
        writeStoredUser(currentUser);
        renderProfile(currentUser);
    } catch (error) {
        console.log("Profile refresh error:", error);
    }

    setText("lastCheckup", await fetchLastCheckup(storedUser._id));

    document.getElementById("editProfileBtn")?.addEventListener("click", openPanel);
    document.querySelectorAll("[data-open-edit]").forEach(button => {
        button.addEventListener("click", openPanel);
    });
    document.getElementById("closePanelBtn")?.addEventListener("click", closePanel);
    document.getElementById("cancelEditBtn")?.addEventListener("click", closePanel);
    document.getElementById("panelOverlay")?.addEventListener("click", closePanel);
    document.getElementById("profileForm")?.addEventListener("submit", saveProfile);
    document.getElementById("changePasswordBtn")?.addEventListener("click", changePassword);
    document.querySelector(".logout")?.addEventListener("click", logout);
});

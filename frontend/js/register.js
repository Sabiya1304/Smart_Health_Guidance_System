// ===============================
// FORM ELEMENTS
// ===============================
const form = document.getElementById("registerForm");
const btn = document.getElementById("registerBtn");
const messageBox = document.getElementById("messageBox");

// ===============================
// SUBMIT EVENT
// ===============================
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const phone = document.getElementById("phone").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;

    // ================= VALIDATION =================
    if (password !== confirmPassword) {
        showMessage("Passwords do not match ❌", "red");
        return;
    }

    if (!name || !email || !password) {
        showMessage("Please fill required fields ❌", "red");
        return;
    }

    try {
        btn.innerText = "Registering...";
        btn.disabled = true;

        const response = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                password,
                phone,
                age,
                gender
            })
        });

        const data = await response.json();

        // ================= RESPONSE =================
        if (data.success) {
            showMessage("Registered successfully ✅", "green");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);

        } else {
            showMessage(data.message || "Error occurred ❌", "red");
        }

    } catch (err) {
        showMessage("Server error ❌", "red");
    } finally {
        btn.innerText = "Register";
        btn.disabled = false;
    }
});

// ===============================
// MESSAGE FUNCTION
// ===============================
function showMessage(msg, color) {
    messageBox.innerText = msg;
    messageBox.style.color = color;
}

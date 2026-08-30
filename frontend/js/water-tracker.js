const MAX = 2500;

function getToday() {
    return new Date().toDateString();
}

let data = JSON.parse(localStorage.getItem("water")) || {
    date: getToday(),
    total: 0
};

if (data.date !== getToday()) {
    data = { date: getToday(), total: 0 };
    save();
}

function save() {
    localStorage.setItem("water", JSON.stringify(data));
}

function updateUI() {

    let percent = Math.min((data.total / MAX) * 100, 100);

    let height = (percent / 100) * 360; // glass height scale

    document.getElementById("waterFill").setAttribute("height", height);
    document.getElementById("waterFill").setAttribute("y", 380 - height);

    document.getElementById("waterText").innerText =
        `${data.total} / ${MAX} ml`;

    document.getElementById("waterPercent").innerText =
        `${Math.floor(percent)}%`;
}

updateUI();

function addWater() {

    let value = parseInt(document.getElementById("waterInput").value);

    if (!value || value <= 0) {
        alert("Enter valid amount");
        return;
    }

    data.total += value;
    data.date = getToday();

    save();
    updateUI();

    document.getElementById("waterInput").value = "";
}

// midnight reset
setInterval(() => {

    if (data.date !== getToday()) {
        data = { date: getToday(), total: 0 };
        save();
        updateUI();
    }

}, 60000);
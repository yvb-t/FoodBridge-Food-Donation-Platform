
const STORAGE_KEY = "foodbridge_donations";

function futureDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 16);
}

// Sample donations
const sampleFood = [
    {
        id: 1,
        name: "Vegetable Rice",
        category: "Cooked Food",
        quantity: 50,
        location: "Anna Nagar, Chennai",
        expiry: futureDate(1),
        donor: "ABC Restaurant",
        description: "Freshly prepared vegetable rice",
        claimed: false
    },
    {
        id: 2,
        name: "Fresh Apples",
        category: "Fruits",
        quantity: 30,
        location: "T Nagar, Chennai",
        expiry: futureDate(2),
        donor: "Fresh Mart",
        description: "Fresh apples for distribution",
        claimed: false
    },
    {
        id: 3,
        name: "Bread Packets",
        category: "Bakery Items",
        quantity: 40,
        location: "Velachery, Chennai",
        expiry: futureDate(1),
        donor: "City Bakery",
        description: "Fresh bread packets",
        claimed: false
    }
];

let donations;

try {
    donations = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(donations)) {
        donations = sampleFood;
    }
} catch {
    donations = sampleFood;
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Display available donations
function displayFood() {
    const grid = document.getElementById("foodGrid");
    const search = document.getElementById("search").value.toLowerCase();
    const category = document.getElementById("filter").value;

    const filtered = donations.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(search) ||
            item.location.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" || item.category === category;

        return matchesSearch && matchesCategory;
    });

    grid.innerHTML = "";

    if (filtered.length === 0) {
        grid.innerHTML = "<p>No food donations found.</p>";
        return;
    }

    filtered.forEach(item => {
        const expired = new Date(item.expiry) <= new Date();

        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
            <h3>${escapeHTML(item.name)}</h3>
            <p><b>Category:</b> ${escapeHTML(item.category)}</p>
            <p><b>Quantity:</b> ${item.quantity} meals</p>
            <p><b>Location:</b> ${escapeHTML(item.location)}</p>
            <p><b>Donor:</b> ${escapeHTML(item.donor)}</p>
            <p><b>Pickup before:</b>
                ${new Date(item.expiry).toLocaleString()}
            </p>
            <p>${escapeHTML(item.description || "")}</p>
            <button ${item.claimed || expired ? "disabled" : ""}
                onclick="claimFood(${item.id})">
                ${item.claimed ? "Already Claimed" :
                  expired ? "Expired" : "Claim Food"}
            </button>
        `;

        grid.appendChild(card);
    });
}

// Add new donation
document.getElementById("donationForm")
    .addEventListener("submit", function(event) {

    event.preventDefault();

    const item = {
        id: Date.now(),
        name: document.getElementById("foodName").value.trim(),
        category: document.getElementById("foodCategory").value,
        quantity: Number(document.getElementById("quantity").value),
        location: document.getElementById("location").value.trim(),
        expiry: document.getElementById("expiry").value,
        donor: document.getElementById("donorName").value.trim(),
        description: document.getElementById("description").value.trim(),
        claimed: false
    };

    if (new Date(item.expiry) <= new Date()) {
        alert("Please select a future pickup/expiry time.");
        return;
    }

    donations.unshift(item);
    saveData();

    this.reset();

    document.getElementById("formMessage").textContent =
        "Donation submitted successfully! Thank you ❤️";

    displayFood();
    updateStats();
});

// Claim donation
function claimFood(id) {
    const item = donations.find(food => food.id === id);

    if (!item || item.claimed || new Date(item.expiry) <= new Date()) {
        alert("This donation is no longer available.");
        displayFood();
        return;
    }

    const confirmClaim = confirm(
        "Do you want to claim " + item.name + "?"
    );

    if (confirmClaim) {
        item.claimed = true;
        saveData();
        displayFood();
        updateStats();
        alert("Food claimed successfully! Please contact the donor to arrange collection.");
    }
}

// Update statistics
function updateStats() {
    const active = donations.filter(item =>
        !item.claimed && new Date(item.expiry) > new Date()
    );

    const totalMeals = active.reduce(
        (sum, item) => sum + item.quantity, 0
    );

    document.getElementById("donationCount").textContent =
        donations.length;

    document.getElementById("mealCount").textContent =
        totalMeals;
}

// Demo login
function showLogin() {
    const name = prompt("Enter your name to continue:");

    if (name && name.trim()) {
        alert("Welcome to FoodBridge, " + name.trim() + "!");
    }
}

// Initialize website
document.getElementById("expiry").min = futureDate(0);

displayFood();
updateStats();
saveData();

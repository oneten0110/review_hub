// Default shop data (for existing businesses)
const businessData = [
    {
        name: "Bella Pizza",
        category: "Food",
        image: "images/bella-pizza.jpg",
        page: "bella-pizza.html",
        signatureDish: "Classic Margherita Pizza",
        dishes: ["Pepperoni Pizza", "Veggie Supreme"],
        rating: 4
    },
    {
        name: "Green Leaf Spa",
        category: "Spa",
        image: "images/green-leaf-spa.jpg",
        page: "green-leaf-spa.html",
        signatureDish: "Aromatherapy Massage",
        dishes: ["Hot Stone Therapy", "Herbal Steam Bath"],
        rating: 5
    },
    {
        name: "Joe's Coffee",
        category: "Cafe",
        image: "images/joes-coffee.jpg",
        page: "joes-coffee.html",
        signatureDish: "Espresso Shot",
        dishes: ["Cappuccino", "Mocha Latte"],
        rating: 4
    },
    {
        name: "Burger Town",
        category: "Food",
        image: "images/burger-town.jpg",
        page: "burger-town.html",
        signatureDish: "Classic Cheeseburger",
        dishes: ["Bacon Burger", "Veggie Delight"],
        rating: 3
    }
];

let fetchedShops = []; // Store fetched MongoDB shops globally

// Fetch shops from MongoDB and store them
async function fetchShops() {
    try {
        const response = await fetch("http://localhost:5000/api/shops");
        fetchedShops = await response.json(); // Store MongoDB shops globally
        renderBusinesses("All"); // Render all shops initially
    } catch (error) {
        console.error("❌ Error fetching shops:", error);
    }
}

// Render businesses (hardcoded + MongoDB shops)
function renderBusinesses(category = "All", searchQuery = "") {
    const businessList = document.getElementById("business-list");
    businessList.innerHTML = ""; // Clear previous entries

    // Combine default business data with fetched MongoDB shops
    const allShops = [...businessData, ...fetchedShops]; 

    // Update background based on category
    const body = document.body;
    let backgroundImage = "url('images/default-background.jpg')"; // Default

    if (category === "Food") backgroundImage = "url('images/food-background.jpg')";
    else if (category === "Spa") backgroundImage = "url('images/spa-background.jpg')";
    else if (category === "Cafe") backgroundImage = "url('images/cafe-background.jpg')";

    body.style.backgroundImage = backgroundImage;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.transition = "background-image 0.5s ease-in-out";

    // Filter businesses (new & existing)
    const filteredBusinesses = allShops.filter((business) => {
        const name = business.name || business.shopName; // Handle both hardcoded & MongoDB shops
        const matchesCategory = category === "All" || business.category === category;
        const matchesSearch =
            name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            business.signatureDish?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (business.dishes && business.dishes.some(dish => dish.toLowerCase().includes(searchQuery.toLowerCase())));

        return matchesCategory && matchesSearch;
    });

    // Display businesses
    filteredBusinesses.forEach((business) => {
        const businessCard = document.createElement("div");
        businessCard.className = "business-card";

        // Handle missing pages by generating a dynamic one
        const shopPage = business.page || `shop.html?name=${encodeURIComponent(business.name || business.shopName)}`;

        businessCard.innerHTML = `
            <a href="${shopPage}" class="business-link">
                <img src="${business.image || (business.imageUrl ? `http://localhost:5000${business.imageUrl}` : '')}" 
                     alt="${business.name || business.shopName}">
                <h3>${business.name || business.shopName}</h3>
                <p>Category: ${business.category}</p>
                <div class="signature-dish">Signature Dish: ${business.signatureDish}</div>
                <ul class="dishes">
                    ${business.dishes ? business.dishes.map(dish => `<li>${dish}</li>`).join("") : ""}
                </ul>
            </a>
        `;

        businessList.appendChild(businessCard);
    });

    if (filteredBusinesses.length === 0) {
        businessList.innerHTML = "<p class='no-results'>No results found.</p>";
    }
}

// Ensure the fetched shops persist across category changes
document.querySelectorAll(".category-button").forEach(button => {
    button.addEventListener("click", (event) => {
        const category = event.target.dataset.category || "All";
        renderBusinesses(category); // Use previously fetched data
    });
});

// Search event listener
document.getElementById("search-bar").addEventListener("input", (e) => {
    const searchQuery = e.target.value;
    renderBusinesses("All", searchQuery); // Ensure all shops are considered
});

// Redirect to the shopkeeper page
document.getElementById("shopkeeper-btn").addEventListener("click", function() {
    window.location.href = "shopkeeper.html";
});

// Load MongoDB shops when the page loads
document.addEventListener("DOMContentLoaded", fetchShops);

// --- LOGIN & SIGNUP MODAL ---
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const loginModal = document.getElementById("login-modal");
const signupModal = document.getElementById("signup-modal");
const closeBtns = document.querySelectorAll(".close");

// Show login modal
loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
});

// Show sign-up modal
signupBtn.addEventListener("click", () => {
    signupModal.style.display = "flex";
});

// Close modals when "X" is clicked
closeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        loginModal.style.display = "none";
        signupModal.style.display = "none";
    });
});

// Close modal if clicked outside
window.addEventListener("click", (event) => {
    if (event.target === loginModal) loginModal.style.display = "none";
    if (event.target === signupModal) signupModal.style.display = "none";
});

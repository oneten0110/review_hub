document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shopName = urlParams.get("name");

    if (!shopName) {
        document.getElementById("shop-title").textContent = "Shop Not Found";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/shops`);
        const shops = await response.json();
        
        const shop = shops.find(s => s.shopName.toLowerCase() === shopName.toLowerCase());

        if (!shop) {
            document.getElementById("shop-title").textContent = "Shop Not Found";
            return;
        }

        document.getElementById("shop-title").textContent = shop.shopName;
        document.getElementById("shop-name").textContent = shop.shopName;
        document.getElementById("shop-image").src = `http://localhost:5000${shop.imageUrl}`;
        document.getElementById("signature-dish").textContent = shop.signatureDish;
        document.getElementById("shop-contact").textContent = shop.contact || "N/A";
        document.getElementById("shop-landline").textContent = shop.landline || "N/A";

        const menuList = document.getElementById("menu-list");
        menuList.innerHTML = shop.menuItems.map(item => `<li>${item}</li>`).join("");

    } catch (error) {
        console.error("❌ Error loading shop details:", error);
    }
});

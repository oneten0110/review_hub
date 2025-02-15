document.getElementById("shop-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const shopName = document.getElementById("shop-name").value;
    const category = document.getElementById("category").value;
    const imageFile = document.getElementById("shop-image").files[0];
    const signatureDish = document.getElementById("signature-dish").value;
    const menuItems = document.getElementById("menu-items").value.split(",").map(item => item.trim());

    if (!imageFile) {
        alert("Please upload an image.");
        return;
    }

    const formData = new FormData();
    formData.append("shopName", shopName);
    formData.append("category", category);
    formData.append("image", imageFile); // Attach the file
    formData.append("signatureDish", signatureDish);
    formData.append("menuItems", JSON.stringify(menuItems));

    try {
        const response = await fetch("http://localhost:5000/api/shops", {
            method: "POST",
            body: formData, // Send file as FormData
        });

        if (response.ok) {
            alert("✅ Shop added successfully!");
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert("❌ Failed to add shop.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    }
});

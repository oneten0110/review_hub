document.getElementById("reservation-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const contact = document.getElementById("contact").value;
    const time = document.getElementById("time").value;
    const chairs = document.getElementById("chairs").value;

    if (!name || !email || !contact || !time || !chairs) {
        alert("❌ Please fill in all fields.");
        return;
    }

    const reservationData = { name, email, contact, time, chairs };

    try {
        const response = await fetch("http://localhost:5000/api/reservation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reservationData),
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Reservation Confirmed! Check your email.");
        } else {
            alert("❌ Error: " + result.error);
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Failed to send reservation request.");
    }
});

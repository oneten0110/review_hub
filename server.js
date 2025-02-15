require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve images correctly

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Multer Storage Config for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

// ✅ Define Shop Schema
const shopSchema = new mongoose.Schema({
    shopName: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    signatureDish: { type: String, required: true },
    menuItems: { type: [String], required: true }
});
const Shop = mongoose.model("Shop", shopSchema);

// ✅ Define Reservation Schema
const reservationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    time: { type: String, required: true },
    chairs: { type: Number, required: true }
});
const Reservation = mongoose.model("Reservation", reservationSchema);

// ✅ API: Get all shops
app.get("/api/shops", async (req, res) => {
    try {
        const shops = await Shop.find();
        res.json(shops);
    } catch (error) {
        console.error("❌ Error fetching shops:", error);
        res.status(500).json({ error: "Failed to fetch shops" });
    }
});

// ✅ API: Add new shop (with image upload)
app.post("/api/shops", upload.single("image"), async (req, res) => {
    try {
        console.log("📸 File received:", req.file);
        console.log("📩 Form data:", req.body);

        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded!" });
        }

        let { shopName, category, signatureDish, menuItems } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`;

        // ✅ Ensure menuItems is always an array
        try {
            menuItems = JSON.parse(menuItems);
            if (!Array.isArray(menuItems)) throw new Error();
        } catch {
            menuItems = menuItems.split(",").map(item => item.trim());
        }

        if (!Array.isArray(menuItems) || menuItems.length === 0) {
            return res.status(400).json({ error: "Invalid menu format. Must be an array with at least one item." });
        }

        const newShop = new Shop({ shopName, category, imageUrl, signatureDish, menuItems });

        await newShop.save();
        res.status(201).json({ message: "✅ Shop added successfully!", shop: newShop });

    } catch (error) {
        console.error("❌ Error adding shop:", error);
        res.status(500).json({ error: "Server error while adding shop" });
    }
});

// ✅ API: Send Reservation Email & Store in DB
app.post("/api/reservation", async (req, res) => {
    try {
        const { name, email, contact, time, chairs } = req.body;

        if (!name || !email || !contact || !time || !chairs) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        // ✅ Save to MongoDB
        const newReservation = new Reservation({ name, email, contact, time, chairs });
        await newReservation.save();

        // 📩 Set up Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your Gmail
                pass: process.env.EMAIL_PASS, // Your Gmail App Password
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Reservation Confirmation - Slize",
            text: `Hello ${name},\n\nYour reservation has been confirmed.\n\nDetails:\n- Time: ${time}\n- Number of Chairs: ${chairs}\n\nThank you for choosing Slize!\n\nBest Regards,\nSlize Team`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "✅ Reservation confirmed & email sent!" });

    } catch (error) {
        console.error("❌ Error processing reservation:", error);
        res.status(500).json({ error: "Server error while processing reservation." });
    }
});

// ✅ Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
// ✅ Reservation API: Store reservation & send email
app.post("/api/reservation", async (req, res) => {
    const { name, email, contact, time, chairs } = req.body;

    if (!name || !email || !contact || !time || !chairs) {
        return res.status(400).json({ error: "❌ All fields are required!" });
    }

    // 📩 Setup Nodemailer Transport
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail
            pass: process.env.EMAIL_PASS, // Your App Password
        },
    });

    // 📩 Email content
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reservation Confirmation - Slize",
        text: `Hello ${name},\n\nYour reservation has been confirmed.\n\nDetails:\n- Time: ${time}\n- Number of Chairs: ${chairs}\n\nThank you for choosing Slize!\n\nBest Regards,\nSlize Team`,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "✅ Reservation Confirmed & Email Sent!" });
    } catch (error) {
        console.error("❌ Email Error:", error);
        res.status(500).json({ error: "❌ Failed to send email." });
    }
});

import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// ✅ Show Contact Us Page
router.get("/", (req, res) => {
    res.render("contact", { user: req.session.user || null });
});

// ✅ Handle Form Submission
router.post("/submit", async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).send("All fields are required!");
    }

    try {
        // ✅ Setup Mail Transporter (Use your SMTP or Gmail credentials)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email password
            },
        });

        // ✅ Email content
        const mailOptions = {
            from: email,
            to: process.env.ADMIN_EMAIL, // Admin's email
            subject: `New Contact Form Submission from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        };

        // ✅ Send Email
        await transporter.sendMail(mailOptions);
        console.log("📩 Email Sent Successfully!");
        res.send("Your message has been sent successfully!");
    } catch (error) {
        console.error("❌ Error sending email:", error);
        res.status(500).send("An error occurred while sending the email.");
    }
});

export default router;

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Contact Form Submission Handler
export const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // ✅ Configure Nodemailer Transporter
        let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.ADMIN_EMAIL, // Your admin email
                pass: process.env.ADMIN_PASSWORD, // Your email password (use app password if needed)
            },
        });

        // ✅ Email Options
        let mailOptions = {
            from: email,
            to: process.env.ADMIN_EMAIL, // Send email to admin
            subject: `New Contact Form Submission: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
        };

        // ✅ Send Email
        await transporter.sendMail(mailOptions);
        console.log("📩 Contact form email sent successfully.");

        res.send("Thank you for your message! We will get back to you soon.");
    } catch (error) {
        console.error("❌ Error sending contact form email:", error);
        res.status(500).send("Error submitting form. Please try again later.");
    }
};

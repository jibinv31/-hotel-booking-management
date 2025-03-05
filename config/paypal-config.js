import paypal from "paypal-rest-sdk";
import dotenv from "dotenv";

// ✅ Load environment variables
dotenv.config();

paypal.configure({
    mode: process.env.PAYPAL_MODE || "sandbox", // "sandbox" or "live"
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// ✅ Correctly export PayPal instance
export default paypal;

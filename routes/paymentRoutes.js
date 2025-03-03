import express from "express";
import {
  showPaymentForm,
  processPayment,
  handlePayPalSuccess,
  handlePayPalCancel,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Show Payment Form (Only logged-in users can access)
router.get("/:booking_id", verifyToken, showPaymentForm);

// ✅ Process Payment (Stripe / PayPal / Test Card)
router.post("/process", verifyToken, processPayment);

// ✅ PayPal Success & Cancellation Routes
router.get("/paypal/success", verifyToken, handlePayPalSuccess);
router.get("/paypal/cancel", verifyToken, handlePayPalCancel);

export default router;

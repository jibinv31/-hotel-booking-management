import express from "express";
import {
  showPaymentForm,
  processPayment,
  handlePayPalSuccess,
  handlePayPalCancel,
} from "../controllers/paymentController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Step 1: Show Payment Page (Before Creating Booking)
router.get("/new", verifyToken, showPaymentForm);

// ✅ Step 2: Process Payment
router.post("/process", verifyToken, processPayment);

// ✅ Step 3: Handle PayPal Success & Cancellation
router.get("/paypal/success", verifyToken, handlePayPalSuccess);
router.get("/paypal/cancel", verifyToken, handlePayPalCancel);

export default router;

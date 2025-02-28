import express from "express";
import {
  showPaymentForm,
  processPayment,
  handlePayPalSuccess,
  handlePayPalCancel,
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/:booking_id", showPaymentForm);
router.post("/process", processPayment);
router.get("/paypal/success", handlePayPalSuccess);
router.get("/paypal/cancel", handlePayPalCancel);

export default router;

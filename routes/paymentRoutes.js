import express from "express";
import paypal from "paypal-rest-sdk";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// ✅ 1. Show Payment Form
router.get("/:booking_id", async (req, res) => {
  const { booking_id } = req.params;
  const booking = await Booking.findByPk(booking_id);

  if (!booking) return res.status(404).send("Booking not found");

  res.render("payment", { booking_id, amount: booking.amount });
});

// ✅ 2. Process Payment (Test Card or PayPal)
router.post("/process", async (req, res) => {
  const { booking_id, amount, payment_method, card_number } = req.body;

  try {
    if (payment_method === "test_card") {
      // ✅ Validate Card Number (16-digit check)
      if (!/^\d{16}$/.test(card_number)) {
        return res
          .status(400)
          .json({ message: "Invalid test card number. It must be 16 digits." });
      }

      // ✅ Store Test Payment in Database
      await Payment.create({
        booking_id,
        amount,
        payment_method: "test_card",
        status: "completed",
        transaction_id: `TEST_${Date.now()}`,
      });

      return res.status(200).json({ message: "Test payment successful" });
    } else if (payment_method === "paypal") {
      const payment_json = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          return_url: `http://localhost:3000/payments/paypal/success?booking_id=${booking_id}&amount=${amount}`,
          cancel_url: `http://localhost:3000/payments/paypal/cancel`,
        },
        transactions: [
          {
            amount: { total: amount.toFixed(2), currency: "USD" },
            description: `Payment for Booking ID: ${booking_id}`,
          },
        ],
      };

      paypal.payment.create(payment_json, (error, payment) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: "PayPal payment failed" });
        } else {
          res.redirect(payment.links[1].href);
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Payment failed" });
  }
});

// ✅ 3. Handle PayPal Success
router.get("/paypal/success", async (req, res) => {
  const { PayerID, paymentId, booking_id, amount } = req.query;

  const execute_payment_json = {
    payer_id: PayerID,
    transactions: [{ amount: { total: amount, currency: "USD" } }],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    async (error, payment) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: "PayPal execution failed" });
      }

      await Payment.create({
        booking_id,
        amount,
        payment_method: "paypal",
        status: "completed",
        transaction_id: payment.id,
      });

      res.status(200).json({ message: "PayPal payment successful", payment });
    }
  );
});

// ✅ 4. Handle PayPal Cancel
router.get("/paypal/cancel", (req, res) => {
  res.status(400).json({ message: "PayPal payment canceled" });
});

export default router;

import Payment from "../models/Payment.js";
import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";
import paypal from "paypal-rest-sdk";
import dotenv from "dotenv";

dotenv.config();

// ✅ Configure PayPal
paypal.configure({
  mode: process.env.PAYPAL_MODE || "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

// ✅ Show Payment Form
export const showPaymentForm = async (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date, amount } = req.query;

    console.log(`🔍 Initiating payment for Room ID: ${room_id}, Amount: ${amount}`);

    // ✅ Fetch Room details
    if (!room_id) {
      console.error("❌ Room ID is missing.");
      return res.status(400).send("Room ID is required.");
    }

    const room = await Room.findByPk(room_id);
    if (!room) {
      console.error(`❌ Room not found: ID ${room_id}`);
      return res.status(404).send("Room not found");
    }

    // ✅ Ensure amount is a valid number
    const formattedAmount = parseFloat(amount);
    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      console.error("❌ Invalid amount provided for payment.");
      return res.status(400).send("Invalid payment amount.");
    }

    // ✅ Store booking details in session before rendering payment page
    req.session.bookingDetails = { room_id, check_in_date, check_out_date, amount };

    res.render("payment", {
      booking: {
        Room: room,
        check_in_date,
        check_out_date,
        amount: formattedAmount.toFixed(2),
      },
    });
  } catch (error) {
    console.error("❌ Error loading payment form:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Process Payment (Credit/Debit Card & PayPal)
export const processPayment = async (req, res) => {
  let { room_id, check_in_date, check_out_date, amount, payment_method } = req.body;

  try {
    console.log(`💳 Processing payment for Room ID: ${room_id}, Amount: ${amount}, Method: ${payment_method}`);

    // ✅ Convert amount to number
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0 || !room_id) {
      console.warn("⚠️ Invalid amount or missing room ID.");
      return res.status(400).json({ message: "Invalid payment details." });
    }

    // ✅ Store booking details in session before redirecting to PayPal
    req.session.bookingDetails = { room_id, check_in_date, check_out_date, amount };

    if (payment_method === "paypal") {
      console.log("🔁 Initiating PayPal payment...");

      const payment_json = {
        intent: "sale",
        payer: { payment_method: "paypal" },
        redirect_urls: {
          return_url: `http://localhost:3000/payments/paypal/success`,
          cancel_url: `http://localhost:3000/payments/paypal/cancel`,
        },
        transactions: [
          {
            amount: { total: amount.toFixed(2), currency: "USD" },
            description: `Payment for Room ID: ${room_id}`,
          },
        ],
      };

      paypal.payment.create(payment_json, (error, payment) => {
        if (error) {
          console.error("❌ PayPal Error:", error);
          return res.status(500).json({ message: "PayPal payment failed" });
        } else {
          console.log("✅ PayPal payment initiated. Redirecting user...");
          res.redirect(payment.links.find(link => link.rel === "approval_url").href);
        }
      });

      return;
    }
  } catch (error) {
    console.error("❌ Payment processing error:", error);
    res.status(500).json({ message: "Payment failed" });
  }
};

// ✅ Handle PayPal Success
export const handlePayPalSuccess = async (req, res) => {
  try {
    const { paymentId, PayerID } = req.query;

    console.log(`✅ PayPal Success: Payment ID ${paymentId}`);

    // ✅ Retrieve booking details from session
    const bookingDetails = req.session.bookingDetails;

    if (!bookingDetails) {
      console.error("❌ Missing required booking details in PayPal success.");
      return res.status(400).send("Missing booking details.");
    }

    const { room_id, check_in_date, check_out_date, amount } = bookingDetails;

    // ✅ Ensure user is authenticated
    if (!req.user || !req.user.id) {
      console.error("❌ Unauthorized user attempting to confirm booking.");
      return res.status(401).send("Unauthorized.");
    }

    // ✅ Create Booking in Database
    const newBooking = await Booking.create({
      user_id: req.user.id,
      room_id,
      check_in_date,
      check_out_date,
      amountPaid: parseFloat(amount).toFixed(2),
      status: "confirmed",
    });

    await Payment.create({
      booking_id: newBooking.id,
      amount: parseFloat(amount).toFixed(2),
      payment_method: "paypal",
      status: "completed",
      transaction_id: paymentId,
    });

    console.log(`✅ PayPal Payment Completed. Booking Created: ID=${newBooking.id}`);

    // ✅ Clear session booking details
    delete req.session.bookingDetails;

    // ✅ Redirect to Bookings Page after successful payment
    return res.redirect("/bookings");
  } catch (error) {
    console.error("❌ PayPal Success Handling Error:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Handle PayPal Cancel
export const handlePayPalCancel = (req, res) => {
  console.warn("⚠️ PayPal Payment Canceled");
  res.json({ message: "PayPal payment canceled" });
};

import Payment from "../models/Payment.js";
import { Booking } from "../models/Booking.js"; // ✅ Correct path
import paypal from "paypal-rest-sdk";

// ✅ Show Payment Form
export const showPaymentForm = async (req, res) => {
  try {
    const { booking_id } = req.params;
    console.log(`🔍 Fetching booking ID: ${booking_id}`);

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      console.error(`❌ Booking not found: ID ${booking_id}`);
      return res.status(404).send("Booking not found");
    }

    res.render("payment", { booking_id, amount: booking.amountPaid });
  } catch (error) {
    console.error("❌ Error loading payment form:", error);
    res.status(500).send("Server error");
  }
};

// ✅ Process Payment (Stripe/PayPal)
export const processPayment = async (req, res) => {
  const { booking_id, amount, payment_method, card_number } = req.body;

  try {
    console.log(`💳 Processing payment for Booking ID: ${booking_id}, Method: ${payment_method}`);

    if (payment_method === "test_card") {
      // ✅ Validate Test Card
      if (!/^\d{16}$/.test(card_number)) {
        console.warn("⚠️ Invalid test card number entered.");
        return res.status(400).json({ message: "Invalid test card number. It must be 16 digits." });
      }

      // ✅ Save Payment (Simulated)
      await Payment.create({
        booking_id,
        amount,
        payment_method: "test_card",
        status: "completed",
        transaction_id: `TEST_${Date.now()}`,
      });

      console.log("✅ Test payment successful!");
      return res.status(200).json({ message: "Test payment successful" });

    } else if (payment_method === "paypal") {
      // ✅ PayPal Payment
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

      paypal.payment.create(payment_json, async (error, payment) => {
        if (error) {
          console.error("❌ PayPal Error:", error);
          return res.status(500).json({ message: "PayPal payment failed" });
        } else {
          console.log("✅ PayPal payment initiated. Redirecting user...");
          res.redirect(payment.links[1].href);
        }
      });
    } else {
      console.warn("⚠️ Invalid payment method:", payment_method);
      return res.status(400).json({ message: "Invalid payment method" });
    }
  } catch (error) {
    console.error("❌ Payment processing error:", error);
    res.status(500).json({ message: "Payment failed" });
  }
};

// ✅ Handle PayPal Success
export const handlePayPalSuccess = async (req, res) => {
  try {
    const { booking_id, amount, paymentId, PayerID } = req.query;
    console.log(`✅ PayPal Success: Payment ID ${paymentId}, Booking ID: ${booking_id}`);

    // ✅ Capture PayPal Payment
    const execute_payment_json = {
      payer_id: PayerID,
      transactions: [{ amount: { currency: "USD", total: amount } }],
    };

    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
      if (error) {
        console.error("❌ PayPal Payment Execution Error:", error);
        return res.status(500).send("PayPal payment execution failed.");
      } else {
        console.log("✅ PayPal Payment Completed:", payment.id);

        await Payment.create({
          booking_id,
          amount,
          payment_method: "paypal",
          status: "completed",
          transaction_id: payment.id,
        });

        return res.redirect(`/bookings/success?booking_id=${booking_id}`);
      }
    });
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

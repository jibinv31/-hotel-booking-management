import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import paypal from "paypal-rest-sdk";

// ✅ Show Payment Form
export const showPaymentForm = async (req, res) => {
  const { booking_id } = req.params;
  const booking = await Booking.findByPk(booking_id);

  if (!booking) return res.status(404).send("Booking not found");

  res.render("payment", { booking_id, amount: booking.amount });
};

// ✅ Process Payment (Stripe/PayPal)
export const processPayment = async (req, res) => {
  const { booking_id, amount, payment_method, card_number } = req.body;

  try {
    if (payment_method === "test_card") {
      if (!/^\d{16}$/.test(card_number)) {
        return res
          .status(400)
          .json({ message: "Invalid test card number. It must be 16 digits." });
      }

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
};

// ✅ Handle PayPal Success
export const handlePayPalSuccess = (req, res) => {
  res.json({ message: "PayPal payment successful" });
};

// ✅ Handle PayPal Cancel
export const handlePayPalCancel = (req, res) => {
  res.json({ message: "PayPal payment canceled" });
};

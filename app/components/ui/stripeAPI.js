const STRIPE_SECRET_KEY = "sk_test_51Ob2fwJPY3RNRZWOSpnCCYYhBtyr9I9N5Ev9Jb2BZ3swFtirf93wPRSixM6LW7T9W6CdROypjBdO8H4z3gG2IXwN00zacYlPbX";
const express = require("express");
const stripe = require("stripe")(STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;
  console.log("Received amount:", amount);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
    });
    console.log("Payment Intent created:", paymentIntent);
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/payment-sheet", async (req, res) => {
  const { amount } = req.body;
  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2022-11-15" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
    });
    
    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
    });
  } catch (error) {
    console.error("Error creating payment sheet:", error);
    res.status(500).send({ error: error.message });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
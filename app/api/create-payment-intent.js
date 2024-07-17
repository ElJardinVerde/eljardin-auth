const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log("Received request:", req.method, req.url);
  console.log("Request headers:", req.headers);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    console.log(`Method ${req.method} not allowed`);
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log("Request body:", req.body);
  const { amount } = req.body;
  console.log("Received amount:", amount);

  if (!amount || isNaN(amount)) {
    console.error("Invalid amount:", amount);
    return res.status(400).json({ error: "Invalid amount provided" });
  }

  try {
    console.log("Creating payment intent with amount:", amount);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
    });
    console.log("Payment Intent created:", paymentIntent);

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};
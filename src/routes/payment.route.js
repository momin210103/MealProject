import express from "express";
import SSLCommerzPayment from "sslcommerz-lts";

const router = express.Router();

router.post("/initiate", async (req, res) => {
  const { amount, customerName, customerEmail, customerPhone } = req.body;

  const data = {
    total_amount: amount,
    currency: "BDT",
    tran_id: `TRX-${Date.now()}`,
    success_url: "https://your-frontend-live.com/payment-success",
    fail_url: "https://your-frontend-live.com/payment-fail",
    cancel_url: "https://your-frontend-live.com/payment-cancel",
    product_name: "Meal Balance Add",
    cus_name: customerName,
    cus_email: customerEmail,
    cus_phone: customerPhone,
  };

  const store_id = process.env.Store_ID;
  const store_passwd = process.env.Store_Password;
  const is_live = false;

  try {
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    const response = await sslcz.init(data);
    res.json({ url: response.GatewayPageURL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
});

export default router;

const Payment = require("../models/Payment.js");
const User = require("../models/User.js");
const Project = require("../models/Project.js");

const PaymentAdd = async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    await newPayment.save();
    res.status(201).json({ success: true, data: newPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const PaymentsGet = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, amount } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (amount) filter.amount = { $gte: Number(amount) };

    // Calculate the skip value for pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Fetch filtered and paginated payments
    const payments = await Payment.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .populate("projectId");

    if (payments.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Payments data not found!" });
    }

    const total = await Payment.countDocuments(filter);

    // Respond with paginated and filtered data
    return res.status(200).json({
      success: true,
      count: payments.length,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const PaymentGet = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate("projectId");
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const PaymentUpdate = async (req, res) => {
  try {
    const { amount, status } = req.body;

    // Find the payment by its ID
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    payment.amount = amount || payment.amount;
    payment.status = status || payment.status;

    // Save the updated payment
    await payment.save();

    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const PaymentDelete = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment removed",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  PaymentAdd,
  PaymentsGet,
  PaymentDelete,
  PaymentUpdate,
  PaymentGet,
};

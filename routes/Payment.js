const router = require("express").Router();
const Joi = require("joi");

const {
  PaymentAdd,
  PaymentsGet,
  PaymentDelete,
  PaymentUpdate,
  PaymentGet,
} = require("../controllers/PaymentController.js");

const validateRequest = require("../middleware/validate-request.js");

const { authMiddleware } = require("../middleware/authMiddleware.js");
router.use(authMiddleware);

//? Payment router
router.post("/payment-add", AddValidation, PaymentAdd);
router.get("/payment-get", PaymentsGet);
router.get("/payment-get/:id", PaymentGet);
router.put("/payment-update/:id", UpdateValidation, PaymentUpdate);
router.delete("/payment-delete/:id", PaymentDelete);

function AddValidation(req, res, next) {
  const schema = Joi.object({
    projectId: Joi.string().required().messages({
      "any.required": "Project ID is required",
      "string.empty": "Project ID cannot be empty",
    }),
    amount: Joi.number().positive().required().messages({
      "any.required": "Amount is required",
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be positive",
    }),
    status: Joi.string().valid("paid", "unpaid").default("unpaid").messages({
      "any.only": "Status must be either 'paid' or 'unpaid'",
    }),
  });
  validateRequest(req, res, next, schema);
}

function UpdateValidation(req, res, next) {
  const schema = Joi.object({
    amount: Joi.number().positive().messages({
      "number.base": "Amount must be a number",
      "number.positive": "Amount must be positive",
    }),
    status: Joi.string().valid("paid", "unpaid").messages({
      "any.only": "Status must be either 'paid' or 'unpaid'",
    }),
  }).min(1);
  validateRequest(req, res, next, schema);
}

module.exports = router;

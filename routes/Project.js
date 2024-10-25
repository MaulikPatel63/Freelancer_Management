const router = require("express").Router();
const Joi = require("joi");

const {
  ProjectAdd,
  ProjectsGet,
  ProjectDelete,
  ProjectUpdate,
  ProjectGet,
} = require("../controllers/ProjectController.js");

const validateRequest = require("../middleware/validate-request.js");

const { authMiddleware } = require("../middleware/authMiddleware.js");
router.use(authMiddleware);

//? Project router
router.post("/project-add", AddValidation, ProjectAdd);
router.get("/project-get", ProjectsGet);
router.get("/project-get/:id", ProjectGet);
router.put("/project-update/:id", UpdateValidation, ProjectUpdate);
router.delete("/project-delete/:id", ProjectDelete);

function AddValidation(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      "string.empty": "Project name is required",
      "any.required": "Project name is required",
    }),
    description: Joi.string().optional().allow("").messages({
      "string.base": "Description must be a string",
    }),
    dueDate: Joi.date().required().messages({
      "date.base": "Due date must be a valid date",
      "any.required": "Due date is required",
    }),
    status: Joi.string()
      .valid("pending", "active", "completed")
      .optional()
      .messages({
        "any.only": 'Status must be one of "pending", "active", or "completed"',
      }),
  });
  validateRequest(req, res, next, schema);
}

function UpdateValidation(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().optional().messages({
      "string.empty": "Project name cannot be empty",
    }),
    description: Joi.string().optional().allow("").messages({
      "string.base": "Description must be a string",
    }),
    dueDate: Joi.date().optional().messages({
      "date.base": "Due date must be a valid date",
    }),
    status: Joi.string()
      .valid("pending", "active", "completed")
      .optional()
      .messages({
        "any.only": 'Status must be one of "pending", "active", or "completed"',
      }),
  });
  validateRequest(req, res, next, schema);
}

module.exports = router;

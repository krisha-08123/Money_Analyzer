const { body, validationResult } = require("express-validator");

const validateTransaction = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),

  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),

  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  }
];

module.exports = { validateTransaction };
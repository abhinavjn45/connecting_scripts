const { validationResult } = require('express-validator');

// Reusable middleware to validate rules and return 400 with errors if failed
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Format error messages nicely
    const extractedErrors = errors.array().map(err => err.msg);
    return res.status(400).json({
      success: false,
      message: extractedErrors.join(' ')
    });
  }
  next();
};

module.exports = { validate };

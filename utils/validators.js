const { body, param, query } = require("express-validator")


const userValidation = {
  register: [
    body("username")
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username must be 3-50 characters and contain only letters, numbers, and underscores"),
    body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("password")
      .isLength({ min: 6 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must be at least 6 characters with uppercase, lowercase, and number"),
    body("firstName").optional().isLength({ max: 50 }).trim().withMessage("First name must be less than 50 characters"),
    body("lastName").optional().isLength({ max: 50 }).trim().withMessage("Last name must be less than 50 characters"),
  ],

  login: [
    body("username").notEmpty().trim().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  updateProfile: [
    body("firstName").optional().isLength({ max: 50 }).trim(),
    body("lastName").optional().isLength({ max: 50 }).trim(),
    body("email").optional().isEmail().normalizeEmail(),
  ],
}

const predictionValidation = {
  create: [
    body("matchId").isInt({ min: 1 }).withMessage("Valid match ID is required"),
    body("predictionType").isIn(["HOME", "DRAW", "AWAY"]).withMessage("Prediction type must be HOME, DRAW, or AWAY"),
    body("stakeAmount").isFloat({ min: 0.01, max: 10000 }).withMessage("Stake amount must be between 0.01 and 10000"),
  ],
}

const queryValidation = {
  pagination: [
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("offset").optional().isInt({ min: 0 }).withMessage("Offset must be a non-negative integer"),
  ],

  matchFilters: [
    query("league").optional().isLength({ min: 1, max: 100 }).trim(),
    query("status").optional().isIn(["SCHEDULED", "IN_PLAY", "FINISHED", "POSTPONED", "CANCELLED"]),
  ],
}

// Parameter validation
const paramValidation = {
  id: [param("id").isInt({ min: 1 }).withMessage("Valid ID is required")],
}

module.exports = {
  userValidation,
  predictionValidation,
  queryValidation,
  paramValidation,
}

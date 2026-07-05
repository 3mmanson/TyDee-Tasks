const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { success: false, error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 reset requests per hour
  message: { success: false, error: 'Too many password reset requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { authLimiter, passwordResetLimiter };

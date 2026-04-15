const rateLimit = require('express-rate-limit');

// Auth routes: 15 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { msg: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

// General API: 100 requests per minute
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { msg: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, apiLimiter };

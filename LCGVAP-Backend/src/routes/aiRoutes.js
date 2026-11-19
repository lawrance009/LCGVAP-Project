const express = require('express');
const rateLimit = require('express-rate-limit');
const aiController = require('../controllers/aiController');
const validate = require('../middleware/validate');
const { publicAiChatSchema } = require('../validation/schemas');

const router = express.Router();

const publicChatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.AI_PUBLIC_CHAT_RATE_LIMIT_MAX || 12),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many chat messages. Please slow down.' },
  skip: (req) => req.method === 'OPTIONS',
});

router.post(
  '/public-chat',
  publicChatLimiter,
  validate(publicAiChatSchema),
  aiController.publicChat
);

router.post(
  '/public-chat/stream',
  publicChatLimiter,
  validate(publicAiChatSchema),
  aiController.publicChatStream
);

module.exports = router;

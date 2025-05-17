const express = require('express');
const router = express.Router();

// Import controllers
const {
  classifyTransformation,
  generateTransformationFunction,
  explainTransformation
} = require('../controllers/llmController');

// Routes
router.post('/classify', classifyTransformation);
router.post('/generate', generateTransformationFunction);
router.post('/explain', explainTransformation);

module.exports = router;

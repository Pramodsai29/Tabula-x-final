const express = require('express');
const router = express.Router();
const { 
  classifyTransformation, 
  generateTransformationFunction, 
  explainTransformation 
} = require('../controllers/grokController');

// Transformation routes using Grok
router.post('/classify', classifyTransformation);
router.post('/generate', generateTransformationFunction);
router.post('/explain', explainTransformation);

module.exports = router;

const express = require('express');
const router = express.Router();

// Import controllers
const {
  joinDatasets,
  getFuzzyMatchOptions,
  getJoinHistory,
  getJoinById
} = require('../controllers/joinToolController');

// Routes
router.post('/join', joinDatasets);
router.get('/fuzzy-options', getFuzzyMatchOptions);
router.get('/history', getJoinHistory);
router.get('/:id', getJoinById);

module.exports = router;

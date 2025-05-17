const express = require('express');
const router = express.Router();
const { getSampleDatasets } = require('../controllers/sampleDataController');

// Route to get sample datasets
router.get('/', getSampleDatasets);

module.exports = router;

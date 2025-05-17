const express = require('express');
const router = express.Router();

// Import controllers
const {
  createTransformation,
  getTransformations,
  getTransformationById,
  updateTransformation,
  deleteTransformation,
  applyTransformation,
  applyToDataset,
  downloadTransformedData
} = require('../controllers/transformationController');

// Routes
router.post('/', createTransformation);
router.get('/', getTransformations);
router.get('/:id', getTransformationById);
router.put('/:id', updateTransformation);
router.delete('/:id', deleteTransformation);
router.post('/:id/apply', applyTransformation);

// New routes for direct transformation workflow
router.post('/applyToDataset', applyToDataset);
router.get('/download/:id', downloadTransformedData);

module.exports = router;

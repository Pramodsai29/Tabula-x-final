const mongoose = require('mongoose');

const transformationSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true
    },
    sourceTable: {
      type: String,
      required: [true, 'Source table path is required']
    },
    targetTable: {
      type: String,
      required: [true, 'Target table path is required']
    },
    transformationType: {
      type: String,
      enum: ['String-based', 'Numerical', 'Algorithmic', 'General'],
      default: 'General'
    },
    transformationFunction: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'ready', 'updated_with_fallback', 'auto_updated_with_fallback'],
      default: 'pending'
    },
    metrics: {
      f1Score: Number,
      precision: Number,
      recall: Number,
      editDistance: Number
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transformation', transformationSchema);

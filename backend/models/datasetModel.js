const mongoose = require('mongoose');

const datasetSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a dataset name'],
      trim: true
    },
    filePath: {
      type: String,
      required: [true, 'File path is required']
    },
    fileType: {
      type: String,
      enum: ['csv', 'excel', 'json'],
      required: [true, 'File type is required']
    },
    rows: {
      type: Number,
      default: 0
    },
    columns: {
      type: Number,
      default: 0
    },
    columnNames: {
      type: [String],
      default: []
    },
    sampleData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    datasetType: {
      type: String,
      enum: ['source', 'target', 'transformed'],
      required: [true, 'Dataset type is required']
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

module.exports = mongoose.model('Dataset', datasetSchema);

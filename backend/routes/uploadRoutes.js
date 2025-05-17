const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists before server starts
const uploadDir = path.join(__dirname, '..', 'uploads');
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created uploads directory at ${uploadDir}`);
  }
} catch (error) {
  console.error(`Failed to create uploads directory: ${error.message}`);
}

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = path.join(__dirname, '..', 'uploads');
      // Double-check that the directory exists and is writable
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created uploads directory at ${uploadDir}`);
      }
      // Check if directory is writable
      fs.accessSync(uploadDir, fs.constants.W_OK);
      cb(null, uploadDir);
    } catch (error) {
      console.error(`Upload directory error: ${error.message}`);
      cb(new Error(`Cannot save file: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

// File filter to accept only CSV and Excel files
const fileFilter = (req, file, cb) => {
  // Check file extension as a backup for MIME type
  const originalname = file.originalname.toLowerCase();
  const fileExtension = path.extname(originalname).toLowerCase();
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/csv',
    'text/x-csv',
    'application/x-csv'
  ];
  
  console.log(`File upload attempt: ${file.originalname}, type: ${file.mimetype}`);
  
  // Check both MIME type AND file extension
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    // Set file size limit to avoid memory issues - 10MB max
    if (parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
      cb(new Error('File size exceeds the 10MB limit'), false);
    } else {
      cb(null, true);
    }
  } else {
    cb(new Error(`Only CSV and Excel files are allowed. File ${file.originalname} has unsupported type ${file.mimetype}`), false);
  }
};

// Create Multer upload instance with better error handling
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
}).single('file');

// Controllers will be imported here
const { 
  uploadDataset,
  getDatasets,
  getDatasetById,
  deleteDataset
} = require('../controllers/datasetController');

// Custom middleware to handle multer errors with enhanced logging
const handleMulterErrors = (req, res, next) => {
  console.log('Starting file upload processing...');
  console.log('Request headers:', req.headers['content-type']);
  
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      console.error('Error code:', err.code);
      console.error('Error field:', err.field);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          message: 'File size too large. Maximum size is 10MB.',
          code: err.code
        });
      }
      
      return res.status(400).json({ 
        message: `Upload error: ${err.message}`,
        code: err.code
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      console.error('Error name:', err.name);
      console.error('Error stack:', err.stack);
      
      return res.status(400).json({ 
        message: err.message || 'File upload failed'
      });
    }
    
    // Check if file was actually uploaded
    if (!req.file) {
      console.error('No file was uploaded or multer did not process it correctly');
      console.log('Request body:', req.body);
      
      return res.status(400).json({
        message: 'No file was uploaded. Make sure you are sending a file with the correct field name "file"'
      });
    }
    
    console.log('File upload successful:', req.file.originalname);
    console.log('File details:', {
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path
    });
    
    // File upload was successful, continue
    next();
  });
};

// Routes with improved error handling
router.post('/', handleMulterErrors, uploadDataset);
router.get('/', getDatasets);
router.get('/:id', getDatasetById);
router.delete('/:id', deleteDataset);

module.exports = router;

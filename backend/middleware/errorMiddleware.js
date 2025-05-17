// Error handling middleware

// Not found handler - for routes that don't exist
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler - convert errors to JSON responses with improved logging and handling
const errorHandler = (err, req, res, next) => {
  // Log the error for server debugging
  console.error(`Error: ${err.message}`);
  console.error(`Request path: ${req.path}`);
  console.error(`Request method: ${req.method}`);
  
  // Check specific error types
  if (err.name === 'MulterError') {
    // Handle Multer-specific errors
    return res.status(400).json({
      message: `File upload error: ${err.message}`,
      code: err.code || 'UPLOAD_ERROR'
    });
  }
  
  if (err.message && err.message.includes('ENOENT')) {
    // File system errors
    return res.status(500).json({
      message: 'File system error: file not found',
      code: 'FILE_NOT_FOUND'
    });
  }
  
  if (err.message && err.message.includes('EACCES')) {
    // Permission errors
    return res.status(500).json({
      message: 'File system error: permission denied',
      code: 'PERMISSION_DENIED'
    });
  }
  
  // If status code is 200 but there's an error, set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Send structured error response
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    code: err.code || 'SERVER_ERROR'
  });
};

module.exports = { notFound, errorHandler };

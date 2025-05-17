const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Log the MongoDB connection string (without exposing the full password)
const mongoUriDebug = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const redactedUri = mongoUriDebug.replace(/:([^:@]+)@/, ':****@');
console.log('MongoDB URI (redacted):', redactedUri ? redactedUri : 'Not found');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5002; // Changed to 5002 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Routes
// Sample datasets route needs to be defined BEFORE the general uploads route to prevent path conflicts
const sampleDataRoutes = require('./routes/sampleDataRoutes');
app.use('/api/samples', sampleDataRoutes);

// Regular routes
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/transformations', require('./routes/transformationRoutes'));
app.use('/api/llm', require('./routes/llmRoutes'));
app.use('/api/grok', require('./routes/grokRoutes')); // New Grok routes
app.use('/api/jointools', require('./routes/joinToolRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Any route that is not an API route will be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB - Use fixed connection string if environment variable approach fails
const MONGO_CONNECTION_STRING = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://saipramodh92:Sai5002@cluster0.yovl7ih.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

console.log('Attempting to connect to MongoDB...');

mongoose
  .connect(MONGO_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    // Start server after DB connection
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.error('Please check your MongoDB connection string and ensure network connectivity to MongoDB');
    process.exit(1);
  });

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

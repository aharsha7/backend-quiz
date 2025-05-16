const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

// Import DB connection
const connectDB = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resultRoutes = require('./routes/resultRoutes');

// Import Middlewares
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json()); // JSON parser
app.use(express.urlencoded({ extended: true })); // form-data parser

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/result', resultRoutes);

// Static file serving (for CSV uploads or image attachments)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

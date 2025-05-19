const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

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

// Import Models
const User = require('./models/User');

// Initialize app
const app = express();

// Connect to MongoDB and seed admin
connectDB().then(() => seedAdminUser());

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/result', resultRoutes);

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

async function seedAdminUser() {
  try {
    // Get admin credentials from environment variables with fallbacks
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminName = process.env.ADMIN_NAME || 'Admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin', // assuming your User model has a 'role' field
      });

      console.log(`✅ Default admin created: ${adminEmail}`);
    } else {
      console.log('ℹ️ Admin already exists');
    }
  } catch (error) {
    console.error('❌ Failed to create default admin:', error.message);
  }
}
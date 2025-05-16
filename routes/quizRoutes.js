// routes/quizRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

// — Use memory storage so the uploaded file lives in req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  createCategory,
  uploadQuestions,
  getCategories,
  getQuizQuestions,
} = require('../controllers/quizController');

const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Admin routes
router.post('/category', protect, isAdmin, createCategory);
// Notice field name 'file' matches upload.single('file') below
router.post('/upload/:categoryId', protect, isAdmin, upload.single('file'), uploadQuestions);

// User routes
router.get('/categories', protect, getCategories);
router.get('/questions/:categoryId', protect, getQuizQuestions);

module.exports = router;

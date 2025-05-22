const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  uploadQuestions,
  getCategories,
  getQuizQuestions,
} = require('../controllers/quizController');

const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Admin route for uploading questions
router.post('/upload', protect, isAdmin, upload.single('file'), uploadQuestions);

// User routes
router.get('/categories', protect, getCategories);
router.get('/questions/:categoryId', protect, getQuizQuestions);

module.exports = router;

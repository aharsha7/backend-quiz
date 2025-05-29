const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  uploadQuestions,
  getCategories,
  getQuizQuestions,
  manualUpload,
  getAllCategories,
  deleteCategory,
  getQuestionsByCategoryName,
  // getQuestionsByCategoryId,
} = require('../controllers/quizController');

const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// Admin routes
router.post('/upload', protect, isAdmin, upload.single('file'), uploadQuestions);
router.post('/manual-upload', protect, isAdmin, manualUpload);
router.get('/admin/categories', protect, isAdmin, getAllCategories);
router.get('/admin/questions', protect, isAdmin, getQuestionsByCategoryName);
// ✅ Get all questions for a specific category (admin view)
// Was misleading as :categoryId
router.get('/category/:categoryName/questions', protect, isAdmin, getQuestionsByCategoryName);

router.delete('/admin/category/:category', protect, isAdmin, deleteCategory);

// User routes
router.get('/categories', protect, getCategories);
router.get('/questions/:categoryId', protect, getQuizQuestions);

module.exports = router;
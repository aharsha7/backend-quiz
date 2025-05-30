const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const {
  submitQuiz,
  getUserHistory,
  getResultById,
  getRecentResults,
} = require('../controllers/resultController');

// User routes - ORDER MATTERS! Put specific routes before parameterized ones
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getUserHistory);
router.get('/recent-results', protect, getRecentResults); // This must come before /:id
router.get('/:id', protect, getResultById);

module.exports = router;
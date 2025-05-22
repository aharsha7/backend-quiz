const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const {
  submitQuiz,
  getUserHistory,
  getResultById,
} = require('../controllers/resultController');

// User routes
router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getUserHistory);
router.get('/:id', protect, getResultById);

module.exports = router;

const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const {
  submitQuiz,
  getUserHistory,
  getResultById,
  getRecentResults,
} = require('../controllers/resultController');

/**
 * @swagger
 * tags:
 *   name: Result
 *   description: Quiz result submission and viewing
 */

/**
 * @swagger
 * /api/result/submit:
 *   post:
 *     summary: Submit a completed quiz
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, answers]
 *             properties:
 *               categoryId:
 *                 type: string
 *               answers:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: string
 *                     selectedAnswer:
 *                       type: string
 *     responses:
 *       200:
 *         description: Quiz submitted successfully
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/result/history:
 *   get:
 *     summary: Get user's quiz history
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of past quiz attempts
 */

/**
 * @swagger
 * /api/result/recent-results:
 *   get:
 *     summary: Get user's most recent quiz results
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent results
 */

/**
 * @swagger
 * /api/result/{id}:
 *   get:
 *     summary: Get a specific result by ID
 *     tags: [Result]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Result ID
 *     responses:
 *       200:
 *         description: Result data
 *       404:
 *         description: Result not found
 */

router.post('/submit', protect, submitQuiz);
router.get('/history', protect, getUserHistory);
router.get('/recent-results', protect, getRecentResults); // Must be before /:id
router.get('/:id', protect, getResultById);

module.exports = router;

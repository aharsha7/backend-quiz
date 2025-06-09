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
} = require('../controllers/quizController');

const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Quiz
 *   description: Quiz-related routes
 */

/**
 * @swagger
 * /api/quiz/upload:
 *   post:
 *     summary: Upload quiz questions via CSV file (Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - category
 *               - timer
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing questions
 *               category:
 *                 type: string
 *                 description: Category name to assign uploaded questions
 *                 example: JavaScript
 *               timer:
 *                 type: integer
 *                 description: Quiz timer in minutes
 *                 example: 10
 *     responses:
 *       200:
 *         description: Questions uploaded successfully
 *       400:
 *         description: Missing required fields
 */
router.post('/upload', protect, isAdmin, upload.single('file'), uploadQuestions);

/**
 * @swagger
 * /api/quiz/manual-upload:
 *   post:
 *     summary: Manually upload multiple quiz questions (Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - timer
 *               - questions
 *             properties:
 *               category:
 *                 type: string
 *                 description: Name of the category
 *               timer:
 *                 type: integer
 *                 description: Timer in minutes
 *               questions:
 *                 type: array
 *                 description: List of questions to add
 *                 items:
 *                   type: object
 *                   required:
 *                     - text
 *                     - options
 *                     - correctOption
 *                   properties:
 *                     text:
 *                       type: string
 *                     options:
 *                       type: array
 *                       items:
 *                         type: string
 *                     correctOption:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Questions uploaded successfully
 *       400:
 *         description: Validation failed
 *       500:
 *         description: Server error
 */
router.post('/manual-upload', protect, isAdmin, manualUpload);

/**
 * @swagger
 * /api/quiz/admin/categories:
 *   get:
 *     summary: Get all quiz categories (Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all categories
 */
router.get('/admin/categories', protect, isAdmin, getAllCategories);


/**
 * @swagger
 * /api/quiz/category/{categoryName}/questions:
 *   get:
 *     summary: Get questions by category name (Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         schema:
 *           type: string
 *         required: true
 *         description: Category name
 *     responses:
 *       200:
 *         description: Questions by category
 */
router.get('/category/:categoryName/questions', protect, isAdmin, getQuestionsByCategoryName);

/**
 * @swagger
 * /api/quiz/admin/category/{category}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Category name or ID
 *     responses:
 *       200:
 *         description: Category deleted
 */
router.delete('/admin/category/:category', protect, isAdmin, deleteCategory);

/**
 * @swagger
 * /api/quiz/categories:
 *   get:
 *     summary: Get quiz categories (User)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get('/categories', protect, getCategories);

/**
 * @swagger
 * /api/quiz/questions/{categoryId}:
 *   get:
 *     summary: Get quiz questions for a category (User)
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         schema:
 *           type: string
 *         required: true
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Quiz questions
 */
router.get('/questions/:categoryId', protect, getQuizQuestions);

module.exports = router;

const Category = require('../models/Category');
const Question = require('../models/Question');
const csv = require('csv-parser');
const streamifier = require('streamifier');
const fs = require('fs');
const path = require('path');

// @desc    Create a quiz category (Admin)
// @route   POST /api/quiz/category
const createCategory = async (req, res) => {
  const { name, timer } = req.body;

  try {
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Category already exists' });

    const category = await Category.create({ name, timer });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Category creation failed', error: err.message });
  }
};

// @desc    Upload questions via CSV (Admin)
// @route   POST /api/quiz/upload/:categoryId
const uploadQuestions = async (req, res) => {
  const { categoryId } = req.params;
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ message: 'CSV file is required' });
  }

  const questions = [];
  // Convert buffer into a stream and pipe into csv-parser
  const stream = streamifier.createReadStream(req.file.buffer).pipe(csv());

  stream.on('data', (row) => {
    // Ensure your CSV headers match these keys exactly:
    // questionText, option1, option2, option3, option4, correctAnswer
    questions.push({
      category: categoryId,
      questionText: row.questionText,
      options: [row.option1, row.option2, row.option3, row.option4],
      correctAnswer: row.correctAnswer,
    });
  });

  stream.on('end', async () => {
    try {
      await Question.insertMany(questions);
      res.status(201).json({ message: 'Questions uploaded successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Upload failed', error: error.message });
    }
  });

  stream.on('error', (err) => {
    res.status(500).json({ message: 'CSV parsing failed', error: err.message });
  });
};

// @desc    Get all quiz categories (User)
// @route   GET /api/quiz/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};

// @desc    Get shuffled questions by category (User)
// @route   GET /api/quiz/questions/:categoryId
const getQuizQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ category: req.params.categoryId }).select('-correctAnswer');
    const shuffled = questions.sort(() => 0.5 - Math.random());
    res.status(200).json(shuffled);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load questions', error: err.message });
  }
};

module.exports = {
  createCategory,
  uploadQuestions,
  getCategories,
  getQuizQuestions,
};

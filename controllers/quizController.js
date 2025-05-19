const Category = require('../models/Category');
const Question = require('../models/Question');
const Papa = require('papaparse');

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

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const csvString = req.file.buffer.toString('utf8');
    const { data, errors } = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return res.status(400).json({ message: `CSV parsing error: ${errors[0].message}` });
    }

    const questions = [];

    for (let row of data) {
      const { questionText, option1, option2, option3, option4, correctAnswer } = row;

      if (!questionText || !option1 || !option2 || !option3 || !option4 || !correctAnswer) {
        continue; // skip invalid rows
      }

      const options = [option1, option2, option3, option4];
      if (!options.includes(correctAnswer)) {
        continue; // skip if correctAnswer doesn't match options
      }

      questions.push({
        category: categoryId,
        questionText,
        options,
        correctAnswer,
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No valid questions found in the CSV file' });
    }

    await Question.insertMany(questions);
    res.status(201).json({
      message: 'Questions uploaded successfully',
      count: questions.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
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

const Category = require('../models/Category');
const Question = require('../models/Question');
const Papa = require('papaparse');
const mongoose = require('mongoose');

// @route   POST /api/quiz/upload
const uploadQuestions = async (req, res) => {
  try {
    const { category, timer } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    if (timer === undefined) {
      return res.status(400).json({ message: 'Timer (in minutes) is required for the category' });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'CSV file is required' });
    }

    // Find existing category by name
    let categoryDoc = await Category.findOne({ name: category.trim() });

    // If not found, create new category with timer
    if (!categoryDoc) {
      categoryDoc = await Category.create({ name: category.trim(), timer: Number(timer) });
    }

    // CSV Parsing
    const csvString = req.file.buffer.toString('utf8');
    const { data, errors } = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      console.error('CSV Parse Error:', errors);
      return res.status(400).json({ message: `CSV parsing error: ${errors[0].message}` });
    }

    const questions = data.map((row, index) => {
      const { questionText, option1, option2, option3, option4, correctAnswer } = row;

      if (!(questionText && option1 && option2 && option3 && option4 && correctAnswer)) {
        console.warn(`Skipping invalid row at index ${index}`, row);
        return null;
      }

      const options = [option1, option2, option3, option4];

      if (!options.includes(correctAnswer)) {
        console.warn(`Skipping row with invalid correctAnswer at index ${index}`, correctAnswer);
        return null;
      }

      return {
        category: categoryDoc._id,
        questionText,
        options,
        correctAnswer,
      };
    }).filter(Boolean);

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No valid questions found in CSV' });
    }

    await Question.insertMany(questions);

    return res.status(201).json({ message: 'Questions uploaded successfully', count: questions.length });

  } catch (err) {
    console.error('UploadQuestions Error:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};


// @route   GET /api/quiz/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    // Filter categories to only include ones with questions
    const categoriesWithQuestions = [];

    for (const cat of categories) {
      const questionCount = await Question.countDocuments({ category: cat._id });
      if (questionCount > 0) {
        categoriesWithQuestions.push(cat);
      }
    }

    res.status(200).json(categoriesWithQuestions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
};


// @route   GET /api/quiz/questions/:categoryIdOrName
const getQuizQuestions = async (req, res) => {
  try {
    const categoryParam = req.params.categoryId;

    let category;

    // Try to find by ObjectId
    if (mongoose.Types.ObjectId.isValid(categoryParam)) {
      category = await Category.findById(categoryParam);
    }

    // If not found, try by category name
    if (!category) {
      category = await Category.findOne({ name: categoryParam.trim().toLowerCase() });
    }

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const questions = await Question.find({ category: category._id }).select('-correctAnswer');

    const shuffled = questions.sort(() => 0.5 - Math.random());

    res.status(200).json({
      questions: shuffled,
      categoryTimer: category.timer,
    });
  } catch (err) {
    console.error('GetQuizQuestions Error:', err);
    res.status(500).json({ message: 'Failed to load questions', error: err.message });
  }
};

module.exports = {
  uploadQuestions,
  getCategories,
  getQuizQuestions,
};

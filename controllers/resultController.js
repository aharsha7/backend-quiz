const Question = require('../models/Question');
const Result = require('../models/Result');
const Category = require('../models/Category');

// @desc    Submit quiz and calculate score
// @route   POST /api/result/submit
const submitQuiz = async (req, res) => {
  const { categoryId, answers } = req.body; // answers should be array [{ question, answer }]
  const userId = req.user._id;

  try {
    const questions = await Question.find({ category: categoryId });

    let score = 0;
    const results = [];

    questions.forEach((question) => {
      const userAnswerObj = answers.find(a => a.question === question._id.toString());
      const userAnswer = userAnswerObj ? userAnswerObj.answer : null;
      const isCorrect = userAnswer === question.correctAnswer;

      results.push({
        question: question._id,
        selectedAnswer: userAnswer,
        isCorrect,
      });

      if (isCorrect) score++;
    });

    const result = await Result.create({
      user: userId,
      category: categoryId,
      score,
      total: questions.length,
      answers: results,
    });

    res.status(201).json({
      message: 'Quiz submitted successfully',
      resultId: result._id,
      score,
      total: questions.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Quiz submission failed', error: err.message });
  }
};


// @desc    Get user's past quiz history
// @route   GET /api/result/history
const getUserHistory = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history', error: err.message });
  }
};

// @desc    Get detailed quiz result by ID
// @route   GET /api/result/:id
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id).populate('category', 'name');

    if (!result || result.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Result not found', error: err.message });
  }
};

module.exports = {
  submitQuiz,
  getUserHistory,
  getResultById,
};

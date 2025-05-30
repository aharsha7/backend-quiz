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
    const correctAnswers = {}; // ✅ collect correct answers for each question

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
      correctAnswers[question._id] = question.correctAnswer; // ✅ map correct answer
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
      correctAnswers, // ✅ return correct answers
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

// @desc    Get last 2 quiz results for dashboard
// @route   GET /api/result/recent-results
const getRecentResults = async (req, res) => {
  try {
    const results = await Result.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate('category', 'name');

    // Format the response with calculated fields
    const formattedResults = results.map(result => ({
      _id: result._id,
      category: result.category,
      score: Math.round((result.score / result.total) * 100), // Convert to percentage
      correctAnswers: result.score,
      totalQuestions: result.total,
      createdAt: result.createdAt,
      // Calculate time taken if available (you can add this field to your Result model if needed)
      timeTaken: result.timeTaken || null
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    console.error('Error fetching recent results:', error);
    res.status(500).json({ message: 'Error fetching recent results' });
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
  getRecentResults,
};
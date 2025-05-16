const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: [
    {
      question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
      selectedAnswer: { type: String },
      isCorrect: { type: Boolean, required: true }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);

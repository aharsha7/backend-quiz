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
  // Optional: Add time tracking
  timeTaken: { type: String },
  startTime: { type: Date },
  endTime: { type: Date }
}, { timestamps: true });

// Virtual to calculate percentage score
resultSchema.virtual('percentage').get(function() {
  return Math.round((this.score / this.total) * 100);
});

// Ensure virtual fields are included in JSON output
resultSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Result', resultSchema);
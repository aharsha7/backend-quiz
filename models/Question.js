const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);

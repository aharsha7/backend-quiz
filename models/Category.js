const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  timer: { type: Number, required: true }, // in minutes
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);

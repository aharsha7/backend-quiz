// models/Category.js

const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timer: {
    type: Number,
    required: true,
    default: 2, 
  },
});

module.exports = mongoose.model("Category", categorySchema);

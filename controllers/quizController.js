const Category = require("../models/Category");
const Question = require("../models/Question");
const Papa = require("papaparse");
const mongoose = require("mongoose");

// @route   POST /api/quiz/upload
const uploadQuestions = async (req, res) => {
  try {
    const { category, timer } = req.body;

    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (timer === undefined) {
      return res
        .status(400)
        .json({ message: "Timer (in minutes) is required for the category" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "CSV file is required" });
    }

    // Find existing category by name
    let categoryDoc = await Category.findOne({ name: category.trim() });

    // If not found, create new category with timer
    if (!categoryDoc) {
      categoryDoc = await Category.create({
        name: category.trim(),
        timer: Number(timer),
      });
    }

    // CSV Parsing
    const csvString = req.file.buffer.toString("utf8");
    const { data, errors } = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      console.error("CSV Parse Error:", errors);
      return res
        .status(400)
        .json({ message: `CSV parsing error: ${errors[0].message}` });
    }

    const questions = data
      .map((row, index) => {
        const {
          questionText,
          option1,
          option2,
          option3,
          option4,
          correctAnswer,
        } = row;

        if (
          !(
            questionText &&
            option1 &&
            option2 &&
            option3 &&
            option4 &&
            correctAnswer
          )
        ) {
          console.warn(`Skipping invalid row at index ${index}`, row);
          return null;
        }

        const options = [option1, option2, option3, option4];

        if (!options.includes(correctAnswer)) {
          console.warn(
            `Skipping row with invalid correctAnswer at index ${index}`,
            correctAnswer
          );
          return null;
        }

        return {
          category: categoryDoc._id,
          questionText,
          options,
          correctAnswer,
        };
      })
      .filter(Boolean);

    if (questions.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid questions found in CSV" });
    }

    await Question.insertMany(questions);

    return res.status(201).json({
      message: "Questions uploaded successfully",
      count: questions.length,
    });
  } catch (err) {
    console.error("UploadQuestions Error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

// Controller: Get all categories with question counts and timers
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    const enrichedCategories = await Promise.all(
      categories.map(async (cat) => {
        const questionCount = await Question.countDocuments({
          category: cat._id,
        });
        return {
          _id: cat._id,
          name: cat.name,
          timer: cat.timer ?? 2,
          questionCount,
        };
      })
    );

    res.status(200).json(enrichedCategories);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: err.message });
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
      category = await Category.findOne({
        name: categoryParam.trim().toLowerCase(),
      });
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const questions = await Question.find({ category: category._id }).select(
      "-correctAnswer"
    );

    const shuffled = questions.sort(() => 0.5 - Math.random());

    res.status(200).json({
      questions: shuffled,
      categoryTimer: category.timer,
    });
  } catch (err) {
    console.error("GetQuizQuestions Error:", err);
    res
      .status(500)
      .json({ message: "Failed to load questions", error: err.message });
  }
};
// @route   POST /api/quiz/manual-upload
const manualUpload = async (req, res) => {
  try {
    const { category, timer, questions } = req.body;

    const existingCategory = await Category.findOneAndUpdate(
      { name: category },
      { $setOnInsert: { name: category, timer } },
      { new: true, upsert: true }
    );

    for (const q of questions) {
      if (
        typeof q.correctOption !== "number" ||
        !Array.isArray(q.options) ||
        q.correctOption < 0 ||
        q.correctOption >= q.options.length
      ) {
        return res
          .status(400)
          .json({ message: `Invalid correctOption for question: "${q.text}"` });
      }

      const question = new Question({
        category: existingCategory._id,
        questionText: q.text,
        options: q.options,
        correctAnswer: q.options[q.correctOption],
      });

      await question.save();
    }

    res.status(200).json({ message: "Questions uploaded successfully" });
  } catch (err) {
    console.error("manualUpload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all unique categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, "name"); // get all categories with only the 'name' field
    const categoryNames = categories.map((cat) => cat.name);
    res.json(categoryNames);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

//admin
// Delete a category and its associated questions
const deleteCategory = async (req, res) => {
  const categoryName = req.params.category;

  try {
    const categoryDoc = await Category.findOne({ name: categoryName });

    if (!categoryDoc) {
      return res
        .status(404)
        .json({ message: `Category "${categoryName}" not found` });
    }

    const result = await Question.deleteMany({ category: categoryDoc._id });
    await Category.deleteOne({ _id: categoryDoc._id });

    res.json({
      message: `Deleted category "${categoryName}" and ${result.deletedCount} questions`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete category" });
  }
};

// Get questions by category name
const getQuestionsByCategoryName = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    const category = await Category.findOne({ name: categoryName });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const questions = await Question.find({ category: category._id });

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadQuestions,
  getCategories,
  manualUpload,
  getQuizQuestions,
  getAllCategories,
  deleteCategory,
  getQuestionsByCategoryName,
};

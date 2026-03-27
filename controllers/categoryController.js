const Category = require("../models/Category");


// Add category
exports.addCategory = async (req, res) => {
  try {

    const category = await Category.create({
      name: req.body.name,
      type: req.body.type,
      user: req.user._id
    });

    res.status(201).json(category);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get categories
exports.getCategories = async (req, res) => {
  try {

    const categories = await Category.find({
      user: req.user._id
    });

    res.json(categories);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Delete category
exports.deleteCategory = async (req, res) => {
  try {

    await Category.findByIdAndDelete(req.params.id);

    res.json({ message: "Category deleted" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
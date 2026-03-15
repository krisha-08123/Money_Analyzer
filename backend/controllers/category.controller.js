import Category from "../models/Category.js";

const DEFAULT_CATEGORIES = {
  expense: [
    { name: "Food & Dining", icon: "🍔", color: "#ff5c7a" },
    { name: "Transport", icon: "🚗", color: "#f5b942" },
    { name: "Shopping", icon: "🛒", color: "#7c6af7" },
    { name: "Entertainment", icon: "🎬", color: "#60d4f7" },
    { name: "Health", icon: "💊", color: "#22d47b" },
    { name: "Education", icon: "📚", color: "#ff8c42" },
    { name: "Utilities", icon: "💡", color: "#d47cff" },
    { name: "Rent", icon: "🏠", color: "#ff6b6b" },
    { name: "EMI", icon: "🏦", color: "#4ecdc4" },
    { name: "Groceries", icon: "🛍️", color: "#45b7d1" },
    { name: "Travel", icon: "✈️", color: "#96ceb4" },
    { name: "Other", icon: "📦", color: "#888" },
  ],
  income: [
    { name: "Salary", icon: "💼", color: "#22d47b" },
    { name: "Freelance", icon: "💻", color: "#7c6af7" },
    { name: "Investment", icon: "📈", color: "#f5b942" },
    { name: "Business", icon: "🏢", color: "#60d4f7" },
    { name: "Gift", icon: "🎁", color: "#ff8c42" },
    { name: "Rental Income", icon: "🏡", color: "#d47cff" },
    { name: "Other Income", icon: "💰", color: "#4ecdc4" },
  ],
};

// GET /api/categories
export const getCategories = async (req, res, next) => {
  try {
    const userCats = await Category.find({ user: req.user._id });

    const merged = { income: [], expense: [] };
    for (const type of ["income", "expense"]) {
      const defaults = DEFAULT_CATEGORIES[type].map((d) => ({
        ...d,
        isDefault: true,
        type,
      }));
      const custom = userCats
        .filter((c) => c.type === type)
        .map((c) => ({
          _id: c._id,
          name: c.name,
          icon: c.icon,
          color: c.color,
          type: c.type,
          isDefault: false,
        }));
      merged[type] = [...defaults, ...custom];
    }

    res.json({ success: true, data: merged });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
export const createCategory = async (req, res, next) => {
  try {
    const { name, type, icon, color } = req.body;
    const cat = await Category.create({ user: req.user._id, name, type, icon, color });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res, next) => {
  try {
    const cat = await Category.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    next(err);
  }
};
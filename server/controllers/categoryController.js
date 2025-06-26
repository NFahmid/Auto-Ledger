const prisma = require('../prisma/prismaClient');

// Get all categories for a user
exports.getAllCategories = async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await prisma.category.findMany({ where: { userId } });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    const category = await prisma.category.create({ data: { name, userId } });
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await prisma.category.update({ where: { id: parseInt(id) }, data: { name } });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
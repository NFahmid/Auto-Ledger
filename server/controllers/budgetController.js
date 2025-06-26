const prisma = require('../prisma/prismaClient');

// Get all budgets for a user
exports.getAllBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const budgets = await prisma.budget.findMany({ where: { userId }, include: { category: true } });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single budget by ID
exports.getBudgetById = async (req, res) => {
  try {
    const { id } = req.params;
    const budget = await prisma.budget.findUnique({ where: { id: parseInt(id) }, include: { category: true } });
    if (!budget) return res.status(404).json({ error: 'Budget not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user.id;
    const { categoryId, periodStart, periodEnd, amount } = req.body;
    const budget = await prisma.budget.create({
      data: { userId, categoryId, periodStart: new Date(periodStart), periodEnd: new Date(periodEnd), amount }
    });
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId, periodStart, periodEnd, amount } = req.body;
    const budget = await prisma.budget.update({
      where: { id: parseInt(id) },
      data: { categoryId, periodStart: new Date(periodStart), periodEnd: new Date(periodEnd), amount }
    });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.budget.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 
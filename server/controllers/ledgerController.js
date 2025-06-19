const prisma = require("../prisma/prismaclient");

const addLedgerEntry = async (req, res) => {
  const { amount, type, category, description, date, createdFromAI } = req.body;
  const userId = req.userId;

  try {
    const entry = await prisma.ledgerEntry.create({
      data: {
        amount,
        type,
        category,
        description,
        date: new Date(date),
        userId,
        createdFromAI: createdFromAI || false,
      },
    });
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add ledger entry" });
  }
};

const getUserLedger = async (req, res) => {
  const userId = req.userId;

  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ledger entries" });
  }
};

const updateLedgerEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const { amount, type, category, description, date } = req.body;

  try {
    // Check if the entry exists and belongs to the user
    const entry = await prisma.ledgerEntry.findUnique({
      where: { id: parseInt(id) },
    });
    if (!entry || entry.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or entry not found" });
    }

    const updated = await prisma.ledgerEntry.update({
      where: { id: parseInt(id) },
      data: { amount, type, category, description, date: new Date(date) },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update entry" });
  }
};

const deleteLedgerEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const entry = await prisma.ledgerEntry.findUnique({
      where: { id: parseInt(id) },
    });
    if (!entry || entry.userId !== userId) {
      return res.status(403).json({ error: "Unauthorized or entry not found" });
    }

    await prisma.ledgerEntry.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete entry" });
  }
};

module.exports = {
  addLedgerEntry,
  getUserLedger,
  updateLedgerEntry,
  deleteLedgerEntry,
};

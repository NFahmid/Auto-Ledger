const prisma = require("../prisma/prismaclient");

const addLedgerEntry = async (req, res) => {
  const {
    amount,
    type,
    mainCategory,
    subCategory,
    description,
    date,
    createdFromAI,
  } = req.body;

  console.log("Add Entry: req.user is:", req.user);
  const userId = req.user.id;

  try {
    const entry = await prisma.ledgerEntry.create({
      data: {
        amount,
        type,
        mainCategory,
        subCategory,
        description,
        date: new Date(date),
        userId,
        createdFromAI: createdFromAI || false,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("❌ Ledger entry creation failed:", err);
    res.status(500).json({ error: "Failed to add ledger entry" });
  }
};

const getUserLedger = async (req, res) => {
  try {
    const entry = await prisma.ledgerEntry.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!entry || entry.userId !== req.user.id) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json(entry);
  } catch (err) {
    res.status(500).json({ error: "Error fetching entry" });
  }
};

const updateLedgerEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await prisma.ledgerEntry.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return res.status(403).json({ error: "Not allowed" });
    }

    const updated = await prisma.ledgerEntry.update({
      where: { id },
      data: { ...req.body, date: new Date(req.body.date) },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update" });
  }
};

const deleteLedgerEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleteResult = await prisma.ledgerEntry.deleteMany({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (deleteResult.count === 0) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
};

const getAllLedgerEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await prisma.ledgerEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch ledger entries" });
  }
};

const getLedgerSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: { userId },
    });

    const summary = {
      assets: { subCategories: {}, total: 0 },
      liabilities: { subCategories: {}, total: 0 },
      equity: { subCategories: {}, total: 0 },
    };

    for (const entry of entries) {
      let categoryObject;
      switch (entry.mainCategory.toLowerCase()) {
        case "asset":
          categoryObject = summary.assets;
          break;
        case "liability":
          categoryObject = summary.liabilities;
          break;
        case "capital":
          categoryObject = summary.equity;
          break;
        default:
          continue;
      }

      if (!categoryObject.subCategories[entry.subCategory]) {
        categoryObject.subCategories[entry.subCategory] = 0;
      }

      categoryObject.subCategories[entry.subCategory] += entry.amount;
      categoryObject.total += entry.amount;
    }

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ error: "Failed to get ledger summary" });
  }
};

const addTransaction = async (req, res) => {
  const { date, description, amount, debit, credit } = req.body;
  const userId = req.user.id;

  // Debit and Credit rules
  const DEBIT_ACCOUNTS = ["asset", "expense"];
  const CREDIT_ACCOUNTS = ["liability", "capital", "revenue"];

  try {
    // Determine amounts based on accounting rules
    const debitAmount = DEBIT_ACCOUNTS.includes(debit.mainCategory) ? amount : -amount;
    const creditAmount = CREDIT_ACCOUNTS.includes(credit.mainCategory) ? amount : -amount;

    // Create the two ledger entries
    const debitEntry = {
      userId,
      date: new Date(date),
      amount: debitAmount,
      type: "debit", // To track the nature of the entry
      mainCategory: debit.mainCategory,
      subCategory: debit.subCategory,
      description,
    };

    const creditEntry = {
      userId,
      date: new Date(date),
      amount: creditAmount,
      type: "credit", // To track the nature of the entry
      mainCategory: credit.mainCategory,
      subCategory: credit.subCategory,
      description,
    };
    
    await prisma.ledgerEntry.createMany({
      data: [debitEntry, creditEntry],
    });

    res.status(201).json({ success: true, debitEntry, creditEntry });
  } catch (err) {
    console.error("Transaction creation failed:", err);
    res.status(500).json({ error: "Failed to create transaction" });
  }
};

module.exports = {
  addLedgerEntry,
  getUserLedger,
  updateLedgerEntry,
  deleteLedgerEntry,
  getAllLedgerEntries,
  getLedgerSummary,
  addTransaction,
};

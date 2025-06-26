const prisma = require("../prisma/prismaClient");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Google AI Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const addLedgerEntry = async (req, res) => {
  const { amount, type, categoryId, description, date, createdFromAI } =
    req.body;

  const userId = req.user.id;

  try {
    const entry = await prisma.ledgerEntry.create({
      data: {
        amount,
        type,
        categoryId,
        description,
        date: new Date(date),
        userId,
        createdFromAI: createdFromAI || false,
      },
      include: { category: true },
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
      where: { id: req.params.id },
      include: { category: true },
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
    const { amount, type, categoryId, description, date } = req.body;
    const updated = await prisma.ledgerEntry.update({
      where: { id },
      data: { amount, type, categoryId, description, date: new Date(date) },
      include: { category: true },
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
    const entry = await prisma.ledgerEntry.findUnique({ where: { id } });
    if (!entry || entry.userId !== userId) {
      return res.status(404).json({ error: "Entry not found" });
    }
    let deleteResult;
    if (entry.transactionId) {
      deleteResult = await prisma.ledgerEntry.deleteMany({
        where: { transactionId: entry.transactionId, userId: userId },
      });
    } else {
      deleteResult = await prisma.ledgerEntry.deleteMany({
        where: { id: id, userId: userId },
      });
    }
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
      include: { category: true },
    });
    res.json(entries);
  } catch (err) {
    console.log("❌ Error fetching ledger entries:", err);
    res.status(500).json({ error: "Failed to fetch ledger entries" });
  }
};

const getLedgerSummary = async (req, res) => {
  const userId = req.user.id;
  try {
    const entries = await prisma.ledgerEntry.findMany({
      where: { userId },
      include: { category: true },
    });
    // Group by type and category name
    const summary = {};
    for (const entry of entries) {
      const type = entry.type || "other";
      const catName = entry.category?.name || "Uncategorized";
      if (!summary[type]) summary[type] = { subCategories: {}, total: 0 };
      if (!summary[type].subCategories[catName])
        summary[type].subCategories[catName] = 0;
      summary[type].subCategories[catName] += entry.amount;
      summary[type].total += entry.amount;
    }
    res.status(200).json(summary);
  } catch (err) {
    console.error("❌ Error getting ledger summary:", err);
    res.status(500).json({ error: "Failed to get ledger summary" });
  }
};

const addTransaction = async (req, res) => {
  // This function will need to be refactored to use categoryId for debit/credit
  // For now, leave as is or update as needed for your workflow
  res.status(501).json({ error: "Not implemented for new schema" });
};

const analyzeTransaction = async (req, res) => {
  const { text } = req.body;
  console.log("AnalyzeTransaction called with text:", text);

  if (!text) {
    console.log("No text provided");
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Analyze the following transaction description and determine the debit and credit accounts based on standard double-entry accounting principles.
      The user's text is: "${text}"

      Return a JSON object with two keys: "debit" and "credit".
      For each key, provide the "mainCategory" and "subCategory".

      Here are the primary categories to use:
      - Asset
      - Liability
      - Equity
      - Revenue
      - Expense

      Based on the text, infer a logical sub-category.
      For example, for "paid rent", the expense sub-category should be "Rent". For "bought a new laptop", the asset sub-category should be "Equipment" or "Electronics".

      Example 1: "I paid $100 for rent"
      Output should be:
      {
        "debit": { "mainCategory": "Expense", "subCategory": "Rent" },
        "credit": { "mainCategory": "Asset", "subCategory": "Cash" }
      }

      Example 2: "Received a $1,000 investment from a shareholder"
      Output should be:
      {
        "debit": { "mainCategory": "Asset", "subCategory": "Cash" },
        "credit": { "mainCategory": "Equity", "subCategory": "Owner's Investment" }
      }
      
      Example 3: "Sold services for $500 cash"
      Output should be:
      {
        "debit": { "mainCategory": "Asset", "subCategory": "Cash" },
        "credit": { "mainCategory": "Revenue", "subCategory": "Service Revenue" }
      }

      Return only a valid JSON object in a string format, with no other text or markdown backticks.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text();
    console.log("Gemini raw response:", jsonString);

    const cleanedJsonString = jsonString.replace(/```json\n|```/g, "").trim();
    console.log("Cleaned JSON string:", cleanedJsonString);

    let data;
    try {
      data = JSON.parse(cleanedJsonString);
    } catch (parseError) {
      console.error(
        "JSON parse error:",
        parseError,
        "String was:",
        cleanedJsonString
      );
      return res
        .status(500)
        .json({ error: "Failed to parse Gemini response as JSON." });
    }

    console.log("Sending response:", data);
    res.json(data);
  } catch (error) {
    console.error("❌ Gemini API error:", error);
    res
      .status(500)
      .json({ error: "Failed to analyze transaction with Gemini AI." });
  }
};

// Utility: List available Gemini models (for debugging)
if (require.main === module) {
  (async () => {
    try {
      const models = await genAI.listModels();
      console.log("Available Gemini models:", models);
    } catch (err) {
      console.error("Error listing Gemini models:", err);
    }
  })();
}

module.exports = {
  addLedgerEntry,
  getUserLedger,
  updateLedgerEntry,
  deleteLedgerEntry,
  getAllLedgerEntries,
  getLedgerSummary,
  addTransaction,
  analyzeTransaction,
};

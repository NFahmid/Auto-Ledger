const express = require("express");
const router = express.Router();
const {
  addLedgerEntry,
  getUserLedger,
  updateLedgerEntry,
  deleteLedgerEntry,
  getAllLedgerEntries, // ✅ import it
  getLedgerSummary,
  addTransaction,
} = require("../controllers/ledgerController");

const requireAuth = require("../middleware/authMiddleware");

// 🔐 Apply auth middleware to all routes
router.use(requireAuth);

// ✅ Routes (no need to add verifyToken again)
router.post("/transaction", addTransaction);
router.get("/summary", getLedgerSummary);
router.post("/", addLedgerEntry);
router.get("/:id", getUserLedger);
router.put("/:id", updateLedgerEntry);
router.delete("/:id", deleteLedgerEntry);
router.get("/", getAllLedgerEntries); // ✅ fetch all entries

module.exports = router;

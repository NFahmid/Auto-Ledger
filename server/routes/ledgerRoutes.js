const express = require("express");
const router = express.Router();
const {
  addLedgerEntry,
  getUserLedger,
} = require("../controllers/ledgerController");
const requireAuth = require("../middleware/authMiddleware");

router.use(requireAuth); // protect all ledger routes

router.post("/", addLedgerEntry); // Add new entry
router.get("/", getUserLedger); // Get user’s entries
router.put("/:id", updateLedgerEntry); // PUT /api/ledger/:id
router.delete("/:id", deleteLedgerEntry); // DELETE /api/ledger/:id

module.exports = router;

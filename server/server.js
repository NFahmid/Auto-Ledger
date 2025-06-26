const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);

app.get("/", (req, res) => {
  res.send("Ledger backend is running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

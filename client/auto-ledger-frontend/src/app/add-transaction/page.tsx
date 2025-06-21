"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import Navbar from "../components/Navbar";

// Add a type for accountTypes with an index signature
const accountTypes: { [key: string]: string[] } = {
  Asset: ["Cash", "Accounts Receivable", "Inventory", "Supplies", "Equipment"],
  Liability: ["Accounts Payable", "Loans Payable", "Unearned Revenue"],
  Equity: ["Owner's Capital", "Owner's Drawing"],
  Expense: [
    "Rent",
    "Cost of Goods Sold",
    "Depreciation Expense",
    "Utilities",
    "Salaries",
    "Other Expenses",
  ],
  Revenue: ["Service Revenue", "Sales Revenue", "Interest Revenue"],
};

// The new, comprehensive rulebook for valid transactions
const transactionRules = {
  // ASSET DEBITS
  Cash: {
    credit: [
      "Accounts Receivable",
      "Revenue",
      "Loans Payable",
      "Owner's Capital",
      "Unearned Revenue",
    ],
  },
  "Accounts Receivable": { credit: ["Revenue"] },
  Inventory: { credit: ["Cash", "Accounts Payable"] },
  Supplies: { credit: ["Cash", "Accounts Payable"] },
  Equipment: { credit: ["Cash", "Loans Payable", "Owner's Capital"] },

  // LIABILITY DEBITS
  "Accounts Payable": { credit: ["Cash"] },
  "Loans Payable": { credit: ["Cash"] },
  "Unearned Revenue": { credit: ["Revenue"] }, // When the service is finally delivered

  // EQUITY DEBITS
  "Owner's Drawing": { credit: ["Cash", "Supplies", "Inventory"] },
  Expense: { credit: ["Cash", "Accounts Payable"] },
  "Cost of Goods Sold": { credit: ["Inventory"] }, // Paired with a sale
  "Depreciation Expense": { credit: ["Equipment"] }, // Represents reduction in asset value
  // REVENUE DEBITS (rare, but for completeness)
  "Service Revenue": { credit: ["Cash"] },
  "Sales Revenue": { credit: ["Cash"] },
  "Interest Revenue": { credit: ["Cash"] },
};

type AccountInfo = {
  mainCategory: string;
  subCategory: string;
};

const AddTransactionPage = () => {
  const [debitAccount, setDebitAccount] = useState<AccountInfo | null>(null);
  const [creditAccount, setCreditAccount] = useState<AccountInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const [aiSuggestion, setAiSuggestion] = useState<{
    debit: AccountInfo;
    credit: AccountInfo;
  } | null>(null);

  const [aiText, setAiText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper: Get all main categories
  const mainCategories = Object.keys(accountTypes);

  const findMainCategory = (subCategory: string): string | undefined => {
    for (const main in accountTypes) {
      if (accountTypes[main].includes(subCategory)) {
        return main;
      }
    }
    return undefined;
  };

  // Helper: Get subcategories for a given main category
  const getSubcategories = (mainCategory: string | undefined) =>
    mainCategory && accountTypes[mainCategory]
      ? accountTypes[mainCategory]
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (
      !debitAccount ||
      !creditAccount ||
      !debitAccount.subCategory ||
      !creditAccount.subCategory ||
      !amount ||
      !description
    ) {
      setError(
        "Please fill out all fields, including selecting valid debit and credit accounts."
      );
      return;
    }

    if (debitAccount.subCategory === creditAccount.subCategory) {
      setError("Debit and Credit accounts cannot be the same.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      await api.post(
        "/ledger/transaction",
        {
          date,
          description,
          amount: parseFloat(amount),
          debit: {
            mainCategory: debitAccount.mainCategory,
            subCategory: debitAccount.subCategory,
          },
          credit: {
            mainCategory: creditAccount.mainCategory,
            subCategory: creditAccount.subCategory,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Transaction added successfully!");
      // Optionally reset form
      setDebitAccount(null);
      setCreditAccount(null);
      setAmount("");
      setDescription("");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "An error occurred while adding the transaction."
      );
      console.error(err);
    }
  };

  const handleDebitSubChange = (sub: string) => {
    if (sub && debitAccount?.mainCategory) {
      setDebitAccount({
        mainCategory: debitAccount.mainCategory,
        subCategory: sub,
      });
    } else if (debitAccount?.mainCategory) {
      setDebitAccount({
        mainCategory: debitAccount.mainCategory,
        subCategory: "",
      });
    } else {
      setDebitAccount(null);
    }
  };

  const handleCreditSubChange = (sub: string) => {
    if (sub && creditAccount?.mainCategory) {
      setCreditAccount({
        mainCategory: creditAccount.mainCategory,
        subCategory: sub,
      });
    } else if (creditAccount?.mainCategory) {
      setCreditAccount({
        mainCategory: creditAccount.mainCategory,
        subCategory: "",
      });
    } else {
      setCreditAccount(null);
    }
  };

  const handleAiAnalyze = async () => {
    if (!aiText) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Extract amount from the text, if possible, and set it
      const amountMatch = aiText.match(/\d+(\.\d+)?/);
      if (amountMatch) {
        setAmount(amountMatch[0]);
      }

      // Let the description be the text itself
      setDescription(aiText);

      const res = await api.post(
        "/ledger/analyze",
        { text: aiText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { debit, credit } = res.data;
      console.log("AI response received in frontend:", res.data);

      if (debit && credit) {
        // Find the main categories from the existing `accountTypes`
        const debitMain =
          findMainCategory(debit.subCategory) || debit.mainCategory;
        const creditMain =
          findMainCategory(credit.subCategory) || credit.mainCategory;

        setDebitAccount({
          mainCategory: debitMain,
          subCategory: debit.subCategory,
        });
        setCreditAccount({
          mainCategory: creditMain,
          subCategory: credit.subCategory,
        });
        console.log("Set debitAccount:", {
          mainCategory: debitMain,
          subCategory: debit.subCategory,
        });
        console.log("Set creditAccount:", {
          mainCategory: creditMain,
          subCategory: credit.subCategory,
        });

        setAiSuggestion({
          debit: { mainCategory: debitMain, subCategory: debit.subCategory },
          credit: { mainCategory: creditMain, subCategory: credit.subCategory },
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "AI analysis failed.");
      console.error("AI Analyze error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      <div className="flex flex-col items-center pt-10">
        <h1 className="text-4xl font-bold mb-8">Add New Transaction</h1>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          {error && (
            <p className="text-red-500 bg-red-900/20 p-3 rounded-md mb-4">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 bg-green-900/20 p-3 rounded-md mb-4">
              {success}
            </p>
          )}

          {/* AI Assist Section */}
          <div className="bg-gray-700/50 border border-purple-500/30 p-4 rounded-lg mb-8">
            <label
              htmlFor="ai-text"
              className="block text-lg font-medium mb-2 text-purple-300"
            >
              🤖 AI Assist
            </label>
            <p className="text-sm text-gray-400 mb-3">
              Describe the transaction in plain language. e.g., "Paid $500 for
              office rent".
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                id="ai-text"
                className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-purple-500"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Type here..."
                disabled={isAnalyzing}
              />
              <button
                type="button"
                onClick={handleAiAnalyze}
                className="p-3 bg-purple-600 rounded-md font-semibold hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={isAnalyzing || !aiText}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {aiSuggestion && (
            <div className="mb-8 p-4 bg-purple-900/20 border border-purple-400 rounded-lg text-purple-200 text-center">
              <div className="font-semibold mb-1">AI Suggestion:</div>
              <div>
                <span className="font-bold">Debit</span>:{" "}
                {aiSuggestion.debit.mainCategory} /{" "}
                {aiSuggestion.debit.subCategory} &nbsp; | &nbsp;
                <span className="font-bold">Credit</span>:{" "}
                {aiSuggestion.credit.mainCategory} /{" "}
                {aiSuggestion.credit.subCategory}
              </div>
              <div className="text-xs text-purple-300 mt-1">
                Select these in the dropdowns below to use the AI suggestion.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Debit Section */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-red-400">
                Debit (Dr)
              </h2>
              {/* Main Category Dropdown */}
              <label
                htmlFor="debit-main"
                className="block text-sm font-medium mb-2"
              >
                Main Category
              </label>
              <select
                id="debit-main"
                className="w-full p-3 mb-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                value={debitAccount?.mainCategory || ""}
                onChange={(e) => {
                  const main = e.target.value;
                  setDebitAccount(
                    main ? { mainCategory: main, subCategory: "" } : null
                  );
                }}
              >
                <option value="">Select Main Category</option>
                {mainCategories.map((main) => (
                  <option key={`debit-main-${main}`} value={main}>
                    {main}
                  </option>
                ))}
              </select>
              {/* Subcategory Dropdown */}
              <label
                htmlFor="debit-sub"
                className="block text-sm font-medium mb-2"
              >
                Account
              </label>
              <select
                id="debit-sub"
                className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleDebitSubChange(e.target.value)}
                value={debitAccount?.subCategory || ""}
                disabled={!debitAccount?.mainCategory}
              >
                <option value="">Select Account</option>
                {getSubcategories(debitAccount?.mainCategory).map((sub) => (
                  <option key={`debit-${sub}`} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* Credit Section */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-green-400">
                Credit (Cr)
              </h2>
              {/* Main Category Dropdown */}
              <label
                htmlFor="credit-main"
                className="block text-sm font-medium mb-2"
              >
                Main Category
              </label>
              <select
                id="credit-main"
                className="w-full p-3 mb-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                value={creditAccount?.mainCategory || ""}
                onChange={(e) => {
                  const main = e.target.value;
                  setCreditAccount(
                    main ? { mainCategory: main, subCategory: "" } : null
                  );
                }}
                disabled={false}
              >
                <option value="">Select Main Category</option>
                {mainCategories.map((main) => (
                  <option key={`credit-main-${main}`} value={main}>
                    {main}
                  </option>
                ))}
              </select>
              {/* Subcategory Dropdown */}
              <label
                htmlFor="credit-sub"
                className="block text-sm font-medium mb-2"
              >
                Account
              </label>
              <select
                id="credit-sub"
                className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleCreditSubChange(e.target.value)}
                value={creditAccount?.subCategory || ""}
                disabled={!creditAccount?.mainCategory}
              >
                <option value="">Select Account</option>
                {getSubcategories(creditAccount?.mainCategory).map((sub) => (
                  <option key={`credit-${sub}`} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium mb-2">
                Date
              </label>
              <input
                type="date"
                id="date"
                className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Sale of services to Client X"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium mb-2">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              className="w-full p-3 bg-gray-900 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-4 bg-blue-600 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={
              !debitAccount?.subCategory ||
              !creditAccount?.subCategory ||
              !amount
            }
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionPage;

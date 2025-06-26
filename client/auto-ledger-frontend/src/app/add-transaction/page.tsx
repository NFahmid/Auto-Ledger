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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex flex-col items-center py-10 px-2 animate-fadeIn">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-blue-100 animate-fadeInUp">
        <h1 className="text-4xl font-bold mb-8 text-blue-800 flex items-center gap-2">
          <span className="material-icons text-blue-400 animate-navbarIcon">
            sync_alt
          </span>
          Add New Transaction
        </h1>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          {error && (
            <p className="text-red-500 bg-red-100/60 p-3 rounded-md mb-2 animate-shake">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-500 bg-green-100/60 p-3 rounded-md mb-2 animate-fadeIn">
              {success}
            </p>
          )}

          {/* AI Assist Section */}
          <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-blue-50 border border-purple-200 p-4 rounded-xl mb-8 animate-fadeInUp">
            <label
              htmlFor="ai-text"
              className="block text-lg font-medium mb-2 text-purple-700"
            >
              🤖 AI Assist
            </label>
            <p className="text-sm text-blue-500 mb-3">
              Describe the transaction in plain language. e.g., "Paid $500 for
              office rent".
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                id="ai-text"
                className="w-full text-blue-900 p-3 bg-blue-50 rounded-md border border-blue-200 focus:ring-2 focus:ring-purple-300 transition-all"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder="Type here..."
                disabled={isAnalyzing}
              />
              <button
                type="button"
                onClick={handleAiAnalyze}
                className="p-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-md font-semibold hover:scale-105 hover:from-purple-500 hover:to-blue-500 transition-all disabled:bg-blue-200 disabled:cursor-not-allowed text-white"
                disabled={isAnalyzing || !aiText}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>

          {aiSuggestion && (
            <div className="mb-8 p-4 bg-purple-100 border border-purple-300 rounded-lg text-purple-800 text-center animate-fadeInUp">
              <div className="font-semibold mb-1">AI Suggestion:</div>
              <div>
                <span className="font-bold">Debit</span>:{" "}
                {aiSuggestion.debit.mainCategory} /{" "}
                {aiSuggestion.debit.subCategory} &nbsp; | &nbsp;
                <span className="font-bold">Credit</span>:{" "}
                {aiSuggestion.credit.mainCategory} /{" "}
                {aiSuggestion.credit.subCategory}
              </div>
              <div className="text-xs text-purple-500 mt-1">
                Select these in the dropdowns below to use the AI suggestion.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Debit Section */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 animate-fadeInUp">
              <h2 className="text-2xl font-semibold mb-4 text-blue-700">
                Debit (Dr)
              </h2>
              <label
                htmlFor="debit-main"
                className="block text-sm font-medium mb-2 text-blue-700"
              >
                Main Category
              </label>
              <select
                id="debit-main"
                className="w-full text-blue-900 p-3 mb-3 bg-white rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
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
              <label
                htmlFor="debit-sub"
                className="block text-sm font-medium mb-2 text-blue-700"
              >
                Account
              </label>
              <select
                id="debit-sub"
                className="w-full text-blue-900 p-3 bg-white rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
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
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 animate-fadeInUp">
              <h2 className="text-2xl font-semibold mb-4 text-purple-700">
                Credit (Cr)
              </h2>
              <label
                htmlFor="credit-main"
                className="block text-sm font-medium mb-2 text-purple-700"
              >
                Main Category
              </label>
              <select
                id="credit-main"
                className="w-full text-blue-900 p-3 mb-3 bg-white rounded-md border border-purple-200 focus:ring-2 focus:ring-purple-400 transition-all"
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
              <label
                htmlFor="credit-sub"
                className="block text-sm font-medium mb-2 text-purple-700"
              >
                Account
              </label>
              <select
                id="credit-sub"
                className="w-full text-blue-900 p-3 bg-white rounded-md border border-purple-200 focus:ring-2 focus:ring-purple-400 transition-all"
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
              <label
                htmlFor="date"
                className="block text-sm font-medium mb-2 text-blue-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                className="w-full text-blue-900 p-3 bg-white rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2 text-blue-700"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                className="w-full text-blue-900 p-3 bg-white rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Sale of services to Client X"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="amount"
              className="block text-sm font-medium mb-2 text-blue-700"
            >
              Amount
            </label>
            <input
              type="number"
              id="amount"
              className="w-full text-blue-900 p-3 bg-white rounded-md border border-blue-200 focus:ring-2 focus:ring-blue-400 transition-all"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold hover:scale-105 hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-white disabled:bg-blue-200 disabled:cursor-not-allowed animate-fadeInUp"
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
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.7s;
        }
        @keyframes shake {
          10%,
          90% {
            transform: translateX(-1px);
          }
          20%,
          80% {
            transform: translateX(2px);
          }
          30%,
          50%,
          70% {
            transform: translateX(-4px);
          }
          40%,
          60% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
};

export default AddTransactionPage;

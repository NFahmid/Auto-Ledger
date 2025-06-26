"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import { getToken } from "../utils/auth.js";
import Navbar from "../components/Navbar";
import React from "react";

interface LedgerEntry {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  mainCategory: string;
  subCategory: string;
}

interface SummaryCategory {
  subCategories: { [key: string]: number };
  total: number;
}

interface SummaryData {
  assets: SummaryCategory;
  liabilities: SummaryCategory;
  equity: SummaryCategory;
}

interface Budget {
  id: number;
  categoryId: number;
  periodStart: string;
  periodEnd: string;
  amount: number;
  category?: { id: number; name: string };
}

interface Category {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchEntries = async () => {
      try {
        const res = await api.get("/ledger", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Data received from server:", res.data);
        setEntries(res.data);
      } catch (err: any) {
        setError("Failed to fetch ledger entries");
        console.error(err);
      }
    };

    fetchEntries();
  }, [router]);

  useEffect(() => {
    const fetchSummary = async () => {
      const token = getToken();

      try {
        const res = await api.get("/ledger/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setSummary(res.data); // setSummary is your state
      } catch (err) {
        console.error("Failed to load summary:", err);
      }
    };

    fetchSummary();
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const fetchBudgets = async () => {
      try {
        const res = await api.get("/budgets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBudgets(res.data);
      } catch (err) {
        // ignore
      }
    };
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data);
      } catch (err) {
        // ignore
      }
    };
    fetchBudgets();
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    console.log("Attempting to delete entry with ID:", id);
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      await api.delete(`/ledger/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // Calculate actual spent per category for current month
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const spentByCategory: { [key: number]: number } = {};
  entries.forEach((entry) => {
    if (entry.type === "expense" && entry.category) {
      // Find category by name
      const cat = categories.find(
        (c) => c.name === entry.category || c.name === entry.mainCategory
      );
      if (cat) {
        const entryDate = new Date(entry.date);
        if (entryDate >= currentMonthStart && entryDate <= currentMonthEnd) {
          spentByCategory[cat.id] =
            (spentByCategory[cat.id] || 0) + entry.amount;
        }
      }
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 px-2 py-8 animate-fadeIn">
      <div className="max-w-6xl mx-auto">
        <div className="mt-10 grid gap-8 grid-cols-1 md:grid-cols-2">
          {/* Ledger Table Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 border border-blue-100 animate-fadeInUp">
            <h1 className="text-2xl font-bold mb-4 text-blue-800 flex items-center gap-2">
              <span className="material-icons text-blue-500">list_alt</span>
              Ledger Entries
            </h1>
            <p className="text-blue-700 mb-4 text-sm">
              View, edit, or delete your ledger entries.{" "}
              <span className="font-medium">Tip:</span> Click the edit or delete
              icons to manage entries.
            </p>
            {error && (
              <p className="text-red-500 mb-4 text-center animate-shake">
                {error}
              </p>
            )}
            <div className="overflow-x-auto rounded-lg border border-zinc-200">
              <table className="min-w-full text-sm text-blue-900">
                <thead className="bg-blue-100 text-left text-blue-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border border-blue-100">
                      Category
                    </th>
                    <th className="px-4 py-3 border border-blue-100">Amount</th>
                    <th className="px-4 py-3 border border-blue-100">
                      Description
                    </th>
                    <th className="px-4 py-3 border border-blue-100">Date</th>
                    <th className="px-4 py-3 border border-blue-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-blue-50 divide-y divide-blue-100">
                  {entries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="text-center hover:bg-blue-100 transition-colors"
                    >
                      <td className="px-4 py-3 border border-blue-100">
                        {entry.category?.name || entry.mainCategory || "-"}
                      </td>
                      <td className="px-4 py-3 border border-blue-100">
                        {entry.amount}
                      </td>
                      <td className="px-4 py-3 border border-blue-100">
                        {entry.description}
                      </td>
                      <td className="px-4 py-3 border border-blue-100">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 border border-blue-100 flex gap-2 justify-center">
                        <button
                          className="p-2 rounded-full bg-blue-200 hover:bg-blue-400 text-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
                          onClick={() => router.push(`/edit-entry/${entry.id}`)}
                          title="Edit"
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          className="p-2 rounded-full bg-red-200 hover:bg-red-500 text-red-700 hover:text-white transition-colors duration-200 shadow-sm"
                          onClick={() => handleDelete(entry.id)}
                          title="Delete"
                        >
                          <span className="material-icons">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {entries.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-6 text-blue-400"
                      >
                        No entries found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Summary & Budget Tracking Card */}
          <div className="flex flex-col gap-8">
            {/* Summary Card */}
            {summary && (
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-purple-100 animate-fadeInUp">
                <h2 className="text-xl font-bold mb-4 text-purple-800 flex items-center gap-2">
                  <span className="material-icons text-purple-500">
                    summarize
                  </span>
                  Summary
                </h2>
                <p className="text-purple-700 mb-4 text-sm">
                  Overview of your finances by type and category.
                </p>
                <div className="overflow-x-auto rounded-lg border border-purple-200">
                  <table className="min-w-full text-sm text-purple-900">
                    <thead className="bg-purple-100 text-left text-purple-700 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border border-purple-100">
                          Account Type
                        </th>
                        <th className="px-4 py-3 border border-purple-100 text-right">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-purple-50">
                      {Object.entries(summary).map(([type, data]) => (
                        <React.Fragment key={type}>
                          <tr className="font-bold bg-purple-100">
                            <td className="px-4 py-2 border-r border-purple-200">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </td>
                            <td className="px-4 py-2"></td>
                          </tr>
                          {Object.entries(data.subCategories).map(
                            ([name, amount]) => (
                              <tr key={`${type}-${name}`}>
                                <td className="px-4 py-2 border-r border-purple-200 pl-8">
                                  {name}
                                </td>
                                <td className="px-4 py-2 text-right">
                                  {amount.toFixed(2)}
                                </td>
                              </tr>
                            )
                          )}
                          <tr className="font-bold bg-purple-100">
                            <td className="px-4 py-2 border-r border-purple-200">
                              Total{" "}
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {data.total.toFixed(2)}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* Budget Tracking Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-green-100 animate-fadeInUp">
              <h2 className="text-xl font-bold mb-4 text-green-800 flex items-center gap-2">
                <span className="material-icons text-green-500">
                  track_changes
                </span>
                Budget Tracking (This Month)
              </h2>
              <p className="text-green-700 mb-4 text-sm">
                See how your spending compares to your budgets for each category
                this month.
              </p>
              <div className="overflow-x-auto rounded-lg border border-green-200">
                <table className="min-w-full text-sm text-green-900">
                  <thead className="bg-green-100 text-left text-green-700 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 border border-green-100">
                        Category
                      </th>
                      <th className="px-4 py-3 border border-green-100 text-right">
                        Budgeted
                      </th>
                      <th className="px-4 py-3 border border-green-100 text-right">
                        Spent
                      </th>
                      <th className="px-4 py-3 border border-green-100 text-right">
                        Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-green-50">
                    {budgets.map((budget) => {
                      const budgetStart = new Date(budget.periodStart);
                      const budgetEnd = new Date(budget.periodEnd);
                      if (
                        budgetStart <= currentMonthEnd &&
                        budgetEnd >= currentMonthStart
                      ) {
                        const spent = spentByCategory[budget.categoryId] || 0;
                        return (
                          <tr
                            key={budget.id}
                            className="hover:bg-green-100 transition-colors"
                          >
                            <td className="px-4 py-2 border-r border-green-200">
                              {budget.category?.name ||
                                categories.find(
                                  (c) => c.id === budget.categoryId
                                )?.name ||
                                "-"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {budget.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {spent.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {(budget.amount - spent).toFixed(2)}
                            </td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                    {budgets.filter((budget) => {
                      const budgetStart = new Date(budget.periodStart);
                      const budgetEnd = new Date(budget.periodEnd);
                      return (
                        budgetStart <= currentMonthEnd &&
                        budgetEnd >= currentMonthStart
                      );
                    }).length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="text-green-400 text-center py-4 animate-fadeIn"
                        >
                          No budgets set for this month.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Animations and Material Icons */}
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
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
    </div>
  );
}

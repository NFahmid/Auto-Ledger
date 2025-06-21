"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import { getToken } from "../utils/auth.js";
import Navbar from "../components/Navbar";

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

export default function DashboardPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const [summary, setSummary] = useState<SummaryData | null>(null);

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

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <Navbar />
      <div className="max-w-6xl mx-auto mt-10">
        <h1 className="text-3xl font-bold mb-6 text-center">📊 Your Ledger</h1>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div className="overflow-x-auto rounded-lg border border-zinc-700">
          <table className="min-w-full text-sm text-white">
            <thead className="bg-zinc-800 text-left text-gray-300 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 border border-zinc-700">Category</th>
                <th className="px-4 py-3 border border-zinc-700">Amount</th>
                <th className="px-4 py-3 border border-zinc-700">
                  Description
                </th>
                <th className="px-4 py-3 border border-zinc-700">Date</th>
                <th className="px-4 py-3 border border-zinc-700">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-zinc-900 divide-y divide-zinc-800">
              {entries.map((entry) => (
                <tr key={entry.id} className="text-center hover:bg-zinc-800">
                  <td className="px-4 py-3 border border-zinc-700">
                    {entry.mainCategory} / {entry.subCategory}
                  </td>
                  <td className="px-4 py-3 border border-zinc-700">
                    {entry.amount}
                  </td>
                  <td className="px-4 py-3 border border-zinc-700">
                    {entry.description}
                  </td>
                  <td className="px-4 py-3 border border-zinc-700">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border border-zinc-700">
                    <button
                      className="text-blue-400 hover:underline mr-4"
                      onClick={() => router.push(`/edit-entry/${entry.id}`)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="text-red-400 hover:underline"
                      onClick={() => handleDelete(entry.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-zinc-400">
                    No entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {summary && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4 text-center">Summary</h2>
            <div className="overflow-x-auto rounded-lg border border-zinc-700">
              <table className="min-w-full text-sm text-white">
                <thead className="bg-zinc-800 text-left text-gray-300 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border border-zinc-700">
                      Account
                    </th>
                    <th className="px-4 py-3 border border-zinc-700 text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-zinc-900">
                  {/* Assets */}
                  <tr className="font-bold bg-zinc-800">
                    <td className="px-4 py-2 border-r border-zinc-700">
                      Assets
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  {Object.entries(summary.assets.subCategories).map(
                    ([name, amount]) => (
                      <tr key={`asset-${name}`}>
                        <td className="px-4 py-2 border-r border-zinc-700 pl-8">
                          {name}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                  <tr className="font-bold bg-zinc-800">
                    <td className="px-4 py-2 border-r border-zinc-700">
                      Total Assets
                    </td>
                    <td className="px-4 py-2 text-right">
                      {summary.assets.total.toFixed(2)}
                    </td>
                  </tr>

                  {/* Liabilities */}
                  <tr className="font-bold bg-zinc-800">
                    <td className="px-4 py-2 border-r border-zinc-700">
                      Liabilities
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  {Object.entries(summary.liabilities.subCategories).map(
                    ([name, amount]) => (
                      <tr key={`liability-${name}`}>
                        <td className="px-4 py-2 border-r border-zinc-700 pl-8">
                          {name}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                  <tr className="font-bold bg-zinc-800">
                    <td className="px-4 py-2 border-r border-zinc-700">
                      Total Liabilities
                    </td>
                    <td className="px-4 py-2 text-right">
                      {summary.liabilities.total.toFixed(2)}
                    </td>
                  </tr>

                  {/* Equity */}
                  <tr className="font-bold bg-zinc-800">
                    <td className="px-4 py-2 border-r border-zinc-700">
                      Equity
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>
                  {Object.entries(summary.equity.subCategories).map(
                    ([name, amount]) => (
                      <tr key={`equity-${name}`}>
                        <td className="px-4 py-2 border-r border-zinc-700 pl-8">
                          {name}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {amount.toFixed(2)}
                        </td>
                      </tr>
                    )
                  )}
                  <tr className="font-bold bg-zinc-800">
                    <td className="px-4 py-2 border-r border-zinc-700">
                      Total Equity
                    </td>
                    <td className="px-4 py-2 text-right">
                      {summary.equity.total.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

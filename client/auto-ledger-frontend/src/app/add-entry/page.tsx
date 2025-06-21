"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import { getToken } from "../utils/auth.js";
import Navbar from "../components/Navbar";

export default function AddEntryPage() {
  const router = useRouter();
  const categoryOptions: Record<string, string[]> = {
    asset: ["cash", "accounts receivable", "supplies", "equipment"],
    liability: ["accounts payable"],
    equity: ["owners capital", "owners drawings", "revenue", "expense"],
  };

  const [form, setForm] = useState({
    amount: "",
    type: "", // debit or credit
    mainCategory: "",
    subCategory: "",
    description: "",
    date: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      await api.post(
        "/ledger",
        { ...form, amount: parseFloat(form.amount) },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError("Failed to add entry");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6">
      <Navbar />
      <div className="flex flex-col items-center mt-10">
        <h1 className="text-3xl font-semibold mb-6">➕ Add Ledger Entry</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 p-6 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-4"
        >
          <input
            name="amount"
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="bg-zinc-800 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
          </select>

          <select
            name="mainCategory"
            value={form.mainCategory}
            onChange={handleChange}
            required
            className="bg-zinc-800 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Main Category</option>
            {Object.keys(categoryOptions).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {form.mainCategory && (
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={handleChange}
              required
              className="bg-zinc-800 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Sub Category</option>
              {categoryOptions[form.mainCategory].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="bg-zinc-800 border border-zinc-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 transition-colors text-white py-3 rounded-md font-medium"
          >
            Add Entry
          </button>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}

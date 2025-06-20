"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../utils/api";
import { getToken } from "../../utils/auth.js";

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [form, setForm] = useState({
    amount: "",
    type: "asset",
    category: "",
    description: "",
    date: "",
  });
  const [error, setError] = useState("");

  // Load entry on page load
  useEffect(() => {
    const token = getToken();
    if (!token) return router.push("/login");

    const fetchEntry = async () => {
      try {
        const res = await api.get(`/api/ledger/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const entry = res.data;
        setForm({
          amount: entry.amount.toString(),
          type: entry.type,
          category: entry.category,
          description: entry.description,
          date: entry.date.split("T")[0], // ISO to YYYY-MM-DD
        });
      } catch (err) {
        setError("Failed to load entry");
        console.error(err);
      }
    };

    fetchEntry();
  }, [id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const token = getToken();
    if (!token) return router.push("/login");

    try {
      await api.put(
        `/ledger/${id}`,
        {
          ...form,
          amount: parseFloat(form.amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Update failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4">
      <h1 className="text-2xl font-bold mb-4">✏️ Edit Entry</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border p-2"
        >
          <option value="asset">Asset</option>
          <option value="liability">Liability</option>
          <option value="capital">Capital</option>
        </select>
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
          className="border p-2"
        />
        <input
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="border p-2"
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="border p-2"
        />
        <button type="submit" className="bg-blue-600 text-white py-2">
          Update Entry
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}

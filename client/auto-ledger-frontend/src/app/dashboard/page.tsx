"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import { getToken } from "../utils/auth.js";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();

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
        setEntries(res.data);
      } catch (err: any) {
        setError("Failed to fetch ledger entries");
        console.error(err);
      }
    };

    fetchEntries();
  }, [router]);

  const handleDelete = async (id: string) => {
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
                <th className="px-4 py-3 border border-zinc-700">Type</th>
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
              {entries.map((entry: any) => (
                <tr key={entry.id} className="text-center hover:bg-zinc-800">
                  <td className="px-4 py-3 border border-zinc-700">
                    {entry.type}
                  </td>
                  <td className="px-4 py-3 border border-zinc-700">
                    {entry.category}
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
      </div>
    </div>
  );
}

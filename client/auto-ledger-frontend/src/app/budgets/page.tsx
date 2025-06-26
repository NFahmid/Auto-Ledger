"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    categoryId: "",
    periodStart: "",
    periodEnd: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchBudgets = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/budgets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBudgets(data);
    } catch (err) {
      setError("Failed to fetch budgets");
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.categoryId ||
      !form.periodStart ||
      !form.periodEnd ||
      !form.amount
    )
      return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/budgets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: parseInt(form.categoryId),
          periodStart: form.periodStart,
          periodEnd: form.periodEnd,
          amount: parseFloat(form.amount),
        }),
      });
      if (!res.ok) throw new Error("Failed to add budget");
      setForm({ categoryId: "", periodStart: "", periodEnd: "", amount: "" });
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this budget?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/budgets/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete budget");
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEdit = (b: any) => {
    setEditId(b.id);
    setForm({
      categoryId: b.categoryId.toString(),
      periodStart: b.periodStart.slice(0, 10),
      periodEnd: b.periodEnd.slice(0, 10),
      amount: b.amount.toString(),
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !form.categoryId ||
      !form.periodStart ||
      !form.periodEnd ||
      !form.amount
    )
      return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/budgets/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: parseInt(form.categoryId),
          periodStart: form.periodStart,
          periodEnd: form.periodEnd,
          amount: parseFloat(form.amount),
        }),
      });
      if (!res.ok) throw new Error("Failed to update budget");
      setEditId(null);
      setForm({ categoryId: "", periodStart: "", periodEnd: "", amount: "" });
      setShowEditModal(false);
      fetchBudgets();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col items-center py-10 px-2 animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-green-100 animate-fadeInUp">
        <h2 className="text-3xl font-bold text-green-800 mb-2 flex items-center gap-2">
          <span className="material-icons text-green-500">
            account_balance_wallet
          </span>
          Manage Budgets
        </h2>
        <p className="text-green-700 mb-6 text-sm">
          Set, edit, or delete your budgets for each category and period.
          <br />
          <span className="font-medium">Tip:</span> Assign a budget to each
          category for a specific month or period to track your spending goals.
        </p>
        <form
          onSubmit={editId ? handleUpdate : handleAdd}
          className="flex flex-col gap-2 sm:flex-row sm:items-end mb-4"
        >
          <div className="flex-1">
            <label
              className="block text-green-700 text-xs mb-1"
              htmlFor="categoryId"
            >
              Category
            </label>
            <select
              name="categoryId"
              id="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
            >
              <option value="">Select category</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label
              className="block text-green-700 text-xs mb-1"
              htmlFor="periodStart"
            >
              Start Date
            </label>
            <input
              type="date"
              name="periodStart"
              id="periodStart"
              value={form.periodStart}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
            />
          </div>
          <div className="flex-1">
            <label
              className="block text-green-700 text-xs mb-1"
              htmlFor="periodEnd"
            >
              End Date
            </label>
            <input
              type="date"
              name="periodEnd"
              id="periodEnd"
              value={form.periodEnd}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
            />
          </div>
          <div className="flex-1">
            <label
              className="block text-green-700 text-xs mb-1"
              htmlFor="amount"
            >
              Amount
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
            />
          </div>
          <button
            type="submit"
            disabled={
              loading ||
              !form.categoryId ||
              !form.periodStart ||
              !form.periodEnd ||
              !form.amount
            }
            className="mt-2 sm:mt-0 px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-md hover:scale-105 hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-icons">
              {editId ? "save" : "add_circle"}
            </span>{" "}
            {editId ? "Update" : "Add"}
          </button>
        </form>
        {error && (
          <div className="text-red-500 mb-2 animate-shake">{error}</div>
        )}
        {loading && (
          <div className="text-green-500 mb-2 animate-pulse">Loading...</div>
        )}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            Your Budgets
          </h3>
          <table className="w-full text-sm rounded-lg overflow-hidden shadow-md animate-fadeInUp">
            <thead className="bg-green-100 text-green-700">
              <tr>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Period</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-green-50">
              {budgets.map((b: any) => (
                <tr
                  key={b.id}
                  className="hover:bg-green-100 transition-colors group"
                >
                  <td className="px-4 py-2 font-medium text-green-900">
                    {b.category?.name ||
                      categories.find((c: any) => c.id === b.categoryId)
                        ?.name ||
                      "-"}
                  </td>
                  <td className="px-4 py-2 text-green-700">
                    {b.periodStart.slice(0, 10)} to {b.periodEnd.slice(0, 10)}
                  </td>
                  <td className="px-4 py-2 text-green-700">{b.amount}</td>
                  <td className="px-4 py-2 flex gap-2 justify-center">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-2 rounded-full bg-green-200 hover:bg-green-400 text-green-700 hover:text-white transition-colors duration-200 shadow-sm"
                      title="Edit"
                    >
                      <span className="material-icons">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="p-2 rounded-full bg-red-200 hover:bg-red-500 text-red-700 hover:text-white transition-colors duration-200 shadow-sm"
                      title="Delete"
                    >
                      <span className="material-icons">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
              {budgets.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-green-400 text-center py-4 animate-fadeIn"
                  >
                    No budgets set yet. Add your first one above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm animate-fadeInUp relative">
            <button
              className="absolute top-2 right-2 text-green-400 hover:text-green-700 transition-colors"
              onClick={() => setShowEditModal(false)}
              title="Close"
            >
              <span className="material-icons">close</span>
            </button>
            <h4 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              <span className="material-icons">edit</span> Edit Budget
            </h4>
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <label
                className="text-green-700 text-xs"
                htmlFor="editCategoryId"
              >
                Category
              </label>
              <select
                name="categoryId"
                id="editCategoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
              >
                <option value="">Select category</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label
                className="text-green-700 text-xs"
                htmlFor="editPeriodStart"
              >
                Start Date
              </label>
              <input
                type="date"
                name="periodStart"
                id="editPeriodStart"
                value={form.periodStart}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
              />
              <label className="text-green-700 text-xs" htmlFor="editPeriodEnd">
                End Date
              </label>
              <input
                type="date"
                name="periodEnd"
                id="editPeriodEnd"
                value={form.periodEnd}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
              />
              <label className="text-green-700 text-xs" htmlFor="editAmount">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                id="editAmount"
                placeholder="Amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-green-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-all outline-none shadow-sm bg-green-50 text-green-900 placeholder-green-300"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold shadow-md hover:scale-105 hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-icons">save</span> Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold shadow hover:bg-green-200 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-icons">cancel</span> Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Animations */}
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
      {/* Material Icons CDN */}
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
    </div>
  );
}

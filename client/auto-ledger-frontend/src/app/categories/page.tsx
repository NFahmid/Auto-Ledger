"use client";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError("Failed to fetch categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to add category");
      setName("");
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this category?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete category");
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleEdit = (cat: any) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editName) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/categories/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: editName }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      setEditId(null);
      setEditName("");
      setShowEditModal(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center py-10 px-2 animate-fadeIn">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 mb-8 border border-blue-100 animate-fadeInUp">
        <h2 className="text-3xl font-bold text-blue-800 mb-2 flex items-center gap-2">
          <span className="material-icons text-blue-500">category</span>
          Manage Categories
        </h2>
        <p className="text-blue-700 mb-6 text-sm">Add, edit, or delete your transaction categories. <br/> <span className="font-medium">Tip:</span> Use clear, descriptive names (e.g., "Groceries", "Utilities").</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-2 sm:flex-row sm:items-end mb-4">
          <div className="flex-1">
            <label className="block text-blue-700 text-xs mb-1" htmlFor="categoryName">Category Name</label>
            <input
              id="categoryName"
              type="text"
              placeholder="e.g. Groceries"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none shadow-sm bg-blue-50 text-blue-900 placeholder-blue-300"
              autoComplete="off"
            />
            <span className="text-xs text-blue-400">Enter a unique, descriptive name for your category.</span>
          </div>
          <button
            type="submit"
            disabled={loading || !name}
            className="mt-2 sm:mt-0 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-icons">add_circle</span> Add
          </button>
        </form>
        {error && <div className="text-red-500 mb-2 animate-shake">{error}</div>}
        {loading && <div className="text-blue-500 mb-2 animate-pulse">Loading...</div>}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Your Categories</h3>
          <ul className="space-y-2">
            {categories.map(cat => (
              <li
                key={cat.id}
                className="flex items-center justify-between bg-blue-100 rounded-lg px-4 py-2 shadow-sm hover:shadow-lg transition-shadow group animate-fadeInUp"
              >
                <span className="text-blue-900 font-medium group-hover:pl-2 transition-all">{cat.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="p-2 rounded-full bg-blue-200 hover:bg-blue-400 text-blue-700 hover:text-white transition-colors duration-200 shadow-sm"
                    title="Edit"
                  >
                    <span className="material-icons">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 rounded-full bg-red-200 hover:bg-red-500 text-red-700 hover:text-white transition-colors duration-200 shadow-sm"
                    title="Delete"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </li>
            ))}
            {categories.length === 0 && (
              <li className="text-blue-400 text-center py-4 animate-fadeIn">No categories yet. Add your first one above!</li>
            )}
          </ul>
        </div>
      </div>
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm animate-fadeInUp relative">
            <button
              className="absolute top-2 right-2 text-blue-400 hover:text-blue-700 transition-colors"
              onClick={() => setShowEditModal(false)}
              title="Close"
            >
              <span className="material-icons">close</span>
            </button>
            <h4 className="text-xl font-bold text-blue-700 mb-4 flex items-center gap-2">
              <span className="material-icons">edit</span> Edit Category
            </h4>
            <form onSubmit={handleUpdate} className="flex flex-col gap-3">
              <label className="text-blue-700 text-xs" htmlFor="editCategoryName">Category Name</label>
              <input
                id="editCategoryName"
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all outline-none shadow-sm bg-blue-50 text-blue-900 placeholder-blue-300"
                autoComplete="off"
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-md hover:scale-105 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-icons">save</span> Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition-all duration-200 flex items-center gap-2"
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn { animation: fadeIn 0.7s; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.7s; }
        @keyframes shake {
          10%, 90% { transform: translateX(-1px); }
          20%, 80% { transform: translateX(2px); }
          30%, 50%, 70% { transform: translateX(-4px); }
          40%, 60% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
      {/* Material Icons CDN */}
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
    </div>
  );
} 
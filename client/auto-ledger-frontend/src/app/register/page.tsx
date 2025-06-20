"use client";

import { useState } from "react";
import api from "../utils/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", form);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-center px-4">
      <div className="bg-zinc-900 text-white p-8 rounded-2xl shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="bg-zinc-800 border border-zinc-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="bg-zinc-800 border border-zinc-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="bg-zinc-800 border border-zinc-700 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white py-3 rounded-md font-medium"
          >
            Register
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
        <p className="text-sm text-zinc-400 text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

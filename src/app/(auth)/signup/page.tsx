"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function SignupPage() {
  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );
  
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"teacher" | "student" | "parent">("teacher");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow-md border text-gray-900">
      <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
      
      <input
        className="w-full rounded border p-2 text-black bg-white"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      
      <input
        className="w-full rounded border p-2 text-black bg-white"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <input
        className="w-full rounded border p-2 text-black bg-white"
        type="password"
        placeholder="Password (min 6 chars)"
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      
      <select
        className="w-full rounded border p-2 text-black bg-white"
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
      >
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
        <option value="parent">Parent</option>
      </select>
      
      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
      
      <button
        disabled={loading}
        className="w-full rounded bg-emerald-600 py-2 text-white hover:bg-emerald-700 disabled:opacity-50 font-semibold"
      >
        {loading ? "Creating..." : "Create account"}
      </button>
      
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link className="text-emerald-600 underline font-semibold" href="/login">
          Log in
        </Link>
      </p>
    </form>
  );
}
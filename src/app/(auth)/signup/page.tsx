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

    // In case the database trigger didn't fire, we explicitly insert/update the profile
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        role,
        full_name: fullName,
        email: email, // Adding email here
      });
    }

    router.push(role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border text-gray-900 mt-10">
      <h1 className="text-2xl font-bold text-center mb-6">Create your account</h1>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Full Name</label>
          <input className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-indigo-500" placeholder="Your Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-indigo-500" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-indigo-500" type="password" placeholder="••••••••" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">I am a...</label>
          <select className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-indigo-500" value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
        
        <button disabled={loading} className="w-full rounded-lg bg-indigo-600 py-3 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account? <Link className="text-indigo-600 font-semibold underline" href="/login">Log in</Link>
      </p>
    </div>
  );
}
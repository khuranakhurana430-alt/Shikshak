"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
    router.push(profile?.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
    router.refresh();
  }

  async function handleGithubLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="space-y-6 w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border text-gray-900 mt-10">
      <h1 className="text-2xl font-bold text-center">Log in to Shikshak</h1>
      
      <div className="space-y-3">
        <button 
          onClick={handleGithubLogin} 
          className="w-full flex items-center justify-center gap-3 border border-gray-300 p-3 rounded-lg font-semibold hover:bg-gray-50 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          Continue with GitHub
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute border-t w-full border-gray-200"></div>
        <span className="relative bg-white px-4 text-sm text-gray-500 font-medium">OR</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-emerald-500" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-emerald-500" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
        <button className="w-full rounded-lg bg-emerald-600 py-3 text-white font-bold hover:bg-emerald-700 transition">Continue</button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Don't have an account? <Link className="text-emerald-600 font-semibold underline" href="/signup">Create your account</Link>
      </p>
    </div>
  );
}
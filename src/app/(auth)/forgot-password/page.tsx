"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function ForgotPassword() {
  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );
  
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMsg("Password reset link sent! Check your email.");
    }
    setLoading(false);
  }

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border text-gray-900 mt-10">
      <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
      <p className="text-sm text-gray-500 text-center mb-6">Enter your email and we'll send you a link to reset your password.</p>
      
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Email Address</label>
          <input 
            className="w-full rounded border p-3 text-black bg-gray-50 outline-none focus:border-emerald-500" 
            type="email" 
            placeholder="you@example.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        
        {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
        {msg && <p className="text-sm text-emerald-600 font-semibold">{msg}</p>}
        
        <button 
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 text-white font-bold hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Remember your password? <Link className="text-emerald-600 font-semibold underline" href="/login">Log in</Link>
      </p>
    </div>
  );
}
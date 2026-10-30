"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function StudentProfile() {
  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();

      if (profile) {
        setForm({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone,
      })
      .eq("id", user.id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMsg("Profile updated successfully!");
    setSaving(false);
    setTimeout(() => router.push("/dashboard/student"), 1500);
  }

  if (loading) return <div className="text-center p-10 text-gray-900">Loading profile...</div>;

  return (
    <main className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-sm border text-gray-900">
      <Link href="/dashboard/student" className="text-sm text-emerald-600 hover:underline mb-6 inline-block font-semibold">
        ← Back to Dashboard
      </Link>
      
      <h1 className="text-2xl font-bold mb-2">Edit My Profile</h1>
      <p className="text-sm text-gray-500 mb-6">Update your personal information here.</p>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Email Address (Read-only)</label>
          <input 
            type="email" 
            className="w-full rounded border p-3 bg-gray-100 text-gray-500 cursor-not-allowed" 
            value={email} 
            disabled 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            className="w-full rounded border p-3 text-black focus:border-blue-500 outline-none" 
            placeholder="e.g. Aman Sharma"
            value={form.full_name} 
            onChange={(e) => setForm({ ...form, full_name: e.target.value })} 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
          <input 
            type="tel" 
            className="w-full rounded border p-3 text-black focus:border-blue-500 outline-none" 
            placeholder="+91 98765 43210"
            value={form.phone} 
            onChange={(e) => setForm({ ...form, phone: e.target.value })} 
          />
        </div>

        {error && <p className="text-sm text-red-600 font-semibold bg-red-50 p-2 rounded">{error}</p>}
        {msg && <p className="text-sm text-emerald-600 font-semibold bg-emerald-50 p-2 rounded">{msg}</p>}

        <button 
          disabled={saving} 
          className="w-full rounded-lg bg-blue-600 py-3 text-white font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </main>
  );
}
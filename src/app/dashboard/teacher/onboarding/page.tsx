"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

export default function TeacherOnboarding() {
  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );
  const router = useRouter();
  
  const [form, setForm] = useState({
    headline: "Expert Tutor",
    bio: "I have 5 years of experience teaching.",
    experience_years: 5,
    base_rate_inr: 500,
    currency: "INR",
    country: "India",
    timezone: "Asia/Kolkata",
    teaches_online: true,
    teaches_in_person: false,
    pincode: "",
    city: "",
    languages: "English",
    boards: "CBSE",
    subject: "maths",
    level: "Class 10",
    avatar_url: "",
    whatsapp: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setMsg("Uploading image...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);

    if (uploadError) {
      setMsg("Error uploading image: " + uploadError.message);
      setSaving(false);
      return;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
    setForm({ ...form, avatar_url: data.publicUrl });
    setMsg("Image uploaded!");
    setSaving(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setMsg("Not logged in");

    const safeExperience = parseInt(String(form.experience_years), 10) || 0;
    const safeRate = parseFloat(String(form.base_rate_inr)) || 0;

    const { error: profileError } = await supabase.from("teacher_profiles").upsert({
      id: user.id,
      headline: form.headline,
      bio: form.bio,
      experience_years: safeExperience,
      base_rate_inr: safeRate,
      currency: form.currency,
      country: form.country,
      timezone: form.timezone,
      teaches_online: form.teaches_online,
      teaches_in_person: form.teaches_in_person,
      pincode: form.pincode || null,
      city: form.city,
      languages: form.languages.split(",").map((s) => s.trim()),
      boards: form.boards.split(",").map((s) => s.trim()),
      avatar_url: form.avatar_url,
      whatsapp: form.whatsapp,
    });

    if (profileError) {
      setMsg(profileError.message);
      setSaving(false);
      return;
    }

    const { data: subjectData } = await supabase.from("subjects").select("id").eq("slug", form.subject).single();
    if (subjectData) {
      await supabase.from("teacher_subjects").upsert({
        teacher_id: user.id,
        subject_id: subjectData.id,
        level: form.level,
      });
    }

    setMsg("Profile saved!");
    setSaving(false);
    router.push("/dashboard/teacher");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 relative overflow-hidden">
      <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto p-4 md:p-6 relative z-10">
        <Link href="/dashboard/teacher" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-6 font-semibold transition">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <form onSubmit={onSubmit} className="bg-white/70 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/60 text-slate-900 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Set up your Teacher Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Teachers from all over the world can join Shikshak.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl flex items-center gap-6">
            {form.avatar_url ? (
              <img src={form.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <Upload className="w-6 h-6" />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Profile Picture</label>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Headline</label>
              <input className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. IELTS Expert, 8 yrs exp" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bio</label>
              <textarea className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Tell students about yourself..." rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
                <input className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+91 98765 43210" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Experience (years)</label>
                <input type="number" min="0" max="60" className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                <select className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
                  <option value="India">India</option>
                  <option value="USA">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="UAE">UAE</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                <input className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. New York" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Currency</label>
                <select className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Rate per hour</label>
                <input type="number" step="0.01" min="0" className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={form.base_rate_inr} onChange={(e) => setForm({ ...form, base_rate_inr: Number(e.target.value) })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Main Subject</label>
                <select className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  <option value="maths">Mathematics</option>
                  <option value="science">Science</option>
                  <option value="english">English</option>
                  <option value="coding">Coding</option>
                  <option value="ielts">IELTS / TOEFL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Languages</label>
                <input className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="English, Hindi" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" checked={form.teaches_online} onChange={(e) => setForm({ ...form, teaches_online: e.target.checked })} />
              <span className="text-sm font-semibold text-slate-700">Teach online globally</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" checked={form.teaches_in_person} onChange={(e) => setForm({ ...form, teaches_in_person: e.target.checked })} />
              <span className="text-sm font-semibold text-slate-700">Teach in person</span>
            </label>
          </div>

          {msg && <p className="text-sm font-bold text-indigo-700 bg-indigo-50 p-3 rounded-xl border border-indigo-100">{msg}</p>}

          <button disabled={saving} className="w-full rounded-xl bg-indigo-600 py-4 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-50 shadow-md">
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}
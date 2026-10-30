"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

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
      whatsapp: form.whatsapp, // Saving WhatsApp
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
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4 p-6 bg-white rounded-lg shadow mt-10 border text-gray-900">
      <h1 className="text-2xl font-bold text-emerald-700">Set up your Teacher Profile</h1>
      <p className="text-sm text-gray-500 pb-4">Teachers from all over the world can join Shikshak.</p>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-1">Profile Picture</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full rounded border p-2 bg-gray-50" />
        {form.avatar_url && <img src={form.avatar_url} alt="Avatar" className="mt-2 w-16 h-16 rounded-full object-cover border" />}
      </div>

      <input className="w-full rounded border p-2" placeholder="Headline (e.g. IELTS Expert, 8 yrs exp)" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} required />
      <textarea className="w-full rounded border p-2" placeholder="Bio (Your teaching experience, achievements, etc.)" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">WhatsApp Number (For students to contact you)
          <input className="mt-1 w-full rounded border p-2" placeholder="+91 98765 43210" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
        </label>
        <label className="text-sm">Experience (years)
          <input type="number" step="1" min="0" max="60" className="mt-1 w-full rounded border p-2" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: Number(e.target.value) })} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Country
          <select className="mt-1 w-full rounded border p-2" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
            <option value="India">India</option>
            <option value="USA">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="UAE">UAE</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
        </label>
        <label className="text-sm">City
          <input className="mt-1 w-full rounded border p-2" placeholder="e.g. New York, London" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Currency
          <select className="mt-1 w-full rounded border p-2" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="AED">AED (د.إ)</option>
          </select>
        </label>
        <label className="text-sm">Rate per hour ({form.currency})
          <input type="number" step="0.01" min="0" className="mt-1 w-full rounded border p-2" value={form.base_rate_inr} onChange={(e) => setForm({ ...form, base_rate_inr: Number(e.target.value) })} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Main Subject
          <select className="mt-1 w-full rounded border p-2" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
            <option value="maths">Mathematics</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="coding">Coding</option>
            <option value="ielts">IELTS / TOEFL</option>
          </select>
        </label>
        <label className="text-sm">Languages you teach in (comma separated)
          <input className="mt-1 w-full rounded border p-2" placeholder="English, Hindi" value={form.languages} onChange={(e) => setForm({ ...form, languages: e.target.value })} />
        </label>
      </div>

      <div className="flex gap-4 py-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.teaches_online} onChange={(e) => setForm({ ...form, teaches_online: e.target.checked })} />
          Teach online globally
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.teaches_in_person} onChange={(e) => setForm({ ...form, teaches_in_person: e.target.checked })} />
          Teach in person
        </label>
      </div>

      {msg && <p className="text-sm font-semibold text-emerald-700">{msg}</p>}

      <button disabled={saving} className="w-full rounded bg-emerald-600 py-2 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50">
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
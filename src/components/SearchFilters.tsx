"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SlidersHorizontal } from "lucide-react";

const SUBJECTS = [
  { slug: "all", label: "All Subjects" },
  { slug: "maths", label: "Maths" },
  { slug: "science", label: "Science" },
  { slug: "physics", label: "Physics" },
  { slug: "chemistry", label: "Chemistry" },
  { slug: "biology", label: "Biology" },
  { slug: "english", label: "English" },
  { slug: "hindi", label: "Hindi" },
  { slug: "coding", label: "Coding" },
  { slug: "ielts", label: "IELTS" },
];

const LANGUAGES = ["Any language", "Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"];
const FEES = [
  { label: "Any fee", value: "" },
  { label: "Up to $10/hr", value: "10" },
  { label: "Up to $20/hr", value: "20" },
  { label: "Up to $35/hr", value: "35" },
  { label: "Up to $50/hr", value: "50" },
];

function FiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSubject = searchParams.get("subject") || "all";
  const currentLanguage = searchParams.get("language") || "Any language";
  const currentFee = searchParams.get("fee") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mb-8 space-y-6">
      {/* Subject Pills */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {SUBJECTS.map((s) => {
          const isActive = currentSubject === s.slug;
          return (
            <button
              key={s.slug}
              onClick={() => updateParam("subject", s.slug)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 border ${
                isActive 
                  ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" 
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-col md:flex-row gap-3 bg-white/60 backdrop-blur-md p-3 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex items-center gap-2 px-2 text-slate-400">
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-sm font-semibold text-slate-700">Filters</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 flex-1">
          <select 
            value={currentLanguage}
            onChange={(e) => updateParam("language", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>

          <select 
            value={currentFee}
            onChange={(e) => updateParam("fee", e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-medium text-sm rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            {FEES.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export function SearchFilters() {
  return (
    <Suspense fallback={<div className="h-32 bg-slate-100 animate-pulse rounded-2xl mb-6"></div>}>
      <FiltersContent />
    </Suspense>
  );
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SUBJECTS = [
  { slug: "all", label: "All" },
  { slug: "maths", label: "Maths" },
  { slug: "science", label: "Science" },
  { slug: "physics", label: "Physics" },
  { slug: "chemistry", label: "Chemistry" },
  { slug: "biology", label: "Biology" },
  { slug: "english", label: "English" },
  { slug: "hindi", label: "Hindi" },
  { slug: "commerce", label: "Commerce" },
  { slug: "coding", label: "Coding" },
];

const LANGUAGES = ["Any language", "Hindi", "English", "Tamil", "Telugu", "Bengali", "Marathi", "Gujarati", "Kannada", "Malayalam", "Punjabi"];

// THE NEW GLOBAL FEE FILTER (Values are in USD for database comparison)
const FEES = [
  { label: "Any fee", value: "" },
  { label: "Up to $10/hr (≈ ₹835)", value: "10" },
  { label: "Up to $20/hr (≈ ₹1670)", value: "20" },
  { label: "Up to $35/hr (≈ ₹2920)", value: "35" },
  { label: "Up to $50/hr (≈ ₹4175)", value: "50" },
];

function FiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSubject = searchParams.get("subject") || "all";
  const currentLanguage = searchParams.get("language") || "Any language";
  const currentFee = searchParams.get("fee") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Subject Pills (Horizontal Scroll) */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {SUBJECTS.map((s) => {
          const isActive = currentSubject === s.slug;
          return (
            <button
              key={s.slug}
              onClick={() => updateParam("subject", s.slug)}
              className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold text-sm transition-colors border ${
                isActive 
                  ? "bg-emerald-600 text-white border-emerald-600" 
                  : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filters */}
      <div className="grid grid-cols-2 gap-3">
        <select 
          value={currentLanguage}
          onChange={(e) => updateParam("language", e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-800 font-medium text-sm rounded-lg p-3 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
        >
          {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        <select 
          value={currentFee}
          onChange={(e) => updateParam("fee", e.target.value)}
          className="w-full bg-white border border-gray-300 text-gray-800 font-medium text-sm rounded-lg p-3 outline-none focus:border-emerald-500 appearance-none cursor-pointer"
        >
          {FEES.map(f => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function SearchFilters() {
  return (
    <Suspense fallback={<div className="h-32 bg-gray-50 animate-pulse rounded-lg mb-6"></div>}>
      <FiltersContent />
    </Suspense>
  );
}
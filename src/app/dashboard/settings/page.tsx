"use client";

import { useState } from "react";
import Link from "next/link";

export default function EmailPreferences() {
  const [promos, setPromos] = useState(false);
  const [updates, setUpdates] = useState(true);

  return (
    <main className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-sm border text-gray-900">
      <Link href="/dashboard/student" className="text-sm text-emerald-600 hover:underline mb-6 inline-block font-semibold">
        ← Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">Email preferences</h1>
      <p className="text-sm text-gray-500 mb-8">Manage what emails you receive from Shikshak.</p>

      <div className="space-y-8">
        <div className="border-b pb-6">
          <h2 className="font-bold text-lg mb-1">Product news and events</h2>
          <p className="text-sm text-gray-500 mb-4">We'll occasionally email you about Shikshak features, plans, offers and events.</p>
          <label className="flex items-start gap-3 text-sm font-medium cursor-pointer">
            <input 
              type="checkbox" 
              checked={promos} 
              onChange={(e) => setPromos(e.target.checked)} 
              className="w-5 h-5 mt-0.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" 
            />
            <span>Don't send me product news, offers, and events.</span>
          </label>
        </div>

        <div>
          <h2 className="font-bold text-lg mb-1">Account & Security</h2>
          <p className="text-sm text-gray-500 mb-4">Whatever you choose, essential account emails (security, billing, service updates) still arrive. You can change these choices anytime.</p>
          <p className="text-sm mb-4">
            See our <Link href="#" className="text-emerald-600 underline">Privacy Policy ↗</Link>
          </p>
          <label className="flex items-start gap-3 text-sm font-medium cursor-not-allowed opacity-70">
            <input 
              type="checkbox" 
              checked={updates} 
              disabled 
              className="w-5 h-5 mt-0.5 text-emerald-600 rounded border-gray-300" 
            />
            <span>Receive critical account updates (always on)</span>
          </label>
        </div>
      </div>

      <button className="mt-10 w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-700 transition">
        Save Preferences
      </button>
    </main>
  );
}
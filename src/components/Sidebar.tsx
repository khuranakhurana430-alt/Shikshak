"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string>("student");

  useEffect(() => {
    if (!isOpen) return;
    
    const supabase = createBrowserClient(
      "https://oahllfiowrgcqnmxgdfm.supabase.co",
      "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
    );

    async function getUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setEmail(user.email ?? null);
          const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
          if (profile) setRole(profile.role);
        }
      } catch (err) {
        console.error("Sidebar auth error:", err);
      }
    }
    getUser();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 z-50 transition-opacity backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Panel */}
      <div className="fixed top-0 left-0 h-[100dvh] w-[280px] bg-white z-[60] shadow-2xl flex flex-col text-gray-900 transform transition-transform duration-300">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg text-emerald-700">Shikshak</h2>
            <p className="text-sm text-gray-500 mt-1 truncate w-48">{email || "Welcome Guest"}</p>
            {email && <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mt-1 block">Role: {role}</span>}
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-black font-bold text-xl p-2 cursor-pointer touch-manipulation">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col space-y-1">
            <Link href="/" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-gray-700 font-medium flex items-center gap-3">
              🏠 Home
            </Link>
            <Link href="/search" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-gray-700 font-medium flex items-center gap-3">
              🔍 Find a Tutor
            </Link>
            <Link href="/post-requirement" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-gray-700 font-medium flex items-center gap-3">
              📝 Post a Requirement
            </Link>
            
            <hr className="my-2 border-gray-100" />

            {email ? (
              <>
                <Link href={`/dashboard/${role}`} onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-gray-700 font-medium flex items-center gap-3">
                  📊 My Dashboard
                </Link>
                
                {role === "teacher" && (
                  <Link href="/dashboard/teacher/onboarding" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-3 bg-emerald-50/50">
                    ⚙️ Teacher Onboarding
                  </Link>
                )}

                <Link href="/messages" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-gray-700 font-medium flex items-center gap-3">
                  💬 Messages
                </Link>
                <form action="/auth/signout" method="post" className="w-full">
                  <button type="submit" className="w-full text-left px-6 py-3 hover:bg-red-50 text-red-600 font-medium flex items-center gap-3">
                    🚪 Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-3">
                  🔑 Log In
                </Link>
                <Link href="/signup" onClick={onClose} className="px-6 py-3 hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-3">
                  ✨ Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
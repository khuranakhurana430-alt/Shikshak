"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { X, Home, Search, FileText, LayoutDashboard, MessageSquare, LogOut, Settings } from "lucide-react";

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
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity" onClick={onClose} />
      
      <div className="fixed top-0 left-0 h-full w-[300px] bg-white z-50 shadow-2xl flex flex-col border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="font-extrabold text-xl bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Shikshak</h2>
            <p className="text-sm font-medium text-slate-500 mt-1 truncate w-48">{email || "Welcome Guest"}</p>
            {email && <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-1 block bg-indigo-50 w-fit px-2 py-0.5 rounded-full">Role: {role}</span>}
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="flex flex-col space-y-1 px-3">
            <Link href="/" onClick={onClose} className="px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition">
              <Home className="w-5 h-5 text-slate-400" /> Home
            </Link>
            <Link href="/search" onClick={onClose} className="px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition">
              <Search className="w-5 h-5 text-slate-400" /> Find a Tutor
            </Link>
            <Link href="/post-requirement" onClick={onClose} className="px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition">
              <FileText className="w-5 h-5 text-slate-400" /> Post a Requirement
            </Link>
            
            <div className="my-2 border-t border-slate-100"></div>

            {email ? (
              <>
                <Link href={`/dashboard/${role}`} onClick={onClose} className="px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition">
                  <LayoutDashboard className="w-5 h-5 text-slate-400" /> My Dashboard
                </Link>
                
                {role === "teacher" && (
                  <Link href="/dashboard/teacher/onboarding" onClick={onClose} className="px-3 py-3 rounded-xl bg-indigo-50/50 text-indigo-700 font-medium flex items-center gap-3 transition">
                    <Settings className="w-5 h-5 text-indigo-500" /> Teacher Onboarding
                  </Link>
                )}

                <Link href="/messages" onClick={onClose} className="px-3 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium flex items-center gap-3 transition">
                  <MessageSquare className="w-5 h-5 text-slate-400" /> Messages
                </Link>
                
                <form action="/auth/signout" method="post" className="w-full mt-2">
                  <button type="submit" className="w-full text-left px-3 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium flex items-center gap-3 transition">
                    <LogOut className="w-5 h-5 text-red-400" /> Sign Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={onClose} className="px-3 py-3 rounded-xl hover:bg-slate-50 text-indigo-600 font-bold flex items-center gap-3 transition">
                  Log In
                </Link>
                <Link href="/signup" onClick={onClose} className="px-3 py-3 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center transition hover:bg-slate-800 mt-2">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
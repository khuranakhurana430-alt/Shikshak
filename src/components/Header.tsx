"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Sparkles } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-100 transition text-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Shikshak
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-600">
            <Link href="/search" className="hover:text-indigo-600 transition">Find Tutors</Link>
            <Link href="/post-requirement" className="bg-slate-900 text-white px-5 py-2 rounded-full font-semibold hover:bg-slate-800 transition">
              Post a Requirement
            </Link>
          </div>
        </div>
      </header>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
}
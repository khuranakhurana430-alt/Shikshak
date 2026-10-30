"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";

export function Header() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40 text-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md hover:bg-gray-100 active:bg-gray-200 transition"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <Link href="/" className="text-xl font-extrabold text-emerald-700 tracking-tight">
              Shikshak
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-gray-600">
            <Link href="/search" className="hover:text-emerald-600">Find Tutors</Link>
            <Link href="/post-requirement" className="text-blue-600 font-semibold hover:text-blue-700">
              Post a Requirement
            </Link>
          </div>
        </div>
      </header>

      {isSidebarOpen && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
    </>
  );
}
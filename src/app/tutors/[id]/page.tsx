"use client";

import { useState, useEffect, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams } from "next/navigation";
import Link from "next/link";

function TutorProfileContent() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );

  useEffect(() => {
    async function fetchTeacher() {
      const { data } = await supabase
        .from("teacher_profiles")
        .select("*, profiles(full_name)")
        .eq("id", id)
        .single();
      setTeacher(data);
      setLoading(false);
    }
    fetchTeacher();
  }, [id, supabase]);

  async function handleBookDemo() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to book a demo.");
      return;
    }

    const { error } = await supabase.from("leads").insert({
      teacher_id: id,
      student_id: user.id,
    });

    setRequested(true);
  }

  if (loading) return <div className="text-center p-10 text-gray-900">Loading profile...</div>;
  if (!teacher) return <div className="text-center p-10 text-gray-900">Teacher not found.</div>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 text-gray-900">
      <Link href="/search" className="text-sm text-emerald-600 hover:underline mb-4 inline-block font-semibold">
        ← Back to search results
      </Link>
      
      {/* Top Profile Card */}
      <div className="bg-white rounded-xl border p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          
          <div className="flex gap-4 items-start">
            {/* Profile Picture or Fallback Initial */}
            {teacher.avatar_url ? (
              <img 
                src={teacher.avatar_url} 
                alt="Profile" 
                className="w-24 h-24 rounded-lg object-cover border shadow-sm" 
              />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-700">
                {(teacher.profiles as any)?.full_name?.charAt(0) || "T"}
              </div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                {(teacher.profiles as any)?.full_name ?? "Teacher"}
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold uppercase">Top Tutor</span>
              </h1>
              <p className="text-md text-gray-600 mt-1">{teacher.headline || "Expert Tutor"}</p>
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600 font-medium">
                <span className="flex items-center gap-1">💼 {teacher.experience_years || 0} Yrs of Exp</span>
                <span className="flex items-center gap-1">📍 {teacher.city || "Online"}</span>
                <span className="flex items-center gap-1">⭐ 5.0 (New)</span>
              </div>
            </div>
          </div>

          <div className="text-right w-full md:w-auto border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
            <p className="text-3xl font-bold text-gray-900">₹{teacher.base_rate_inr}<span className="text-sm font-normal text-gray-500">/hr</span></p>
            <p className="text-xs text-gray-500 mt-1">≈ ${(teacher.base_rate_inr / 83.5).toFixed(1)}/hr</p>
            <button 
              onClick={handleBookDemo}
              disabled={requested}
              className={`mt-4 w-full md:w-auto px-6 py-2 rounded-lg font-bold text-white transition ${
                requested ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {requested ? "Demo Requested" : "Book a Free Demo"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {["profile", "classes", "reviews", "q&a"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold text-sm capitalize whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab 
                ? "border-emerald-600 text-emerald-700" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border p-6 shadow-sm min-h-[300px]">
        
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">About</h2>
              <p className="text-gray-700 leading-relaxed">{teacher.bio || "No bio provided."}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Languages Spoken</h3>
                <p className="text-gray-800 font-medium">{teacher.languages?.join(", ")}</p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Boards Taught</h3>
                <p className="text-gray-800 font-medium">{teacher.boards?.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Class Details</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
              <p className="font-bold text-lg">₹{teacher.base_rate_inr} per hour</p>
              <p className="text-sm text-gray-600 mt-1">Mode: {teacher.teaches_online && "Online"} {teacher.teaches_online && teacher.teaches_in_person && "&"} {teacher.teaches_in_person && "Offline"}</p>
            </div>
            <p className="text-gray-500 text-sm">More schedule details coming soon...</p>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Student Reviews</h2>
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500 font-medium">No reviews yet.</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to take a demo and leave a review!</p>
            </div>
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === "q&a" && (
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Questions & Answers</h2>
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500 font-medium">No questions asked yet.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TutorProfilePage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-900">Loading profile...</div>}>
      <TutorProfileContent />
    </Suspense>
  );
}
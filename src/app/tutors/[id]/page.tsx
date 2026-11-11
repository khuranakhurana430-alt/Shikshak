"use client";

import { useState, useEffect, Suspense } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Star, CheckCircle, GraduationCap } from "lucide-react";
import StarRating from "@/components/StarRating";

function TutorProfileContent() {
  const { id } = useParams();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requested, setRequested] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Review state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const supabase = createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  );

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Fetch Teacher Profile
      const { data: teacherData } = await supabase
        .from("teacher_profiles")
        .select("*, profiles(full_name)")
        .eq("id", id)
        .single();
      setTeacher(teacherData);

      // Fetch Reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("*, profiles(full_name)")
        .eq("teacher_id", id)
        .order("created_at", { ascending: false });
      setReviews(reviewsData || []);

      setLoading(false);
    }
    fetchData();
  }, [id, supabase]);

  async function handleBookDemo() {
    setErrorMsg(null);
    if (!currentUser) {
      setErrorMsg("Please log in to book a demo.");
      return;
    }

    // 1. Save the lead to Supabase
    const { error } = await supabase.from("leads").insert({
      teacher_id: id,
      student_id: currentUser.id,
    });

    if (error) {
      setErrorMsg("Database Error: " + error.message);
      return;
    }
    
    setRequested(true);

    // 2. Trigger the Email Notification
    try {
      // Fetch the teacher's email and the student's name to pass to the API
      const { data: teacherProfile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", id)
        .single();

      const { data: studentProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", currentUser.id)
        .single();

      if (teacherProfile?.email) {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teacherEmail: teacherProfile.email,
            teacherName: teacherProfile.full_name,
            studentName: studentProfile?.full_name || "A Student",
          }),
        });
      }
    } catch (err) {
      console.error("Failed to send email notification", err);
    }
  }

  async function handleReviewSubmit() {
    if (!currentUser) return alert("Please log in to leave a review.");
    if (reviewRating === 0) return alert("Please select a star rating.");

    const { error } = await supabase.from("reviews").insert({
      teacher_id: id,
      student_id: currentUser.id,
      rating: reviewRating,
      comment: reviewComment,
    });

    if (error) {
      setReviewMessage("Error: " + error.message);
    } else {
      setReviewMessage("Review submitted successfully!");
      // Refresh reviews
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles(full_name)")
        .eq("teacher_id", id)
        .order("created_at", { ascending: false });
      setReviews(data || []);
      setReviewRating(0);
      setReviewComment("");
    }
  }

  if (loading) return <div className="text-center p-10 text-slate-500 font-semibold">Loading profile...</div>;
  if (!teacher) return <div className="text-center p-10 text-slate-500 font-semibold">Teacher not found.</div>;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 text-slate-900 relative">
      <div className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/search" className="text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-6 font-semibold relative z-10 transition">
        <ArrowLeft className="w-4 h-4" /> Back to search results
      </Link>
      
      {/* Profile Header */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm mb-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          
          <div className="flex gap-6 items-start">
            {teacher.avatar_url ? (
              <img src={teacher.avatar_url} alt="Profile" className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-white shadow-md" />
            ) : (
              <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-4xl font-bold text-indigo-700 shadow-sm">
                {(teacher.profiles as any)?.full_name?.charAt(0) || "T"}
              </div>
            )}
            
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3 flex-wrap">
                {(teacher.profiles as any)?.full_name ?? "Teacher"}
                <span className="text-xs bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Top Tutor</span>
              </h1>
              <p className="text-lg text-slate-600 mt-1 font-medium">{teacher.headline || "Expert Tutor"}</p>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-400" /> {teacher.experience_years || 0} Yrs of Exp</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {teacher.city || "Online"}</span>
                <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-1 rounded-md"><Star className="w-4 h-4 fill-amber-500 text-amber-500" /> {teacher.rating_avg?.toFixed(1) || "0.0"} ({teacher.rating_count || 0} reviews)</span>
              </div>
            </div>
          </div>

          <div className="text-right w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-200/60 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
            <p className="text-4xl font-extrabold text-slate-900">{teacher.currency === "INR" ? "₹" : "$"}{teacher.base_rate_inr}<span className="text-lg font-medium text-slate-500">/hr</span></p>
            
            {errorMsg && <p className="text-red-600 text-sm font-semibold mt-2">{errorMsg}</p>}
            
            <button 
              onClick={handleBookDemo}
              disabled={requested}
              className={`mt-4 w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-white transition shadow-md ${
                requested ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {requested ? "Demo Requested" : "Book a Free Demo"}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto relative z-10">
        {["profile", "classes", "reviews", "q&a"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 font-bold text-sm capitalize whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab 
                ? "border-indigo-600 text-indigo-600" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-sm min-h-[300px] relative z-10 text-slate-800">
        
        {activeTab === "profile" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-3">About</h2>
              <p className="text-slate-600 leading-relaxed text-md">{teacher.bio || "No bio provided."}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Languages Spoken</h3>
                <p className="text-slate-800 font-medium">{teacher.languages?.join(", ")}</p>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Boards Taught</h3>
                <p className="text-slate-800 font-medium">{teacher.boards?.join(", ")}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "classes" && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Class Details</h2>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <p className="font-extrabold text-2xl text-slate-900">{teacher.currency === "INR" ? "₹" : "$"}{teacher.base_rate_inr} per hour</p>
              <p className="text-md text-slate-600 mt-2 font-medium">Mode: {teacher.teaches_online && "Online"} {teacher.teaches_online && teacher.teaches_in_person && "&"} {teacher.teaches_in_person && "Offline"}</p>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Student Reviews</h2>
            
            {/* Display Existing Reviews */}
            <div className="space-y-4 mb-10">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <div key={review.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-slate-900">{review.profiles?.full_name || "Student"}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                  <p className="text-slate-500 font-medium">No reviews yet.</p>
                  <p className="text-sm text-slate-400 mt-1">Be the first to leave a review after a demo class!</p>
                </div>
              )}
            </div>

            {/* Review Submission Form */}
            {currentUser && (
              <div className="border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Leave a Review</h3>
                <div className="mb-4">
                  <StarRating onRatingChange={setReviewRating} />
                </div>
                <textarea
                  className="w-full border border-slate-200 p-4 rounded-xl mb-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
                  rows={3}
                  placeholder="Share your experience with this teacher..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
                <button
                  onClick={handleReviewSubmit}
                  className="bg-slate-900 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-800 transition text-sm shadow-md"
                >
                  Submit Review
                </button>
                {reviewMessage && <p className="text-sm font-semibold mt-3 text-indigo-600 bg-indigo-50 p-3 rounded-lg border border-indigo-100">{reviewMessage}</p>}
              </div>
            )}
          </div>
        )}

        {activeTab === "q&a" && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Questions & Answers</h2>
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
              <p className="text-slate-500 font-medium">No questions asked yet.</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TutorProfilePage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-slate-500 font-semibold">Loading profile...</div>}>
      <TutorProfileContent />
    </Suspense>
  );
}
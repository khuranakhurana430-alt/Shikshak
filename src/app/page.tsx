import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Search, GraduationCap, ArrowRight } from "lucide-react";

const supabase = createClient(
  "https://oahllfiowrgcqnmxgdfm.supabase.co",
  "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
);

export default async function Home() {
  const { data: teachers } = await supabase
    .from("teacher_profiles")
    .select("id, headline, base_rate_inr, city, profiles(full_name)")
    .eq("is_active", true)
    .limit(4);

  return (
    <main className="min-h-screen relative overflow-hidden pb-20">
      
      {/* Background Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-300/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-violet-300/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative pt-24 pb-16 px-4 text-center z-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Find the perfect <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">tutor</span> for you.
          </h1>
          <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto">
            Connect with verified teachers across India and globally. Learn online or in-person, on your schedule.
          </p>

          {/* Glassmorphic Search Box */}
          <form action="/search" method="GET" className="bg-white/60 backdrop-blur-lg border border-white/40 p-3 rounded-2xl shadow-xl flex flex-col md:flex-row gap-3 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                name="subject" 
                placeholder="What do you want to learn? (e.g. Maths)" 
                className="w-full pl-12 pr-4 py-3 bg-white/80 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                required
              />
            </div>
            <div className="flex-1 relative">
              <GraduationCap className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                name="pincode" 
                placeholder="Pincode or City" 
                className="w-full pl-12 pr-4 py-3 bg-white/80 rounded-xl border-none focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                required
              />
            </div>
            <button type="submit" className="bg-slate-900 text-white font-semibold py-3 px-8 rounded-xl hover:bg-slate-800 transition shadow-md">
              Search
            </button>
          </form>
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-5xl mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            { title: "Post Requirement", desc: "Tell us what you want to learn.", step: "01" },
            { title: "Get Responses", desc: "Connect with top verified tutors.", step: "02" },
            { title: "Start Learning", desc: "Book a free demo and start.", step: "03" }
          ].map((item, i) => (
            <div key={i} className="bg-white/50 backdrop-blur-sm border border-slate-200/60 p-8 rounded-2xl shadow-sm hover:shadow-md transition">
              <span className="text-4xl font-extrabold text-indigo-200 mb-4 block">{item.step}</span>
              <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Tutors */}
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Featured Tutors</h2>
            <p className="text-slate-500 mt-2">Meet our top-rated educators.</p>
          </div>
          <Link href="/search" className="text-indigo-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {teachers && teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {teachers.map((t: any) => (
              <Link key={t.id} href={`/tutors/${t.id}`} className="group">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group-hover:-translate-y-1">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-lg font-bold text-indigo-700 mb-4">
                      {(t.profiles as any)?.full_name?.charAt(0) || "T"}
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition">
                      {(t.profiles as any)?.full_name || "Teacher"}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {t.headline || "Expert Tutor"}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm text-slate-500">📍 {t.city || "Online"}</span>
                    <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-full">₹{t.base_rate_inr}/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-center py-10">No teachers found yet.</p>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 z-50 w-[90%] md:w-auto">
        <p className="font-medium hidden md:block">Want to learn something new?</p>
        <Link href="/post-requirement" className="bg-white text-slate-900 font-bold py-2 px-6 rounded-full hover:bg-slate-100 transition w-full md:w-auto text-center whitespace-nowrap">
          Post a Requirement
        </Link>
      </div>

    </main>
  );
}
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

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
    <main className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      <div className="bg-emerald-800 py-20 px-4 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Welcome to Shikshak
          </h1>
          <p className="text-lg text-emerald-100 mb-8">
            Search from over 10,000+ verified Tutors, Trainers and Institutes.
          </p>

          <form action="/search" method="GET" className="bg-white p-4 rounded-xl shadow-lg flex flex-col md:flex-row gap-3 text-left">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">What do you want to learn?</label>
              <input name="subject" placeholder="Eg: Maths, Coding..." className="w-full border-b-2 border-gray-200 p-2 focus:outline-none focus:border-emerald-500 text-black" required />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Where do you need it?</label>
              <input name="pincode" placeholder="Enter Pincode" className="w-full border-b-2 border-gray-200 p-2 focus:outline-none focus:border-emerald-500 text-black" required />
            </div>
            <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition md:mt-4">
              SEARCH
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10">How Shikshak works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-bold text-lg mb-2">Post your requirement</h3>
            <p className="text-gray-600 text-sm">Tell us what you want to learn and where.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="font-bold text-lg mb-2">Get customized responses</h3>
            <p className="text-gray-600 text-sm">Get contacted by the best local and online tutors.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="font-bold text-lg mb-2">Compare & hire smartly</h3>
            <p className="text-gray-600 text-sm">Review profiles and rates, then hire.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Tutors</h2>
          <Link href="/search" className="text-emerald-600 font-semibold hover:underline">View All →</Link>
        </div>
        
        {teachers && teachers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {teachers.map((t: any) => (
              <Link key={t.id} href={`/tutors/${t.id}`} className="block">
                <div className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition h-full flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-800 truncate">{(t.profiles as any)?.full_name || "Teacher"}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{t.headline || "Expert Tutor"}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-sm text-gray-500">📍 {t.city || "Online"}</span>
                    <span className="font-bold text-gray-900">₹{t.base_rate_inr}/hr</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No teachers found yet.</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <p className="font-semibold text-emerald-800 hidden md:block">Want to learn something new?</p>
        <Link href="/post-requirement" className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition w-full md:w-auto text-center">
          Post your learning requirement
        </Link>
      </div>
    </main>
  );
}
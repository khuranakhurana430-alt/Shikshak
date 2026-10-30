import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { Mail, Phone, MapPin, Briefcase, IndianRupee, MessageSquare } from "lucide-react";

async function DashboardContent() {
  await connection();

  const cookieStore = await cookies();
  const supabase = createServerClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const { data: teacherProfile } = await supabase.from("teacher_profiles").select("*").eq("id", user.id).maybeSingle();
  
  const { data: leads } = await supabase
    .from("leads")
    .select("id, created_at, student_id, profiles!leads_student_id_fkey(full_name)")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const symbol = teacherProfile?.currency === "INR" ? "₹" : "$";

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-4 md:p-8 text-slate-900 min-h-screen relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 relative z-10">
        <h1 className="text-2xl font-extrabold text-slate-900">Teacher Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition">Sign out</button>
        </form>
      </div>
      
      <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/60 p-6 md:p-8 shadow-sm relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-4">
            {teacherProfile?.avatar_url ? (
              <img src={teacherProfile.avatar_url} alt="Profile" className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-2xl font-bold text-indigo-700 shadow-sm">
                {(profile?.full_name || "T").charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profile?.full_name || user.email}</h2>
              <p className="text-slate-500 font-medium">{teacherProfile?.headline || "Expert Tutor"}</p>
            </div>
          </div>
          <Link href="/dashboard/teacher/onboarding" className="text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-5 py-2.5 rounded-xl hover:bg-indigo-100 transition">
            Edit Details
          </Link>
        </div>

        {teacherProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Info</h3>
              <div className="flex items-center gap-3 text-slate-700 font-medium"><Mail className="w-5 h-5 text-slate-400" /> {user.email}</div>
              <div className="flex items-center gap-3 text-slate-700 font-medium"><Phone className="w-5 h-5 text-slate-400" /> {teacherProfile.whatsapp || "Not provided"}</div>
              <div className="flex items-center gap-3 text-slate-700 font-medium"><MapPin className="w-5 h-5 text-slate-400" /> {teacherProfile.city ? `${teacherProfile.city}, ` : ""}{teacherProfile.country}</div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Teaching Details</h3>
              <div className="flex items-center gap-3 text-slate-700 font-medium"><Briefcase className="w-5 h-5 text-slate-400" /> {teacherProfile.experience_years} years experience</div>
              <div className="flex items-center gap-3 text-slate-700 font-medium"><IndianRupee className="w-5 h-5 text-slate-400" /> {symbol}{teacherProfile.base_rate_inr}/hr</div>
              <p className="text-sm text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                Mode: {teacherProfile.teaches_online ? "Online" : ""} {teacherProfile.teaches_online && teacherProfile.teaches_in_person ? "&" : ""} {teacherProfile.teaches_in_person ? "In-Person" : ""}
              </p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About Me</h3>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-100">{teacherProfile.bio || "No bio provided yet."}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4 font-medium">You haven't completed your profile yet.</p>
            <Link href="/dashboard/teacher/onboarding" className="inline-block rounded-xl bg-indigo-600 px-6 py-3 text-white font-bold hover:bg-indigo-700 transition">
              Complete Profile Now
            </Link>
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h2 className="text-xl font-bold mb-4">Student Requests</h2>
        {leads && leads.length > 0 ? (
          <div className="grid gap-3">
            {leads.map((lead: any) => (
              <Link key={lead.id} href={`/messages/${lead.student_id}`} className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-5 flex justify-between items-center hover:shadow-md hover:border-indigo-200 transition group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{lead.profiles?.full_name || "A Student"} wants to connect!</p>
                    <p className="text-sm text-slate-500">Click here to send a message</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">{new Date(lead.created_at).toLocaleDateString()}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 border-dashed">
            <p className="text-slate-500 font-medium">No student requests yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-slate-500 font-semibold">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
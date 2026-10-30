import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";

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
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
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
    <main className="mx-auto max-w-4xl space-y-6 p-6 text-gray-900 min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-600 underline">Sign out</button>
        </form>
      </div>
      
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            {teacherProfile?.avatar_url ? (
              <img src={teacherProfile.avatar_url} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
                {(profile?.full_name || "T").charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-emerald-700">{profile?.full_name || user.email}</h2>
              <p className="text-gray-600 font-medium">{teacherProfile?.headline || "Expert Tutor"}</p>
            </div>
          </div>
          <Link href="/dashboard/teacher/onboarding" className="text-sm rounded border border-emerald-600 text-emerald-700 px-4 py-2 font-semibold hover:bg-emerald-50 transition">
            Edit Details
          </Link>
        </div>

        {teacherProfile ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Contact Info</h3>
              <p className="text-gray-800"><strong>Email:</strong> {user.email}</p>
              <p className="text-gray-800"><strong>WhatsApp:</strong> {teacherProfile.whatsapp || "Not provided"}</p>
              <p className="text-gray-800"><strong>Location:</strong> {teacherProfile.city ? `${teacherProfile.city}, ` : ""}{teacherProfile.country}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Teaching Details</h3>
              <p className="text-gray-800"><strong>Experience:</strong> {teacherProfile.experience_years} years</p>
              <p className="text-gray-800"><strong>Rate:</strong> {symbol}{teacherProfile.base_rate_inr}/hr</p>
              <p className="text-gray-800"><strong>Mode:</strong> {teacherProfile.teaches_online ? "Online" : ""} {teacherProfile.teaches_online && teacherProfile.teaches_in_person ? "&" : ""} {teacherProfile.teaches_in_person ? "In-Person" : ""}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">You haven't completed your profile yet.</p>
            <Link href="/dashboard/teacher/onboarding" className="inline-block rounded bg-emerald-600 px-6 py-2 text-white font-semibold hover:bg-emerald-700">
              Complete Profile Now
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Student Requests</h2>
        {leads && leads.length > 0 ? (
          <ul className="space-y-3">
            {leads.map((lead: any) => (
              <li key={lead.id}>
                {/* CLICKABLE LINK TO CHAT */}
                <Link href={`/messages/${lead.student_id}`} className="border rounded p-4 flex justify-between items-center bg-gray-50 hover:bg-emerald-50 transition block cursor-pointer group">
                  <div>
                    <p className="font-semibold text-emerald-700 group-hover:underline">
                      {lead.profiles?.full_name || "A Student"} wants to connect!
                    </p>
                    <p className="text-sm text-gray-600">Click here to send a message</p>
                  </div>
                  <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 border rounded">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No student requests yet. When a student books a demo, they will appear here.</p>
        )}
      </div>
    </main>
  );
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-900 font-semibold">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

async function StudentDashboardContent() {
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

  const { data: requirements } = await supabase
    .from("requirements")
    .select("id, level, mode, pincode, status, created_at, subjects(name)")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6 text-gray-900 min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-600 underline">Sign out</button>
        </form>
      </div>
      
      {/* MY PROFILE DETAILS CARD */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
              {(profile?.full_name || "S").charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-700">{profile?.full_name || user.email}</h2>
              <p className="text-gray-600 font-medium capitalize">Role: {profile?.role || "Student"}</p>
            </div>
          </div>
          <Link 
            href="/post-requirement" 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            + Post New Requirement
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Contact Info</h3>
            <p className="text-gray-800"><strong>Email:</strong> {user.email}</p>
            <p className="text-gray-800"><strong>Phone:</strong> {profile?.phone || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Location Details</h3>
            <p className="text-gray-800"><strong>Timezone:</strong> {profile?.timezone || "Asia/Kolkata"}</p>
            <p className="text-gray-800"><strong>Country:</strong> {profile?.country_code || "IN"}</p>
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">My Learning Needs</h2>
        <div className="space-y-4">
          {requirements && requirements.length > 0 ? (
            requirements.map((req: any) => (
              <div key={req.id} className="bg-gray-50 rounded-xl border p-5 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {req.subjects?.name || "Tuition"} ({req.level})
                  </h3>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full uppercase">
                    {req.status}
                  </span>
                </div>
                
                <div className="flex gap-4 text-sm text-gray-600 mb-4">
                  <span className="bg-white border px-2 py-1 rounded">📍 {req.pincode || "Online"}</span>
                  <span className="bg-white border px-2 py-1 rounded capitalize">💻 {req.mode}</span>
                </div>

                <div className="border-t pt-3 flex justify-between items-center text-sm">
                  <span className="text-gray-400">Posted: {new Date(req.created_at).toLocaleDateString()}</span>
                  <Link href="/search" className="text-blue-600 font-semibold hover:underline">
                    View Matching Tutors →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
              <p className="text-gray-500 text-lg">You haven't posted any learning requirements yet.</p>
              <p className="text-gray-400 text-sm mt-1 mb-4">Post a requirement to let tutors come to you.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-900 font-semibold">Loading dashboard...</div>}>
      <StudentDashboardContent />
    </Suspense>
  );
}
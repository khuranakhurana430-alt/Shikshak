import { Suspense } from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";

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
    <main className="mx-auto max-w-3xl space-y-6 p-6 text-gray-900 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-600 underline">Sign out</button>
        </form>
      </div>
      
      {/* Profile Card */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700">
              {(profile?.full_name || user.email || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-700">{profile?.full_name || "Student"}</h2>
              <p className="text-gray-600 font-medium">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">📞 {profile?.phone || "No phone added"}</p>
            </div>
          </div>
          <Link 
            href="/dashboard/student/profile" 
            className="text-sm rounded border border-blue-600 text-blue-700 px-4 py-2 font-semibold hover:bg-blue-50 transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Requirements Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">My Learning Needs</h2>
          <Link href="/post-requirement" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
            + Post New
          </Link>
        </div>

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
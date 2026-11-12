import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { Bell, MessageSquare, UserPlus, ChevronRight } from "lucide-react";

export const dynamic = 'force-dynamic'; // Ensures fresh data on every load

export default async function NotificationsPage() {
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

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const isTeacher = profile?.role === "teacher";

  // Fetch recent messages
  const { data: messages } = await supabase
    .from("messages")
    .select("id, content, created_at, sender_id, profiles!messages_sender_id_fkey(full_name)")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch recent leads (if teacher)
  let leads: any[] = [];
  if (isTeacher) {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("id, created_at, profiles!leads_student_id_fkey(full_name)")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (leadsData) leads = leadsData;
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-6 mt-10 text-slate-900 min-h-screen relative">
      <div className="absolute top-[10%] left-[-5%] w-[30%] h-[30%] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4 relative z-10">
        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
          <Bell className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Notifications</h1>
      </div>

      <div className="space-y-8 relative z-10">
        {/* New Demo Requests (For Teachers) */}
        {isTeacher && (
          <section>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">New Demo Requests</h2>
            <div className="space-y-3">
              {leads && leads.length > 0 ? (
                leads.map((lead) => (
                  <Link key={lead.id} href="/dashboard/teacher" className="block">
                    <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {lead.profiles?.full_name || "A Student"} booked a demo
                          </p>
                          <p className="text-sm text-slate-500">{new Date(lead.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 bg-white/50 rounded-2xl border border-slate-200/60 border-dashed">
                  <p className="text-slate-500 text-sm">No new demo requests yet.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Recent Messages */}
        <section>
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Recent Messages</h2>
          <div className="space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((msg) => (
                <Link key={msg.id} href={`/messages/${msg.sender_id}`} className="block">
                  <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          New message from {(msg.profiles as any)?.full_name || "User"}
                        </p>
                        <p className="text-sm text-slate-500 line-clamp-1">{msg.content}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 bg-white/50 rounded-2xl border border-slate-200/60 border-dashed">
                <p className="text-slate-500 text-sm">No recent messages.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
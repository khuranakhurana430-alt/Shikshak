import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, MessageSquare, ChevronRight } from "lucide-react";

export default async function MessagesPage() {
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

  const { data: messages } = await supabase.from("messages").select("sender_id, receiver_id").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
  const { data: leadsSent } = await supabase.from("leads").select("teacher_id").eq("student_id", user.id);
  const { data: leadsReceived } = await supabase.from("leads").select("student_id").eq("teacher_id", user.id);

  const contactIds = new Set<string>();
  messages?.forEach((m) => contactIds.add(m.sender_id === user.id ? m.receiver_id : m.sender_id));
  leadsSent?.forEach((l) => { if (l.teacher_id) contactIds.add(l.teacher_id); });
  leadsReceived?.forEach((l) => { if (l.student_id) contactIds.add(l.student_id); });
  contactIds.delete(user.id);

  let contactList: { id: string; name: string }[] = [];
  if (contactIds.size > 0) {
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, role").in("id", Array.from(contactIds));
    contactList = profiles?.map((p) => ({ id: p.id, name: p.full_name || (p.role === "teacher" ? "Teacher" : "Student") })) || [];
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-6 mt-10 text-slate-900 min-h-[70vh] relative overflow-hidden">
      <div className="absolute top-[20%] left-[-10%] w-[30%] h-[30%] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-4">
          <Link href="/" className="p-2 bg-white rounded-full hover:bg-slate-50 border border-slate-200 shadow-sm transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900">Messages</h1>
        </div>

        {contactList.length > 0 ? (
          <div className="space-y-3">
            {contactList.map((contact) => (
              <Link key={contact.id} href={`/messages/${contact.id}`} className="block">
                <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-lg font-bold text-indigo-700">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition">{contact.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">Click to open chat</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200/60 border-dashed">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">No messages yet.</h2>
            <p className="text-slate-500 mt-2 text-center max-w-sm">When you connect with a teacher or student, your conversations will appear here.</p>
            <Link href="/search" className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-md">
              Find a Tutor
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
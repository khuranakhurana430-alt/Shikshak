import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";

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

  // 1. Fetch all messages to find out who we are talking to
  const { data: messages } = await supabase
    .from("messages")
    .select("sender_id, receiver_id")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);

  // 2. Fetch all leads (booked demos)
  const { data: leadsSent } = await supabase.from("leads").select("teacher_id").eq("student_id", user.id);
  const { data: leadsReceived } = await supabase.from("leads").select("student_id").eq("teacher_id", user.id);

  // 3. Collect all unique user IDs we have interacted with
  const contactIds = new Set<string>();
  
  messages?.forEach((m) => {
    contactIds.add(m.sender_id === user.id ? m.receiver_id : m.sender_id);
  });
  leadsSent?.forEach((l) => { if (l.teacher_id) contactIds.add(l.teacher_id); });
  leadsReceived?.forEach((l) => { if (l.student_id) contactIds.add(l.student_id); });

  // Remove our own ID just in case
  contactIds.delete(user.id);

  // 4. Fetch the names for all these contacts
  let contactList: { id: string; name: string }[] = [];
  
  if (contactIds.size > 0) {
    const idsArray = Array.from(contactIds);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("id", idsArray);

    contactList = profiles?.map((p) => ({
      id: p.id,
      name: p.full_name || (p.role === "teacher" ? "Teacher" : "Student")
    })) || [];
  }

  return (
    <main className="mx-auto max-w-2xl p-6 mt-10 text-gray-900 min-h-[70vh]">
      <div className="flex items-center gap-4 mb-8 border-b pb-4">
        <Link href="/" className="text-2xl text-gray-500 hover:text-black">←</Link>
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      {contactList.length > 0 ? (
        <div className="space-y-3">
          {contactList.map((contact) => (
            <Link key={contact.id} href={`/messages/${contact.id}`} className="block">
              <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md hover:bg-emerald-50 transition flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-lg font-bold text-emerald-700">
                    {contact.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-emerald-700">{contact.name}</h3>
                    <p className="text-sm text-gray-500">Click to open chat</p>
                  </div>
                </div>
                <span className="text-emerald-600 text-xl group-hover:translate-x-1 transition">→</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed">
          <div className="text-6xl mb-4 text-gray-300">📦</div>
          <h2 className="text-xl font-semibold text-gray-700">You have not received any Message yet.</h2>
          <p className="text-gray-500 mt-2">When a teacher or student contacts you, their messages will appear here.</p>
          <Link href="/search" className="mt-6 bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-700">
            Find a Tutor
          </Link>
        </div>
      )}
    </main>
  );
}
"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";

function ChatContent() {
  const { id: receiverId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [receiverName, setReceiverName] = useState("User");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo(() => createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  ), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let channel: any;
    let isMounted = true;

    async function loadChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      if (!isMounted) return;
      setCurrentUser(user);

      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", receiverId).single();
      if (profile && isMounted) setReceiverName(profile.full_name || profile.role);

      const { data } = await supabase.from("messages").select("*").or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`).order("created_at", { ascending: true });
      if (data && isMounted) setMessages(data);
      if (isMounted) setLoading(false);

      const channelName = `chat_${user.id}_${receiverId}`;
      channel = supabase.channel(channelName).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const newMsg = payload.new as any;
        if ((newMsg.sender_id === user.id && newMsg.receiver_id === receiverId) || (newMsg.sender_id === receiverId && newMsg.receiver_id === user.id)) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      }).subscribe();
    }
    
    loadChat();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [receiverId, supabase, router]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    const text = newMessage;
    setNewMessage(""); 
    await supabase.from("messages").insert({ sender_id: currentUser.id, receiver_id: receiverId, content: text });
  }

  if (loading) return <div className="text-center p-10 text-slate-500 font-semibold">Loading chat...</div>;

  return (
    <main className="max-w-3xl mx-auto h-[calc(100dvh-4rem)] flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Background Blur */}
      <div className="absolute top-[30%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200/60 flex items-center gap-4 bg-white/70 backdrop-blur-md shadow-sm z-10">
        <Link href="/messages" className="p-2 rounded-full hover:bg-slate-100 transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{receiverName}</h1>
          <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Chat
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
        {messages.length === 0 && (
          <div className="text-center py-10 text-slate-400 font-medium">
            No messages yet. Say hi to start the conversation!
          </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-3.5 rounded-2xl shadow-sm ${
                isMe 
                  ? "bg-indigo-600 text-white rounded-tr-sm" 
                  : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm"
              }`}>
                <p className="text-sm font-medium break-words">{msg.content}</p>
                <p className={`text-[10px] font-bold mt-1.5 text-right ${isMe ? "text-indigo-200" : "text-slate-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-slate-200/60 bg-white/70 backdrop-blur-md flex gap-3 z-10">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border border-slate-200 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white"
          required
        />
        <button type="submit" className="bg-indigo-600 text-white font-bold px-5 md:px-6 py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-md flex items-center gap-2">
          <Send className="w-4 h-4 hidden md:block" /> <span className="hidden md:block">Send</span>
          <Send className="w-4 h-4 md:hidden" />
        </button>
      </form>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-slate-500 font-semibold">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
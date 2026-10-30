"use client";

import { useState, useEffect, useRef, Suspense, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function ChatContent() {
  const { id: receiverId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [receiverName, setReceiverName] = useState("User");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1. Memoize the Supabase client so it doesn't recreate on every render
  const supabase = useMemo(() => createBrowserClient(
    "https://oahllfiowrgcqnmxgdfm.supabase.co",
    "sb_publishable_64KDfY2HT8Q48vvcz6IiIw_cHvqT2i-"
  ), []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let channel: any; // Keep a reference to the channel to clean it up later
    let isMounted = true;

    async function loadChat() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      if (!isMounted) return;
      setCurrentUser(user);

      // Get receiver name
      const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", receiverId).single();
      if (profile && isMounted) setReceiverName(profile.full_name || profile.role);

      // Fetch initial messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      
      if (data && isMounted) setMessages(data);
      if (isMounted) setLoading(false);

      // 2. Give the channel a UNIQUE name so React Strict Mode doesn't clash
      const channelName = `chat_${user.id}_${receiverId}`;
      
      // 3. Attach the listener BEFORE calling subscribe()
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const newMsg = payload.new as any;
            if (
              (newMsg.sender_id === user.id && newMsg.receiver_id === receiverId) ||
              (newMsg.sender_id === receiverId && newMsg.receiver_id === user.id)
            ) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMsg.id)) return prev;
                return [...prev, newMsg];
              });
            }
          }
        )
        .subscribe();
    }
    
    loadChat();

    // 4. Cleanup function to destroy the channel when you leave the page
    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [receiverId, supabase, router]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const text = newMessage;
    setNewMessage(""); 

    await supabase.from("messages").insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: text,
    });
  }

  if (loading) return <div className="text-center p-10 text-gray-900">Loading chat...</div>;

  return (
    <main className="max-w-3xl mx-auto h-[calc(100dvh-4rem)] flex flex-col bg-white border-x text-gray-900">
      
      {/* Chat Header */}
      <div className="p-3 md:p-4 border-b flex items-center gap-3 md:gap-4 bg-gray-50 shadow-sm z-10">
        <Link href="/messages" className="text-2xl text-gray-500 hover:text-black">←</Link>
        <div>
          <h1 className="text-lg font-bold">{receiverName}</h1>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Chat
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            No messages yet. Say hi to start the conversation!
          </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] md:max-w-[75%] p-3 rounded-xl shadow-sm ${
                isMe 
                  ? "bg-emerald-600 text-white rounded-tr-none" 
                  : "bg-white border text-gray-800 rounded-tl-none"
              }`}>
                <p className="text-sm break-words">{msg.content}</p>
                <p className={`text-[10px] mt-1 text-right ${isMe ? "text-emerald-200" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={sendMessage} className="p-3 md:p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-3 rounded-lg outline-none focus:border-emerald-500 text-sm"
          required
        />
        <button type="submit" className="bg-emerald-600 text-white font-bold px-5 md:px-6 py-2 rounded-lg hover:bg-emerald-700 transition">
          Send
        </button>
      </form>
    </main>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-gray-900">Loading chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
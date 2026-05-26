import { useState, useEffect, useRef } from "react";
import { Search, Send, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { supabase, type ChatSession, type ChatMessage } from "../../../lib/supabase";

function guestLabel(s: ChatSession) {
  return s.guest_name || `Guest #${s.session_id.slice(0, 6).toUpperCase()}`;
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function MessagesPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [active, setActive] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const msgChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sessions + subscribe to new/updated sessions
  useEffect(() => {
    fetchSessions();

    const ch = supabase
      .channel("admin_sessions")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_sessions" },
        ({ new: s }) => setSessions(prev => [s as ChatSession, ...prev])
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "chat_sessions" },
        ({ new: s }) => setSessions(prev =>
          prev.map(sess => sess.session_id === (s as ChatSession).session_id ? s as ChatSession : sess)
        )
      )
      .subscribe();

    return () => { ch.unsubscribe(); };
  }, []);

  // Load messages + subscribe when active session changes
  useEffect(() => {
    if (!active) return;
    fetchMessages(active.session_id);

    msgChannelRef.current?.unsubscribe();
    msgChannelRef.current = supabase
      .channel(`admin_msgs:${active.session_id}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${active.session_id}` },
        ({ new: msg }) =>
          setMessages(prev =>
            prev.some(m => m.id === (msg as ChatMessage).id) ? prev : [...prev, msg as ChatMessage]
          )
      )
      .subscribe();

    return () => { msgChannelRef.current?.unsubscribe(); };
  }, [active?.session_id]);

  async function fetchSessions() {
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .order("last_message_at", { ascending: false });
    if (data) setSessions(data as ChatSession[]);
    setLoadingSessions(false);
  }

  async function fetchMessages(sessionId: string) {
    setLoadingMsgs(true);
    setMessages([]);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at");
    if (data) setMessages(data as ChatMessage[]);
    setLoadingMsgs(false);

    // Mark as read
    await supabase.from("chat_sessions")
      .update({ unread_count: 0 })
      .eq("session_id", sessionId);
    setSessions(prev =>
      prev.map(s => s.session_id === sessionId ? { ...s, unread_count: 0 } : s)
    );
  }

  const handleSend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !active) return;
    const text = newMessage.trim();
    setNewMessage("");

    const { data: msg } = await supabase
      .from("chat_messages")
      .insert({ session_id: active.session_id, sender: "admin", text })
      .select()
      .single();

    if (msg) {
      setMessages(prev =>
        prev.some(m => m.id === msg.id) ? prev : [...prev, msg as ChatMessage]
      );
    }

    await supabase
      .from("chat_sessions")
      .update({ last_message: text, last_message_at: new Date().toISOString() })
      .eq("session_id", active.session_id);
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    await supabase.from("chat_messages").delete().eq("session_id", sessionId);
    await supabase.from("chat_sessions").delete().eq("session_id", sessionId);
    setSessions(prev => prev.filter(s => s.session_id !== sessionId));
    if (active?.session_id === sessionId) setActive(null);
  };

  const filtered = sessions.filter(s =>
    guestLabel(s).toLowerCase().includes(search.toLowerCase()) ||
    (s.last_message ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">

      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : filtered.map(session => (
            <div
              key={session.session_id}
              onClick={() => setActive(session)}
              className={`p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 ${
                active?.session_id === session.session_id ? "bg-orange-50 border-r-4 border-r-orange-400" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm flex-shrink-0">
                {guestLabel(session).slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-sm font-bold truncate text-gray-800">{guestLabel(session)}</h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{fmtTime(session.last_message_at)}</span>
                </div>
                <p className={`text-xs truncate ${session.unread_count > 0 ? "font-bold text-gray-800" : "text-gray-500"}`}>
                  {session.last_message ?? "Started a conversation"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {session.unread_count > 0 && (
                  <div className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {session.unread_count > 9 ? "9+" : session.unread_count}
                  </div>
                )}
                <button
                  onClick={e => handleDelete(e, session.session_id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
              {guestLabel(active).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{guestLabel(active)}</h2>
              <p className="text-xs text-gray-400 font-mono">ID: {active.session_id.slice(0, 16)}…</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
              </div>
            ) : messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === "admin"
                    ? "bg-black text-white rounded-tr-none"
                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-[10px] mt-1 text-right text-gray-400">{fmtTime(msg.created_at)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="bg-orange-400 text-black p-3 rounded-xl hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-gray-600">Select a conversation</p>
            <p className="text-sm">Choose a guest from the list to view messages</p>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, type ChatMessage } from "../../lib/supabase";

const CHOICES = [
  "I have a booking inquiry",
  "I need help with my reservation",
  "Room availability & pricing",
  "Other concern",
];

const FORWARD_MSG = "Got it! I will be forwarding you to an agent. Please hold on a moment. 😊";

function getSessionId(): string {
  let id = localStorage.getItem("cig_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("cig_session_id", id);
  }
  return id;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

type LocalMsg = { id: string; sender: "user" | "admin"; text: string; time: string };

export function ChatWidget() {
  const sessionId = useRef(getSessionId());
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<"choices" | "chat">("choices");
  const [messages, setMessages] = useState<LocalMsg[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, stage]);

  // Subscribe to admin replies once session is saved
  useEffect(() => {
    if (!sessionSaved) return;
    const sid = sessionId.current;
    const ch = supabase
      .channel(`chat:${sid}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sid}` },
        ({ new: msg }) => {
          const m = msg as ChatMessage;
          if (m.sender !== "admin") return;
          setMessages(prev =>
            prev.some(x => x.id === m.id) ? prev : [
              ...prev,
              { id: m.id, sender: "admin", text: m.text, time: fmtTime(m.created_at) }
            ]
          );
        }
      )
      .subscribe();
    return () => { ch.unsubscribe(); };
  }, [sessionSaved]);

  async function saveToSupabase(userText: string, adminText: string) {
    const sid = sessionId.current;
    try {
      if (!sessionSaved) {
        await supabase.from("chat_sessions").upsert(
          { session_id: sid, last_message: userText, last_message_at: new Date().toISOString() },
          { onConflict: "session_id" }
        );
        setSessionSaved(true);
      }
      await supabase.from("chat_messages").insert([
        { session_id: sid, sender: "user", text: userText },
        { session_id: sid, sender: "admin", text: adminText },
      ]);
      const { data: sess } = await supabase
        .from("chat_sessions").select("unread_count").eq("session_id", sid).single();
      await supabase.from("chat_sessions")
        .update({
          last_message: adminText,
          last_message_at: new Date().toISOString(),
          unread_count: (sess?.unread_count ?? 0) + 1,
        })
        .eq("session_id", sid);
    } catch (err) {
      console.error("[ChatWidget] Supabase save failed:", err);
    }
  }

  const handleChoiceClick = (choice: string) => {
    const now = new Date().toISOString();
    const userMsg: LocalMsg = { id: crypto.randomUUID(), sender: "user", text: choice, time: fmtTime(now) };
    setMessages([userMsg]);
    setStage("chat");
    setIsTyping(true);

    setTimeout(async () => {
      setIsTyping(false);
      const replyMsg: LocalMsg = {
        id: crypto.randomUUID(),
        sender: "admin",
        text: FORWARD_MSG,
        time: fmtTime(new Date().toISOString()),
      };
      setMessages(prev => [...prev, replyMsg]);
      await saveToSupabase(choice, FORWARD_MSG);
    }, 1600);
  };

  const handleSend = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText("");
    const sid = sessionId.current;

    const userMsg: LocalMsg = { id: crypto.randomUUID(), sender: "user", text, time: fmtTime(new Date().toISOString()) };
    setMessages(prev => [...prev, userMsg]);

    try {
      const { data } = await supabase.from("chat_messages")
        .insert({ session_id: sid, sender: "user", text })
        .select().single();
      if (data) {
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, id: (data as ChatMessage).id } : m));
      }
      const { data: sess } = await supabase
        .from("chat_sessions").select("unread_count").eq("session_id", sid).single();
      await supabase.from("chat_sessions")
        .update({
          last_message: text,
          last_message_at: new Date().toISOString(),
          unread_count: (sess?.unread_count ?? 0) + 1,
        })
        .eq("session_id", sid);
    } catch (err) {
      console.error("[ChatWidget] Send failed:", err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ maxHeight: 520 }}
          >
            {/* Header */}
            <div className="bg-black p-4 flex justify-between items-center text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
                    CIG
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Customer Support</h3>
                  <p className="text-xs text-gray-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-3 min-h-0">

              {/* Welcome bot message — always visible */}
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200 px-4 py-3 text-sm shadow-sm max-w-[85%]">
                  <p>Hi! 👋 How may I help you today?</p>
                </div>
              </div>

              {/* Quick choices */}
              {stage === "choices" && (
                <div className="flex flex-col gap-2 pl-1">
                  {CHOICES.map(c => (
                    <button
                      key={c}
                      onClick={() => handleChoiceClick(c)}
                      className="text-left text-sm bg-white border border-orange-300 text-orange-700 font-medium px-4 py-2.5 rounded-xl hover:bg-orange-50 hover:border-orange-400 transition-all shadow-sm"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              {/* Conversation messages */}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 text-sm shadow-sm ${
                    msg.sender === "user"
                      ? "bg-orange-400 text-black rounded-2xl rounded-tr-none"
                      : "bg-white text-gray-800 rounded-2xl rounded-tl-none border border-gray-200"
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] mt-1 text-right ${msg.sender === "user" ? "text-black/60" : "text-gray-400"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1 items-center h-4">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input — only visible after choice selected */}
            {stage === "chat" && (
              <div className="p-3 bg-white border-t border-gray-100 flex-shrink-0">
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="bg-black text-white p-2 rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-14 h-14 bg-orange-400 text-black rounded-full shadow-lg hover:bg-orange-500 hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-orange-200"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageSquare className="w-6 h-6 fill-black" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
        )}
      </button>
    </div>
  );
}

import { useState } from "react";
import { Search, Send, Paperclip, MoreVertical, Phone, Video, User, Circle } from "lucide-react";

// Mock Data
const CONVERSATIONS = [
  { 
    id: 1, 
    guest: "Maria Santos", 
    lastMessage: "Is it possible to check in early at 12 PM?", 
    time: "10:30 AM", 
    unread: 2,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    status: "online"
  },
  { 
    id: 2, 
    guest: "John Doe", 
    lastMessage: "Thanks for the great stay! We left the key...", 
    time: "Yesterday", 
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150",
    status: "offline"
  },
  { 
    id: 3, 
    guest: "Sarah Lee", 
    lastMessage: "Do you have motorcycle rentals available?", 
    time: "Yesterday", 
    unread: 0,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    status: "online"
  },
];

const MESSAGES = [
  { id: 1, sender: "guest", text: "Hi, I have a reservation for next week.", time: "10:00 AM" },
  { id: 2, sender: "admin", text: "Hello Maria! Yes, we see your booking for the Private Queen Room. How can we help you?", time: "10:05 AM" },
  { id: 3, sender: "guest", text: "Is it possible to check in early at 12 PM? Our ferry arrives around 11:30.", time: "10:30 AM" },
];

export function MessagesPage() {
  const [activeChat, setActiveChat] = useState(CONVERSATIONS[0]);
  const [messages, setMessages] = useState(MESSAGES);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    setMessages([...messages, {
      id: messages.length + 1,
      sender: "admin",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setNewMessage("");
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex">
      {/* Sidebar List */}
      <div className="w-80 border-r border-gray-100 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {CONVERSATIONS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              className={`p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors ${activeChat.id === chat.id ? 'bg-yellow-50/50 border-r-4 border-yellow-400' : ''}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.guest} className="w-10 h-10 rounded-full object-cover" />
                {chat.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold truncate ${activeChat.id === chat.id ? 'text-gray-900' : 'text-gray-700'}`}>
                    {chat.guest}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.unread > 0 ? 'font-bold text-black' : 'text-gray-500'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unread > 0 && (
                <div className="bg-yellow-400 text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {chat.unread}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-3">
            <img src={activeChat.avatar} alt={activeChat.guest} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className="font-bold text-gray-900">{activeChat.guest}</h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${activeChat.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-xs text-gray-500 capitalize">{activeChat.status}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.sender === 'admin' 
                    ? 'bg-black text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-gray-400' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
            />
            <button 
              type="submit" 
              disabled={!newMessage.trim()}
              className="bg-yellow-400 text-black p-3 rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import TopBar from "@/components/layout/TopBar";
import {
  Search,
  MessageCircle,
  MoreVertical,
  Send,
  Flag,
  UserX,
  ChevronLeft,
  X,
  ShieldAlert,
  CheckCircle,
  Instagram,
  ChevronRight,
  Trash2, // ✅ Added Trash Icon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API_BASE_URL, WS_ORIGIN } from "@/lib/config";

/* ---------------- TYPES ---------------- */

interface ChatUser {
  chat_id: number;
  match_id?: string;
  status?: string;
  created_at?: string;
  email: string;
  first_name: string | null;
  profile_photo: string | null;
  last_message?: string;
  unread_count?: number;
  is_blocked?: boolean; 
  user_email?: string; // ✅ Added to fix TS Error
  // Mock fields for profile view
  age?: number;
  instagram_id?: string;
  bio?: string;
  location?: string;
  job?: string;
  interests?: string[];
}

interface Message {
  id: number | string;
  sender: string;
  receiver: string;
  content: string;
  created_at?: string;
  is_read?: boolean;
  read_at?: string | null;
  status?: "sending" | "sent" | "error"; 
}

interface ChatsPageProps {
  onLogout?: () => void;
}

// ---------------- CONSTANTS ----------------

const REPORT_REASONS = [
  { id: 'inappropriate', label: 'Nudity or sexual activity' },
  { id: 'harassment', label: 'Hate speech or symbols' },
  { id: 'spam', label: 'Scam or fraud' },
  { id: 'harassment', label: 'Bullying or harassment' },
  { id: 'fake', label: 'Pretending to be someone else' },
  { id: 'other', label: 'Sale of illegal or regulated goods' },
  { id: 'inappropriate', label: 'Violence or dangerous organizations' },
  { id: 'other', label: 'The problem isn\'t listed here' },
];

// ---------------- HELPERS ----------------

const formatTime = (iso?: string) => {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateLabel = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ✅ ULTRA DENSE DOODLE BACKGROUND (x15 Density)
const DenseDoodleBackground = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8fbfb]">
    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ultra-dense-doodles" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#0d9488" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12">
            <path d="M10 10 L 15 20 L 5 20 Z" />
            <circle cx="25" cy="10" r="3" />
            <path d="M5 30 Q 10 25, 15 30 T 25 30" />
            <path d="M35 15 l 5 5 l -5 5 l -5 -5 Z" />
            <path d="M50 10 c -2 -2 -6 -2 -8 0 c -2 2 -2 6 0 8 l 8 8 l 8 -8 c 2 -2 2 -6 0 -8 c -2 -2 -6 -2 -8 0" transform="scale(0.5) translate(100, 20)" />
            <path d="M60 25 h 10 a 3 3 0 0 1 0 6 h -10 a 3 3 0 0 1 0 -6" />
            <path d="M75 10 v 10 m -5 -5 h 10" />
            <path d="M10 50 h 10 v 8 h -10 Z M 12 50 v -2 h 2 v 2" />
            <path d="M30 55 l 5 5 m 0 -5 l -5 5" />
            <path d="M5 65 c 3 0 3 -6 0 -6 c -3 0 -3 6 0 6 m 6 0 c 3 0 3 -6 0 -6 c -3 0 -3 6 0 6" />
            <path d="M50 50 v 8 h 4 v 4 h 2 v -4 h 4 v -2 h -4 v -6 Z" />
            <path d="M70 50 l 5 -8 l 5 8" />
            <path d="M60 70 h 8 v 6 h -8 Z" />
            <path d="M45 70 q 3 -6 6 0" />
            <circle cx="40" cy="40" r="1" fill="#0d9488" stroke="none" opacity="0.4" />
            <circle cx="10" cy="40" r="0.5" fill="#0d9488" stroke="none" opacity="0.4" />
            <circle cx="70" cy="35" r="1" fill="#0d9488" stroke="none" opacity="0.4" />
            <path d="M20 5 L 22 8" strokeWidth="0.5" />
            <path d="M65 65 L 68 62" strokeWidth="0.5" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ultra-dense-doodles)" />
    </svg>
  </div>
);

export default function ChatsPage({ onLogout }: ChatsPageProps) {
  /* ---------------- STATE ---------------- */
   
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [chats, setChats] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Presence & Typing State
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [isOnlineMap, setIsOnlineMap] = useState<Record<string, boolean>>({});
   
  // Modals State
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); 
  const [reportStep, setReportStep] = useState<'reason' | 'details' | 'success'>('reason');
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [reportDescription, setReportDescription] = useState("");

  // ✅ CONTEXT MENU STATE
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    messageId: number | string;
    isSender: boolean;
  } | null>(null);

  // Refs
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserEmail =
    localStorage.getItem("user_email")?.toLowerCase() ?? "";

  const activeChat = chats.find((c) => c.chat_id === selectedChat);

  /* ---------------- AUTO SCROLL FIXED ---------------- */
  const scrollToBottom = () => {
    setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChat]);

  /* ---------------- CONTEXT MENU LOGIC ---------------- */
   
  // Close menu on click anywhere
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleMessageContextMenu = (e: React.MouseEvent, msg: Message) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent bubbling
    setContextMenu({
        x: e.clientX,
        y: e.clientY,
        messageId: msg.id,
        isSender: msg.sender === currentUserEmail,
    });
  };

  const handleDeleteForMe = () => {
    console.log("Delete for me:", contextMenu?.messageId);
    // TODO: Connect Backend
    setContextMenu(null);
  };

  const handleDeleteForEveryone = () => {
    console.log("Delete for everyone:", contextMenu?.messageId);
    // TODO: Connect Backend
    setContextMenu(null);
  };

  /* ---------------- 1. FETCH CHATS ---------------- */
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/chats/matched/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch chats");

        const data = await res.json();
        const chatsArray = Array.isArray(data) ? data : data.chats || [];
        
        const normalizedChats = chatsArray.map((c: any) => ({
          ...c,
          email: c.email.toLowerCase(),
          is_blocked: c.is_blocked || false,
        }));

        setChats(normalizedChats);

        const totalUnread = normalizedChats.reduce(
          (acc: number, chat: ChatUser) => acc + (chat.unread_count || 0),
          0
        );
        if (totalUnread > 0) {
          localStorage.setItem("has_unread_messages", "true");
        } else {
          localStorage.removeItem("has_unread_messages");
        }

        if (normalizedChats.length > 0 && normalizedChats[0].user_email) {
          localStorage.setItem("user_email", normalizedChats[0].user_email);
        }
      } catch (err) {
        console.error("FETCH CHATS ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  /* ---------------- 2. PRESENCE SOCKET ---------------- */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `${WS_ORIGIN}/ws/notifications/?token=${token}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "presence" && data.user_email) {
        setIsOnlineMap((prev) => ({
          ...prev,
          [data.user_email.toLowerCase()]: data.is_online,
        }));
      }
    };

    return () => ws.close();
  }, []);

  /* ---------------- 3. LOAD MESSAGE HISTORY ---------------- */
  useEffect(() => {
    if (!selectedChat) return;

    const loadMessages = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        const res = await fetch(
          `${API_BASE_URL}/chats/${selectedChat}/messages/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error("Failed to load messages");
        const data: Record<string, Message[]> = await res.json();

        const flatMessages: Message[] = Object.entries(data).flatMap(
          ([date, msgs]: [string, any[]]) =>
            msgs.map((m) => ({
              ...m,
              created_at: m.created_at || `${date}T00:00:00Z`,
            }))
        );

        setMessages(flatMessages);

        if (flatMessages.length > 0) {
          const lastMsg = flatMessages[flatMessages.length - 1].content;
          setChats((prev) =>
            prev.map((c) =>
              c.chat_id === selectedChat
                ? { ...c, last_message: lastMsg, unread_count: 0 }
                : c
            )
          );
        } else {
          setChats((prev) =>
            prev.map((c) =>
              c.chat_id === selectedChat ? { ...c, unread_count: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error("LOAD MESSAGES ERROR:", err);
      }
    };

    loadMessages();
    setTypingUser("");
    setIsMenuOpen(false);
  }, [selectedChat]);

  /* ---------------- 4. CHAT WEBSOCKET ---------------- */
  useEffect(() => {
    if (!selectedChat) return;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `${WS_ORIGIN}/ws/chat/${selectedChat}/?token=${token}`
    );
    socketRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "typing") {
        if (data.is_typing) {
          setTypingUser(data.user_email);
        } else {
          setTypingUser(null);
        }
        return;
      }


      const incomingMessage: Message = {
        id: data.id ?? crypto.randomUUID(),
        sender: data.sender,
        receiver: data.receiver,
        content: data.content,
        created_at: data.created_at ?? new Date().toISOString(),
      };

      setMessages((prev) => {
        // Prevent hard duplicates by ID
        const exists = prev.some((m) => m.id === incomingMessage.id);
        if (exists) return prev;

        // Dedup Optimistic Messages
        if (incomingMessage.sender === currentUserEmail) {
            const tempMessage = prev.find(m => 
                m.content === incomingMessage.content && 
                m.id.toString().startsWith('temp-')
            );
            if (tempMessage) {
                return prev.map(m => m.id === tempMessage.id ? incomingMessage : m);
            }
        }

        return [...prev, incomingMessage];
      });

      const markRead = async () => {
        await fetch(`${API_BASE_URL}/chats/${selectedChat}/read/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      };
      markRead();

      setChats((prev) =>
        prev.map((c) =>
          c.chat_id === selectedChat
            ? { ...c, last_message: incomingMessage.content, unread_count: 0 }
            : c
        )
      );
    };

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, [selectedChat]);

  /* ---------------- 5. ACTIONS: SEND, BLOCK, REPORT ---------------- */
  const sendTypingEvent = (isTyping: boolean) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !activeChat || activeChat.is_blocked) return;

    const content = messageInput;
    setMessageInput("");
    sendTypingEvent(false);

    // 🔑 unique client id for optimistic replacement
    const clientId = `temp-${Date.now()}`;

    // 1️⃣ OPTIMISTIC UI UPDATE
    const optimisticMessage: Message = {
      id: clientId,
      sender: currentUserEmail,
      receiver: activeChat.email,
      content,
      created_at: new Date().toISOString(),
      is_read: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    setChats((prev) =>
      prev.map((c) =>
        c.chat_id === activeChat.chat_id
          ? { ...c, last_message: content, unread_count: 0 }
          : c
      )
    );

    // 2️⃣ SEND MESSAGE VIA WEBSOCKET
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "message",
          content,
          client_id: clientId,
        })
      );
    }
  };


  /* ---- BLOCK LOGIC ---- */
  const handleBlockClick = () => {
    setIsMenuOpen(false);
    setShowBlockModal(true);
  };

  const confirmBlock = async () => {
    if (!activeChat) return;
    const token = localStorage.getItem("access_token");

    // Optimistic UI
    setChats(prev =>
      prev.map(c =>
        c.chat_id === activeChat.chat_id
          ? { ...c, is_blocked: true }
          : c
      )
    );

    setShowBlockModal(false);

    try {
      await fetch(`${API_BASE_URL}/users/block/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: activeChat.email,
        }),
      });
    } catch (err) {
      console.error("Block API Error", err);
    }
  };

  const confirmUnblock = async () => {
    if (!activeChat) return;
    const token = localStorage.getItem("access_token");

    // Optimistic UI
    setChats(prev =>
      prev.map(c =>
        c.chat_id === activeChat.chat_id
          ? { ...c, is_blocked: false }
          : c
      )
    );

    try {
      await fetch(`${API_BASE_URL}/users/unblock/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: activeChat.email,
        }),
      });
    } catch (err) {
      console.error("Unblock API Error", err);
    }
  };


  /* ---- REPORT LOGIC ---- */
  const handleReportClick = () => {
    setIsMenuOpen(false);
    setReportStep('reason');
    setReportDescription("");
    setSelectedReason("");
    setShowReportModal(true);
  };
const submitReport = async () => {
  if (!activeChat) return;
  const token = localStorage.getItem("access_token");

  const reportPayload = {
    chat_id: activeChat.chat_id, // ✅ FIXED
    reason: selectedReason,
    description: reportDescription || `Reported for: ${selectedReason}`,
  };

  console.log("Report payload:", reportPayload);

  try {
    const res = await fetch(`${API_BASE_URL}/reports/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reportPayload),
    });

    if (res.ok) {
      setReportStep("success");
    } else {
      const err = await res.json();
      console.error("Report failed:", err);
      setReportStep('success');
    }
  } catch (err) {
    console.error("Report API Error", err);
    setReportStep('success');
  }
};


  /* ---------------- RENDER HELPERS ---------------- */
  const groupedMessages = messages.reduce((acc, msg) => {
    if (!msg.created_at) return acc;
    const dateKey = msg.created_at.split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      
      {/* ✅ FIX: INCREASED Z-INDEX TO 100 FOR TOPBAR */}
      <div className="flex-none bg-white z-[100] relative shadow-sm">
        <TopBar onLogout={onLogout} />
      </div>

      <main className="flex-1 container mx-auto max-w-7xl pt-20 pb-0 md:pb-6 px-0 md:px-4 lg:px-8 overflow-hidden h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 h-full">
          
          {/* LEFT PANEL - CHAT LIST */}
          <div
            className={cn(
              "lg:col-span-4 flex flex-col h-full bg-white md:rounded-[32px] md:shadow-lg md:border border-gray-100 overflow-hidden",
              selectedChat ? "hidden lg:flex" : "flex w-full"
            )}
          >
            {/* Header */}
            <div className="flex flex-col gap-4 px-4 md:px-6 pt-4 md:pt-6 pb-2 flex-none bg-white z-10">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800">Messages</h1>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-teal-500/30 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none text-sm"
                />
              </div>
              
              {/* ✅ REMOVED TABS (Only Connections shown by default) */}
              <div className="pb-1">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2">Recent Chats</p>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1 md:space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
              {chats.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 text-sm">
                  <p>No connections yet.</p>
                </div>
              )}
              
              {chats.map((chat) => {
                  const unread = chat.unread_count || 0;
                  const isUnread = unread > 0 && chat.chat_id !== selectedChat;
                  
                  return (
                    <button
                      key={chat.chat_id}
                      onClick={() => setSelectedChat(Number(chat.chat_id))}
                      className={cn(
                        "w-full flex items-center gap-3 md:gap-4 p-3 rounded-xl md:rounded-2xl transition-all duration-200 group relative overflow-hidden text-left",
                        selectedChat === chat.chat_id 
                          ? "bg-teal-50/60 ring-1 ring-teal-100" 
                          : "hover:bg-gray-50 active:bg-gray-100"
                      )}
                    >
                      {selectedChat === chat.chat_id && (
                          <div className="absolute left-0 top-3 bottom-3 w-1 bg-teal-500 rounded-r-full hidden md:block" />
                      )}

                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all relative",
                        selectedChat === chat.chat_id ? "border-teal-400 shadow-sm" : "border-transparent"
                      )}>
                        {chat.profile_photo ? (
                          <img src={chat.profile_photo} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-base md:text-lg">
                            {(chat.first_name || chat.email)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-start overflow-hidden flex-1 pl-1">
                        <div className="flex justify-between w-full items-center">
                            <span className={cn(
                                "font-bold text-slate-800 truncate text-sm md:text-[15px]",
                                isUnread && "text-slate-900"
                            )}>
                            {chat.first_name || chat.email}
                            </span>
                            {isUnread && (
                                <div className="w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full mr-1 shadow-sm animate-pulse"></div>
                            )}
                        </div>
                        
                        <span className={cn(
                          "text-xs truncate w-full text-left font-medium mt-0.5",
                          selectedChat === chat.chat_id 
                            ? "text-teal-700" 
                            : isUnread 
                                ? "text-blue-600 font-bold"
                                : "text-gray-400"
                        )}>
                          {isUnread 
                            ? `${unread} new message${unread > 1 ? 's' : ''}` 
                            : (chat.last_message || "Tap to chat")
                          }
                        </span>
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* RIGHT PANEL (Chat Window) */}
          <div
            className={cn(
              "lg:col-span-8 flex flex-col bg-white md:rounded-[32px] h-full md:shadow-lg md:border border-gray-100 overflow-hidden relative transition-all duration-300 w-full fixed inset-0 z-50 lg:static lg:w-auto lg:h-auto",
              selectedChat ? "flex" : "hidden lg:flex"
            )}
          >
            {activeChat ? (
              <>
                {/* Chat Header */}
                <div className="h-16 md:h-20 px-4 md:px-6 border-b border-gray-50 flex items-center bg-white/95 backdrop-blur-sm z-20 sticky top-0 justify-between shadow-sm lg:shadow-none">
                  <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSelectedChat(null)} 
                        className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-full active:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* ✅ CLICKABLE HEADER FOR PROFILE MODAL */}
                    <button 
                      onClick={() => setShowProfileModal(true)}
                      className="flex items-center gap-3 hover:bg-gray-50 p-2 -ml-2 rounded-xl transition-colors group"
                    >
                      <div className="w-9 h-9 md:w-11 md:h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm group-hover:border-teal-200 transition-colors">
                        {activeChat.profile_photo ? (
                          <img src={activeChat.profile_photo} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 text-white flex items-center justify-center font-bold text-sm md:text-base">
                            {(activeChat.first_name || activeChat.email)[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-start">
                          <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight group-hover:text-teal-700 transition-colors">
                          {activeChat.first_name || activeChat.email}
                          </h3>
                          <span className={cn(
                              "text-[10px] md:text-[11px] font-bold tracking-wide uppercase",
                              typingUser 
                                  ? "text-teal-500 animate-pulse" 
                                  : isOnlineMap[activeChat.email?.toLowerCase()] 
                                      ? "text-teal-600" 
                                      : "text-gray-400"
                          )}>
                              {typingUser === activeChat.email
                                  ? "Typing..."
                                  : isOnlineMap[activeChat.email?.toLowerCase()]
                                      ? "Active Now"
                                      : "Offline"
                              }
                          </span>
                      </div>
                    </button>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isMenuOpen && (
                      <>
                        <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsMenuOpen(false)} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-40 animate-in fade-in zoom-in-95 duration-200">
                          {activeChat.is_blocked ? (
                            <button
                              onClick={confirmUnblock}
                              className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-green-50 hover:text-green-600 flex items-center gap-3"
                            >
                              <ShieldAlert className="w-4 h-4" /> Unblock
                            </button>
                          ) : (
                            <button
                              onClick={handleBlockClick}
                              className="w-full text-left px-5 py-3 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-3"
                            >
                              <UserX className="w-4 h-4" /> Block
                            </button>
                          )}

                          <div className="h-px bg-gray-100 my-1 mx-4" />
                          <button onClick={handleReportClick} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-3">
                            <Flag className="w-4 h-4" /> Report
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ✅ MESSAGES AREA CONTAINER */}
                <div className="flex-1 relative overflow-hidden bg-slate-50/20">
                    
                   <DenseDoodleBackground />

                   {/* ✅ SCROLLABLE CONTENT */}
                   <div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 z-10">
                        <div className="p-3 md:p-6 space-y-4 md:space-y-6 min-h-full">
                            {Object.entries(groupedMessages).map(([date, msgs]) => (
                                <div key={date} className="space-y-4 md:space-y-6">
                                <div className="flex justify-center sticky top-0 z-20">
                                    <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100">
                                    {formatDateLabel(date)}
                                    </span>
                                </div>
                                {msgs.map((m) => {
                                    const isMe = m.sender === currentUserEmail;
                                    return (
                                    <div
                                        key={m.id}
                                        className={cn(
                                        "max-w-[85%] lg:max-w-[70%] flex flex-col gap-1",
                                        isMe ? "ml-auto items-end" : "items-start"
                                        )}
                                    >
                                        <div
                                        /* ✅ RIGHT CLICK HANDLER */
                                        onContextMenu={(e) => handleMessageContextMenu(e, m)}
                                        className={cn(
                                            "px-4 py-2.5 md:px-5 md:py-3.5 rounded-2xl text-sm md:text-[15px] leading-relaxed shadow-sm break-words relative cursor-pointer",
                                            isMe
                                            ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-br-sm"
                                            : "bg-white text-slate-800 rounded-bl-sm border border-gray-100"
                                        )}
                                        >
                                        {m.content}
                                        </div>
                                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400/80 px-1 uppercase tracking-wide">
                                        {formatTime(m.created_at)}
                                        </span>
                                    </div>
                                    );
                                })}
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                   </div>
                </div>

                {/* Input Area */}
                <div className="p-3 md:p-6 bg-white border-t border-gray-100 safe-area-bottom z-20 relative">
                  {activeChat.is_blocked ? (
                    <div className="flex flex-col items-center justify-center p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-200 text-center">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                            <UserX className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                        </div>
                        <span className="text-sm font-bold text-gray-600">
                            You blocked {activeChat.first_name || activeChat.email}
                        </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-full px-2 py-1.5 border border-gray-200 focus-within:ring-4 focus-within:ring-teal-500/10 focus-within:border-teal-500 transition-all shadow-inner">
                        <input
                        value={messageInput}
                        onChange={(e) => {
                            setMessageInput(e.target.value);
                            sendTypingEvent(true);
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => sendTypingEvent(false), 1500);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                            }
                        }}
                        className="flex-1 bg-transparent px-4 py-2.5 md:px-5 md:py-3 focus:outline-none text-sm text-slate-800 placeholder:text-gray-400 font-medium"
                        placeholder="Type a message..."
                        />
                        <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!messageInput.trim()}
                        className={cn(
                            "p-2.5 md:p-3 rounded-full transition-all duration-200 m-1 flex-shrink-0",
                            messageInput.trim()
                            ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg transform hover:scale-105 active:scale-95"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        )}
                        >
                        <Send className="w-4 h-4 fill-current ml-0.5" />
                        </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
                  <MessageCircle className="w-10 h-10 md:w-14 md:h-14 text-teal-300" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-2">No chat selected</h3>
                <p className="text-gray-400 max-w-xs text-sm leading-relaxed font-medium px-4">
                  Choose a connection from the left to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ✅ RIGHT-CLICK CONTEXT MENU */}
      {contextMenu && (
        <div 
            className="fixed z-[9999] bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ 
                top: Math.min(contextMenu.y, window.innerHeight - 100), 
                left: Math.min(contextMenu.x, window.innerWidth - 200) 
            }}
        >
            <button 
                onClick={handleDeleteForMe}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
                <Trash2 className="w-4 h-4 text-gray-400" />
                Delete for me
            </button>
            
            {/* Show "Delete for everyone" only if current user is the sender */}
            {contextMenu.isSender && (
                 <button 
                    onClick={handleDeleteForEveryone}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                    <Trash2 className="w-4 h-4 text-red-500" />
                    Delete for everyone
                </button>
            )}
        </div>
      )}

      {/* ---------------- MODALS ---------------- */}

      {/* 1. SHORT PROFILE MODAL (New Request) */}
      {showProfileModal && activeChat && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden border border-gray-100 relative">
               {/* Cover Image */}
               <div className="h-32 bg-gradient-to-r from-teal-400 to-teal-600 relative">
                  <button 
                    onClick={() => setShowProfileModal(false)}
                    className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Profile Info */}
               <div className="px-6 pb-8 -mt-12 text-center relative z-10"> {/* ✅ Added relative z-10 to fix layering issue */}
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden mx-auto bg-white">
                    {activeChat.profile_photo ? (
                      <img src={activeChat.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-3xl">
                        {(activeChat.first_name || "U")[0]}
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mt-3">
                    {activeChat.first_name || activeChat.email}
                    {activeChat.age && <span className="font-normal text-slate-500">, {activeChat.age}</span>}
                  </h2>
                  <p className="text-sm text-teal-600 font-medium mb-4">Based on Vibes</p>

                  {/* INSTAGRAM ID SECTION (Requested) */}
                  <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl p-3 mb-6 border border-pink-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                           <Instagram className="w-5 h-5 text-pink-500" />
                        </div>
                        <div className="text-left">
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Instagram</p>
                           <p className="text-sm font-bold text-slate-800">
                             {activeChat.instagram_id || "@not_shared"}
                           </p>
                        </div>
                      </div>
                      {!activeChat.instagram_id && (
                        <span className="text-xs text-gray-400 italic">Hidden</span>
                      )}
                  </div>

                  {/* About Section (Mock) */}
                  <div className="text-left space-y-3">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">About</h4>
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{activeChat.bio || "The world doesnt make any sense to me, Why should I say things that do?"}"
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                         {(activeChat.interests || ["Comedy", "Mountains", "Action"]).map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase">
                               {tag}
                            </span>
                         ))}
                      </div>
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* 2. BLOCK MODAL */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-2xl max-w-sm w-full p-6 md:p-8 text-center border border-gray-100">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-sm">
                    <UserX className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">Block this contact?</h3>
                <p className="text-xs md:text-sm text-gray-500 mb-6 px-2">
                    They won't be able to message you or see your profile.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={confirmBlock}
                        className="w-full py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 active:scale-[0.98]"
                    >
                        Block Contact
                    </button>
                    <button 
                        onClick={() => setShowBlockModal(false)}
                        className="w-full py-3.5 rounded-2xl font-bold text-slate-600 bg-gray-100 hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 3. REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[24px] md:rounded-[32px] shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[85vh] border border-gray-100">
                <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        {reportStep === 'details' && (
                            <button onClick={() => setReportStep('reason')} className="p-1 -ml-2 rounded-full hover:bg-gray-100 mr-1">
                                <ChevronLeft className="w-6 h-6 text-slate-800" />
                            </button>
                        )}
                        <h3 className="text-lg font-bold text-slate-900">Report</h3>
                    </div>
                    <button onClick={() => setShowReportModal(false)} className="p-2 rounded-full hover:bg-gray-100 bg-gray-50">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-white">
                    {reportStep === 'reason' && (
                        <div className="p-2">
                            <div className="p-4 pb-2">
                                <h4 className="font-bold text-slate-800 text-base md:text-lg">Select a problem</h4>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">Help us understand what's happening.</p>
                            </div>
                            <div className="space-y-1 mt-2">
                                {REPORT_REASONS.map((r, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setSelectedReason(r.id);
                                            setReportStep('details');
                                        }}
                                        className="w-full text-left px-4 py-3.5 md:px-5 md:py-4 hover:bg-slate-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <span className="font-medium text-sm md:text-base text-slate-700 group-hover:text-teal-700">{r.label}</span>
                                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-300 group-hover:text-teal-500" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {reportStep === 'details' && (
                        <div className="p-4 md:p-6">
                            <h4 className="font-bold text-slate-800 mb-2 text-sm md:text-base">Add details (Optional)</h4>
                            <textarea 
                                className="w-full p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none min-h-[120px] text-sm mb-4 md:mb-6 resize-none"
                                placeholder="Describe what happened..."
                                value={reportDescription}
                                onChange={(e) => setReportDescription(e.target.value)}
                            />
                            <button 
                                onClick={submitReport}
                                className="w-full py-3.5 bg-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-[0.98]"
                            >
                                Submit Report
                            </button>
                        </div>
                    )}

                    {reportStep === 'success' && (
                        <div className="flex flex-col items-center justify-center p-8 md:p-10 text-center h-full">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 md:mb-6 animate-in zoom-in duration-300">
                                <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-500" />
                            </div>
                            <h4 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-2">Thanks for letting us know</h4>
                            <p className="text-xs md:text-sm text-gray-500 mb-6 md:mb-8 max-w-[260px] leading-relaxed">
                                Your report has been securely submitted.
                            </p>
                            <button 
                                onClick={() => setShowReportModal(false)}
                                className="w-full py-3.5 bg-slate-100 text-slate-800 font-bold rounded-2xl hover:bg-slate-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
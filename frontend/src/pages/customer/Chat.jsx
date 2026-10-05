import { useEffect, useRef, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  ArrowLeft,
  Send,
  MessageCircle,
  ShieldCheck,
  AlertCircle,
  MessageSquare,
  Wrench,
} from "lucide-react";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

const CustomerChat = () => {
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();

  const routeId = params.bookingId || params.providerId;
  const queryProviderId =
    new URLSearchParams(location.search).get("providerId") ||
    new URLSearchParams(location.search).get("receiverId");

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [booking, setBooking] = useState(null);
  const [providerInfo, setProviderInfo] = useState(null);
  const [receiverId, setReceiverId] = useState(queryProviderId || null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // =====================================================
  // RESOLVE RECEIVER & BOOKING CONTEXT
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const resolveChatDetails = async () => {
      try {
        setLoading(true);
        setError("");

        if (queryProviderId) {
          if (isMounted) setReceiverId(queryProviderId);
          return;
        }

        if (!routeId) {
          if (isMounted) {
            setError("No booking or provider specified.");
            setLoading(false);
          }
          return;
        }

        // Check if routeId corresponds to a booking
        try {
          const bookingRes = await api.get(`/bookings/${routeId}`);
          const bookingData =
            bookingRes.data.booking ||
            bookingRes.data.data ||
            bookingRes.data;

          if (isMounted && bookingData) {
            setBooking(bookingData);
            setProviderInfo(bookingData.provider);

            const pUserId =
              bookingData.provider?.user?._id ||
              bookingData.provider?.user ||
              bookingData.provider?._id ||
              bookingData.provider;

            if (pUserId) {
              setReceiverId(pUserId.toString());
              return;
            }
          }
        } catch {
          // If not a booking ID, treat routeId directly as provider user ID
          if (isMounted) {
            setReceiverId(routeId);
          }
        }
      } catch (err) {
        console.error("Resolve chat error:", err);
        if (isMounted) {
          setError("Unable to initialize chat details.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    resolveChatDetails();

    return () => {
      isMounted = false;
    };
  }, [routeId, queryProviderId]);

  // =====================================================
  // CONVERSATION ID
  // =====================================================

  const conversationId =
    user?._id && receiverId
      ? [user._id.toString(), receiverId.toString()].sort().join("_")
      : "";

  // =====================================================
  // SCROLL TO BOTTOM
  // =====================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =====================================================
  // LOAD CHAT & SOCKET CONNECTION
  // =====================================================

  useEffect(() => {
    if (!user?._id || !receiverId || !conversationId) {
      return;
    }

    let socket;

    const initializeChat = async () => {
      try {
        setError("");

        // -----------------------------------------------
        // LOAD EXISTING MESSAGES
        // -----------------------------------------------
        const response = await api.get(`/messages/${conversationId}`);
        setMessages(response.data.messages || []);

        // -----------------------------------------------
        // CONNECT SOCKET
        // -----------------------------------------------
        socket = io(SOCKET_URL, {
          transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        // -----------------------------------------------
        // JOIN CONVERSATION
        // -----------------------------------------------
        socket.on("connect", () => {
          setSocketConnected(true);
          socket.emit("joinConversation", conversationId);
        });

        // -----------------------------------------------
        // RECEIVE MESSAGE
        // -----------------------------------------------
        socket.on("receiveMessage", (newMessage) => {
          setMessages((previousMessages) => {
            const alreadyExists = previousMessages.some(
              (msg) => msg._id === newMessage._id,
            );

            if (alreadyExists) {
              return previousMessages;
            }

            return [...previousMessages, newMessage];
          });
          setSending(false);
        });

        // -----------------------------------------------
        // MESSAGE ERROR
        // -----------------------------------------------
        socket.on("messageError", (data) => {
          setError(data?.message || "Unable to send message.");
          setSending(false);
        });

        socket.on("disconnect", () => {
          setSocketConnected(false);
        });

        socket.on("connect_error", () => {
          setSocketConnected(false);
        });
      } catch (err) {
        console.error("CHAT LOAD ERROR:", err);
        setError(err.response?.data?.message || "Unable to load messages.");
      }
    };

    initializeChat();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [user?._id, receiverId, conversationId]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!socketRef.current || !user?._id || !receiverId || !conversationId) {
      setError("Chat connection is not ready.");
      return;
    }

    setError("");
    setSending(true);

    const messageData = {
      conversationId,
      sender: user._id,
      receiver: receiverId,
      message: trimmedMessage,
    };

    socketRef.current.emit("sendMessage", messageData);

    setMessage("");
    setSending(false);
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Provider display name
  const providerName =
    providerInfo?.user?.name ||
    providerInfo?.name ||
    booking?.provider?.user?.name ||
    booking?.provider?.name ||
    "Service Provider";

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* =================================================
          TOP HEADER BAR
      ================================================= */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/customer/bookings"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bookings</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-slate-300"
              }`}
            />
            <span className="font-semibold text-slate-600">
              {socketConnected ? "Live Connection" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* =================================================
            HEADER INFO
        ================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-600">
              Customer Communication
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Chat with Service Provider
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Discuss your service requirements, timing and appointment details.
            </p>
          </div>
        </div>

        {/* =================================================
            BOOKING / CONVERSATION PILL CARD
        ================================================= */}
        {booking ? (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">
                  {booking.service?.name || "Service Booking"}
                </p>
                <p className="text-slate-500">
                  Appointment for{" "}
                  {booking.bookingDate
                    ? new Date(booking.bookingDate).toLocaleDateString("en-IN")
                    : "Date N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-extrabold text-slate-900 text-sm">
                ₹{booking.amount || booking.totalAmount || 0}
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                {booking.status || "Pending"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Service Conversation
              </span>
              <h2 className="font-bold text-slate-900 text-sm">
                Direct Service Provider Chat
              </h2>
            </div>
          </div>
        )}

        {/* =================================================
            ERROR ALERT
        ================================================= */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* =================================================
            CHAT CARD
        ================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden flex flex-col h-[560px]">
          {/* CHANNEL HEADER */}
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                {providerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {providerName}
                </h3>
                <p className="text-[11px] text-slate-500">Service Provider</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Encrypted Chat</span>
            </div>
          </div>

          {/* MESSAGES SCROLL AREA */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  No Messages Yet
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Say hi to {providerName} and clarify requirements or timing
                  for your upcoming service appointment.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const senderId = msg.sender?._id || msg.sender;
                const isOwnMessage =
                  String(senderId) === String(user?._id) ||
                  String(senderId) === String(user?.id);

                return (
                  <div
                    key={msg._id || index}
                    className={`flex flex-col ${
                      isOwnMessage ? "items-end" : "items-start"
                    }`}
                  >
                    {!isOwnMessage && (
                      <span className="text-[11px] text-slate-600 font-semibold mb-1 ml-1">
                        {msg.sender?.name || providerName}
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isOwnMessage
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    {msg.createdAt && (
                      <span className="text-[10px] text-slate-600 mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* COMPOSER INPUT BAR */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                socketConnected
                  ? "Write a message to your provider..."
                  : "Connecting to chat channel..."
              }
              disabled={sending}
              className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="p-2.5 sm:px-5 sm:py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">
                {sending ? "Sending..." : "Send"}
              </span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CustomerChat;

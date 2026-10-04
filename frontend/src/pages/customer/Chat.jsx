import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";
import {
  ArrowLeft,
  Send,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Wrench,
} from "lucide-react";

const SOCKET_URL = "http://localhost:5000";

const CustomerChat = () => {
  const { user } = useAuth();
  const { bookingId } = useParams();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [provider, setProvider] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = user?._id || user?.id;

  /* Load Chat */
  useEffect(() => {
    if (!bookingId) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    const loadChat = async () => {
      try {
        setError("");
        const response = await api.get(`/messages/booking/${bookingId}`);
        setMessages(response.data.messages || []);
        setBooking(response.data.booking || null);
        setService(response.data.service || null);
        setCustomer(response.data.customer || null);
        setProvider(response.data.provider || null);
      } catch (err) {
        console.error("LOAD CHAT ERROR:", err);
        setError(
          err.response?.data?.message || "Unable to load conversation.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [bookingId]);

  /* Socket connection */
  useEffect(() => {
    if (!bookingId || !currentUserId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("joinConversation", {
        bookingId,
        userId: currentUserId,
      });
    });

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => {
        if (prev.some((item) => item._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    });

    socket.on("messageError", (data) => {
      setError(data?.message || "Unable to send message.");
      setSending(false);
    });

    socket.on("connect_error", () => {
      setSocketConnected(false);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [bookingId, currentUserId]);

  /* Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!socketRef.current || !socketConnected) {
      setError("Chat server is reconnecting. Please wait a moment.");
      return;
    }

    setSending(true);
    setError("");

    socketRef.current.emit(
      "sendMessage",
      {
        bookingId,
        senderId: currentUserId,
        message: trimmed,
      },
      (res) => {
        if (!res?.success) {
          setError(res?.message || "Unable to send message.");
        }
        setSending(false);
      },
    );

    setMessage("");
  };

  if (loading) {
    return <Loading message="Opening secure chat channel..." />;
  }

  const providerName = provider?.user?.name || "Service Provider";

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to={`/customer/bookings/${bookingId}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Booking Tracking</span>
          </Link>

          <div className="flex items-center gap-2 text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                socketConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <span className="font-semibold text-slate-600">
              {socketConnected ? "Live Connection" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* Booking Reference Pill Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{service?.name || "Service Booking"}</p>
              <p className="text-slate-500">
                Scheduled on {booking?.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : "Date N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{booking?.amount || booking?.totalAmount || 0}
            </span>
            <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
              {booking?.status || "Pending"}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Chat Conversation Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden flex flex-col h-[560px]">
          {/* Channel Header */}
          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                {providerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{providerName}</h3>
                <p className="text-[11px] text-slate-500">Service Provider</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct Encrypted Chat</span>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No Messages Yet</h4>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Say hi to {providerName} and clarify requirements or timing for your upcoming service appointment.
                </p>
              </div>
            ) : (
              messages.map((item, index) => {
                const senderId = item.sender?._id || item.sender;
                const isOwn = String(senderId) === String(currentUserId);

                return (
                  <div
                    key={item._id || index}
                    className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}
                  >
                    {!isOwn && (
                      <span className="text-[11px] text-slate-600 font-semibold mb-1 ml-1">
                        {item.sender?.name || providerName}
                      </span>
                    )}
                    <div
                      className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isOwn
                          ? "bg-blue-600 text-white rounded-br-xs"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{item.message}</p>
                    </div>
                    {item.createdAt && (
                      <span className="text-[10px] text-slate-600 mt-1 px-1">
                        {new Date(item.createdAt).toLocaleTimeString([], {
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

          {/* Composer Input Bar */}
          <form
            onSubmit={sendMessage}
            className="p-3 sm:p-4 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                socketConnected
                  ? "Write a message to your provider..."
                  : "Connecting to chat channel..."
              }
              disabled={!socketConnected || sending}
              className="flex-grow px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!socketConnected || sending || !message.trim()}
              className="p-2.5 sm:px-5 sm:py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CustomerChat;

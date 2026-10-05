import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Loading from "../../components/Loading";

import {
  ArrowLeft,
  Send,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  Wrench,
} from "lucide-react";

const SOCKET_URL = "http://localhost:5000";

const ProviderChat = () => {
  const { user } = useAuth();
  const { bookingId } = useParams();

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [customer, setCustomer] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = user?._id || user?.id;

  // =====================================================
  // LOAD BOOKING + CONVERSATION
  // =====================================================

  useEffect(() => {
    if (!bookingId || !currentUserId) {
      setError("Booking ID is missing.");
      setLoading(false);
      return;
    }

    const loadChat = async () => {
      try {
        setLoading(true);
        setError("");

        // -----------------------------------------------
        // GET BOOKING
        // -----------------------------------------------

        const bookingResponse = await api.get(`/bookings/${bookingId}`);

        const bookingData =
          bookingResponse.data.booking ||
          bookingResponse.data.data ||
          bookingResponse.data;

        setBooking(bookingData);

        // -----------------------------------------------
        // SERVICE
        // -----------------------------------------------

        const serviceData = bookingData?.service;

        setService(serviceData);

        // -----------------------------------------------
        // CUSTOMER
        // -----------------------------------------------

        const customerData = bookingData?.customer;

        setCustomer(customerData);

        // -----------------------------------------------
        // CUSTOMER USER ID
        // -----------------------------------------------

        const customerUserId = customerData?.user?._id || customerData?.user;

        if (!customerUserId) {
          throw new Error(
            "Customer user information is not available for this booking.",
          );
        }

        // -----------------------------------------------
        // CREATE CONVERSATION ID
        // -----------------------------------------------

        const conversationId = [
          currentUserId.toString(),
          customerUserId.toString(),
        ]
          .sort()
          .join("_");

        // -----------------------------------------------
        // LOAD EXISTING MESSAGES
        // -----------------------------------------------

        const messageResponse = await api.get(`/messages/${conversationId}`);

        setMessages(messageResponse.data.messages || []);
      } catch (err) {
        console.error("LOAD PROVIDER CHAT ERROR:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load conversation.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [bookingId, currentUserId]);

  // =====================================================
  // SOCKET CONNECTION
  // =====================================================

  useEffect(() => {
    if (!booking || !currentUserId) {
      return;
    }

    const customerUserId =
      booking.customer?.user?._id || booking.customer?.user;

    if (!customerUserId) {
      return;
    }

    const conversationId = [currentUserId.toString(), customerUserId.toString()]
      .sort()
      .join("_");

    // -----------------------------------------------
    // CONNECT SOCKET
    // -----------------------------------------------

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // -----------------------------------------------
    // CONNECTED
    // -----------------------------------------------

    socket.on("connect", () => {
      console.log("Provider chat connected:", socket.id);

      setSocketConnected(true);

      // IMPORTANT:
      // Must match server.js
      socket.emit("joinConversation", conversationId);
    });

    // -----------------------------------------------
    // RECEIVE MESSAGE
    // -----------------------------------------------

    socket.on("receiveMessage", (newMessage) => {
      setMessages((previousMessages) => {
        const alreadyExists = previousMessages.some(
          (item) => item._id === newMessage._id,
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

    // -----------------------------------------------
    // CONNECTION ERROR
    // -----------------------------------------------

    socket.on("connect_error", (err) => {
      console.error("Provider socket error:", err);

      setSocketConnected(false);

      setError("Unable to connect to chat server.");
    });

    // -----------------------------------------------
    // DISCONNECT
    // -----------------------------------------------

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    // -----------------------------------------------
    // CLEANUP
    // -----------------------------------------------

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketConnected(false);
    };
  }, [booking, currentUserId]);

  // =====================================================
  // AUTO SCROLL
  // =====================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // =====================================================
  // SEND MESSAGE
  // =====================================================

  const sendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!socketRef.current || !socketConnected) {
      setError("Chat server is reconnecting. Please wait a moment.");

      return;
    }

    const customerUserId =
      booking?.customer?.user?._id || booking?.customer?.user;

    if (!customerUserId) {
      setError("Customer information is unavailable.");

      return;
    }

    const conversationId = [currentUserId.toString(), customerUserId.toString()]
      .sort()
      .join("_");

    setSending(true);
    setError("");

    // IMPORTANT:
    // These field names MUST match server.js
    const messageData = {
      conversationId,
      sender: currentUserId,
      receiver: customerUserId,
      message: trimmedMessage,
    };

    socketRef.current.emit("sendMessage", messageData);

    setMessage("");

    // The server will emit receiveMessage.
    // sending will be cleared there.
  };

  // =====================================================
  // CUSTOMER NAME
  // =====================================================

  const customerName = customer?.user?.name || customer?.name || "Customer";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <Loading message="Opening provider chat channel..." />;
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* =================================================
          TOP HEADER
      ================================================= */}

      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            to="/provider/bookings"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />

            <span>Back to Provider Bookings</span>
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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* =================================================
            BOOKING INFORMATION
        ================================================= */}

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>

            <div>
              <p className="font-bold text-slate-900 text-sm">
                {service?.name || "Service Booking"}
              </p>

              <p className="text-slate-500">
                Client appointment for{" "}
                {booking?.bookingDate
                  ? new Date(booking.bookingDate).toLocaleDateString("en-IN")
                  : "Date N/A"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{booking?.amount || booking?.totalAmount || 0}
            </span>

            <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {booking?.status || "Pending"}
            </span>
          </div>
        </div>

        {/* =================================================
            ERROR
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
          {/* =================================================
              CHAT HEADER
          ================================================= */}

          <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                {customerName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {customerName}
                </h3>

                <p className="text-[11px] text-slate-500">Customer Client</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />

              <span>Direct Customer Chat</span>
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>

                <h4 className="text-sm font-bold text-slate-800">
                  No Messages Yet
                </h4>

                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Reach out to {customerName} to coordinate arrival time,
                  location instructions, or job details.
                </p>
              </div>
            ) : (
              messages.map((item, index) => {
                const senderId = item.sender?._id || item.sender;

                const isOwn = String(senderId) === String(currentUserId);

                return (
                  <div
                    key={item._id || index}
                    className={`flex flex-col ${
                      isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    {!isOwn && (
                      <span className="text-[11px] text-slate-600 font-semibold mb-1 ml-1">
                        {item.sender?.name || customerName}
                      </span>
                    )}

                    <div
                      className={`max-w-[80%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                        isOwn
                          ? "bg-blue-600 text-white rounded-br-sm"
                          : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{item.message}</p>
                    </div>

                    {item.createdAt && (
                      <span className="text-[10px] text-slate-600 mt-1 px-1">
                        {new Date(item.createdAt).toLocaleTimeString("en-IN", {
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

          {/* =================================================
              MESSAGE COMPOSER
          ================================================= */}

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
                  ? "Write a reply to the customer..."
                  : "Connecting to chat..."
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

export default ProviderChat;

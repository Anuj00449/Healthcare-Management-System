import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./AIAssistant.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const quickActions = [
  "How do I book an appointment?",
  "How does video consultation work?",
  "How can I find the right doctor?",
  "How do I download my prescription?",
  "मुझे अपॉइंटमेंट बुक करनी है",
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi, I’m your healthcare assistant. I can help with booking, doctors, appointments, dashboards, video consultation, and prescriptions.",
    },
  ]);

  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userRole = user?.role || "guest";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, open, loading]);

  const sendMessage = async (textArg) => {
    const text = (textArg ?? input).trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/api/ai/chat`, {
        message: text,
        history: nextMessages.slice(-8),
        userRole,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Assistant is temporarily unavailable. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      <button
        className="ai-fab"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open AI Assistant"
        type="button"
      >
        {open ? <X size={18} /> : <MessageCircle size={18} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="ai-panel"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.22 }}
          >
            <div className="ai-header">
              <div className="ai-header-left">
                <div className="ai-bot-icon">
                  <Sparkles size={14} />
                </div>
                <div>
                  <h3>Health Assistant</h3>
                  <p>English / Hindi / Hinglish</p>
                </div>
              </div>

              <button
                className="ai-close"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>

            <div className="ai-quick-actions">
              {quickActions.map((item) => (
                <button
                  key={item}
                  className="ai-quick-btn"
                  onClick={() => sendMessage(item)}
                  disabled={loading}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="ai-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`ai-message-row ${
                    msg.role === "user" ? "user" : "assistant"
                  }`}
                >
                  <div className="ai-avatar">
                    {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div className={`ai-bubble ${msg.role}`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="ai-message-row assistant">
                  <div className="ai-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="ai-bubble assistant typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form className="ai-input-wrap" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Ask about booking, doctors, dashboard..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useState, useRef } from "react";
import {
  Send,
  Sparkles,
  Users,
  BarChart3,
  CalendarDays,
  Wallet,
  LogIn,
  LogOut,
} from "lucide-react";

import TypingIndicator from "./TypingIndicator";
import MessageList from "./MessageList";

function ChatWindow({
  messages,
  activeChatId,
  loading,
  sendMessage,
  user,
  onOpenAuth,
  onRequireAuth,
  onLogout,
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef(null);

  const suggestions = [
    {
      icon: Users,
      title: "Employee Details",
      description: "Find employee information",
      prompt: "Show me employee details",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      description: "View employee statistics",
      prompt: "Show department-wise employee analytics",
    },
    {
      icon: CalendarDays,
      title: "Attendance",
      description: "Check attendance records",
      prompt: "Show attendance summary",
    },
    {
      icon: Wallet,
      title: "Payroll",
      description: "Explore salary information",
      prompt: "Show payroll summary",
    },
  ];

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();

    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    if (!user) {
      onRequireAuth();
      return;
    }

    setMessage("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    await sendMessage(userMessage);
  };

  // Automatically resize textarea
  const handleInput = (e) => {
    setMessage(e.target.value);

    e.target.style.height = "auto";
    e.target.style.height =
      `${Math.min(e.target.scrollHeight, 128)}px`;
  };

  // Enter to send, Shift + Enter for new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form.requestSubmit();
    }
  };

  const isChatStarted = messages.length > 0;

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white">

      {/* Header */}
      <header className="z-10 flex h-16 w-full shrink-0 items-center justify-between border-b border-gray-100 bg-white/95 px-4 backdrop-blur-xl sm:px-6">

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-800">
            HRMS Assistant
          </h2>

          <p className="truncate text-xs text-gray-500">
            Your intelligent workplace assistant
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right md:block">
                <p className="text-xs font-semibold text-gray-800">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-gray-500">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
                title="Logout"
              >
                <LogOut size={17} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 sm:px-3 sm:text-sm"
            >
              <LogIn size={16} />
              <span>Login / Sign up</span>
            </button>
          )}

          <span className="flex items-center gap-2 rounded-full bg-green-50 px-2 py-2 text-xs text-green-600 sm:px-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            Online
          </span>
        </div>

      </header>

      {/* Main Chat Area */}
      <section className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">

        {!isChatStarted ? (

          /* Welcome Screen */
          <div className="flex min-h-full w-full flex-col items-center justify-center px-4 py-10 sm:px-6">

            <div className="w-full max-w-2xl animate-in text-center fade-in duration-500">

              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-lg shadow-blue-200 transition-all duration-300 hover:scale-110">
                <Sparkles size={30} className="text-white" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                How can I help you

                <span className="mt-2 block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  with HRMS today?
                </span>
              </h1>

              <p className="mt-4 text-sm text-gray-500 md:text-base">
                Ask questions about employees, attendance,
                payroll, leave policies and company analytics.
              </p>

              {/* Suggestion Cards */}
              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">

                {suggestions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.title}
                      onClick={() => setMessage(item.prompt)}
                      className="group rounded-2xl border border-gray-200 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 transition-colors group-hover:bg-blue-100">
                          <Icon
                            size={19}
                            className="text-gray-600 group-hover:text-blue-600"
                          />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800">
                            {item.title}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.description}
                          </p>
                        </div>

                      </div>
                    </button>
                  );
                })}

              </div>
            </div>
          </div>

        ) : (

          /* Conversation Messages */
          <div
            key={activeChatId}
            className="chat-history-enter flex min-h-full w-full min-w-0 flex-col overflow-x-hidden"
          >

            <MessageList messages={messages} />

            {loading && (
              <div className="mx-auto w-full max-w-4xl px-4">
                <TypingIndicator />
              </div>
            )}

          </div>

        )}

      </section>

      {/* Fixed Chat Input */}
      <div className="z-10 w-full shrink-0 border-t border-gray-100 bg-white px-3 pb-3 pt-3 sm:px-5 sm:pb-5">

        <form
          onSubmit={handleSend}
          className="mx-auto w-full max-w-4xl"
        >

          <div className="flex min-w-0 items-end gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg transition-all duration-300 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">

            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your HRMS..."
              rows={1}
              className="max-h-32 min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="shrink-0 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 p-3 text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              title="Send message"
            >
              <Send size={18} />
            </button>

          </div>

          <p className="mt-2 text-center text-xs text-gray-400">
            HRMS AI can make mistakes. Verify important information.
          </p>

        </form>
      </div>

    </div>
  );
}

export default ChatWindow;

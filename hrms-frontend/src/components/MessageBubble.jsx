
import { useState } from "react";
import { Bot, User, Copy, Check } from "lucide-react";
import ResponseRenderer from "./responses/ResponseRenderer";

function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);

  const isUser = message.role === "user";

  // Format message timestamp
  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  // Copy message
  const handleCopy = async () => {
    const text = isUser
      ? message.content
      : message.response?.message || message.content;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div
      className={`flex w-full min-w-0 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 shadow-md">
          <Bot size={19} className="text-white" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={`group min-w-0 max-w-[85%] overflow-hidden break-words sm:max-w-[80%] ${
          isUser
            ? "rounded-2xl rounded-br-sm bg-blue-600 px-4 py-3 text-white"
            : "rounded-2xl rounded-bl-sm border border-gray-100 bg-gray-50 p-4 text-gray-800"
        }`}
      >
        {/* Message Body */}
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-sm leading-7">
            {message.content}
          </p>
        ) : (
          <div className="min-w-0 max-w-full overflow-hidden">
            <ResponseRenderer
              response={
                message.response || {
                  type: "text",
                  message: message.content,
                }
              }
            />
          </div>
        )}

        {/* Message Footer */}
        <div
          className={`mt-3 flex items-center justify-between gap-4 ${
            isUser ? "text-blue-100" : "text-gray-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium">
              {isUser ? "You" : "HRMS AI"}
            </span>

            {formattedTime && (
              <span className="text-[10px]">
                {formattedTime}
              </span>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="rounded p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
            title="Copy message"
          >
            {copied ? (
              <Check size={14} />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200">
          <User size={19} className="text-gray-600" />
        </div>
      )}
    </div>
  );
}

export default MessageBubble;

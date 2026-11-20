
import { Bot } from "lucide-react";

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-in fade-in duration-300">

      {/* AI Avatar */}
      <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-md">
        <Bot size={19} className="text-white" />
      </div>

      {/* Typing Animation */}
      <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-1.5">

        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />

        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />

        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />

      </div>

    </div>
  );
}

export default TypingIndicator;

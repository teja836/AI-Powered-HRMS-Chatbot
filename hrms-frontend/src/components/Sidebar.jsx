
import {
  Plus,
  MessageSquare,
  Bot,
  User,
} from "lucide-react";

function Sidebar({
  conversations,
  activeChatId,
  onNewChat,
  onSelectChat,
  user,
  isAuthenticated,
  onRequireAuth,
}) {
  return (
    <div className="flex h-full w-full flex-col bg-gray-950 p-4 text-white">

      {/* Logo */}
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="rounded-xl bg-blue-600 p-2">
          <Bot size={22} />
        </div>
        <div>
          <h2 className="font-semibold">HRMS AI</h2>
          <p className="text-xs text-gray-400">HR Assistant</p>
        </div>
      </div>

      {/* New Chat */}
      <button
        onClick={onNewChat}
        className="mb-6 flex w-full items-center gap-3 rounded-xl border border-gray-700 px-4 py-3 text-sm hover:bg-gray-800"
      >
        <Plus size={19} />
        New Chat
      </button>

      {/* Recent Chats */}
      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Recent Chats
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto">
        {!isAuthenticated && (
          <button
            onClick={onRequireAuth}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-left text-sm text-gray-300 transition hover:bg-gray-800"
          >
            <MessageSquare size={16} className="shrink-0" />
            <span>Log in to view recent chats</span>
          </button>
        )}

        {isAuthenticated && conversations.map((chat) => (
          <div
            key={chat.id}
            className={`group flex items-center gap-2 rounded-lg px-3 py-3 text-sm transition ${
              activeChatId === chat.id
                ? "bg-gray-800 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <button
              onClick={() => onSelectChat(chat.id)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <MessageSquare size={16} className="shrink-0" />
              <span className="truncate">{chat.title}</span>
            </button>
          </div>
        ))}

        {conversations.length === 0 && (
          <p className="px-3 py-4 text-sm text-gray-500">
            No conversations yet.
          </p>
        )}
      </div>

      {/* User Profile */}
      {isAuthenticated && (
        <div className="mt-4 border-t border-gray-800 pt-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="rounded-full bg-gray-700 p-2">
            <User size={18} />
          </div>
          <div>
            <p className="text-sm font-medium">{user?.full_name || user?.username}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;

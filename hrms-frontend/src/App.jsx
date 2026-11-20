
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";

import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import AuthPage from "./components/AuthPage";
import useChat from "./hooks/useChat";
import { logoutUser } from "./services/authApi";

const API_URL = "http://localhost:5001/api/auth";

function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);
  const [authPrompt, setAuthPrompt] = useState("");

  const isDragging = useRef(false);

  const {
    conversations,
    activeChatId,
    messages,
    loading,
    sendMessage,
    newChat,
    selectChat,
  } = useChat();

  // =================================
  // VERIFY SAVED LOGIN SESSION
  // =================================
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("hrms_token");
      const savedUser = localStorage.getItem("hrms_user");

      if (!token || !savedUser) {
        logoutUser();
        setAuthChecking(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Session expired");
        }

        const parsedUser = JSON.parse(savedUser);

        setUser({
          ...parsedUser,
          role: data.user.role,
        });
      } catch (error) {
        console.error("Session verification failed:", error);
        logoutUser();
        setUser(null);
      } finally {
        setAuthChecking(false);
      }
    };

    verifySession();
  }, []);

  // =================================
  // LOGIN SUCCESS
  // =================================
  const handleLogin = (userData) => {
    setUser(userData);
    setAuthPrompt("");
  };

  // =================================
  // LOGOUT
  // =================================
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setAuthPrompt("");
    setSidebarOpen(true);
  };

  const requestLogin = (prompt) => {
    setAuthPrompt(prompt);
  };

  const closeAuthPrompt = () => {
    setAuthPrompt("");
  };

  // =================================
  // SIDEBAR RESIZE
  // =================================
  const handleDragStart = (e) => {
    if (window.innerWidth < 768) return;

    isDragging.current = true;
    setIsResizing(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handleDrag = (e) => {
    if (!isDragging.current) return;

    const newWidth = Math.min(Math.max(e.clientX, 220), 480);
    setSidebarWidth(newWidth);
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    setIsResizing(false);
  };

  // =================================
  // AUTHENTICATION LOADING
  // =================================
  if (authChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">
            Verifying your session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">

      {/* MOBILE OVERLAY */}
      <div
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          sidebarOpen
            ? "opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      {/* SIDEBAR */}
      <aside
        style={{
          width:
            window.innerWidth >= 768
              ? sidebarOpen
                ? sidebarWidth
                : 0
              : 288,
        }}
        className={`
          fixed inset-y-0 left-0 z-50
          h-full shrink-0 overflow-hidden
          transform transition-[width,transform] duration-300 ease-in-out
          md:relative md:translate-x-0
          ${isResizing ? "md:transition-none" : ""}
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        <Sidebar
          conversations={conversations}
          activeChatId={activeChatId}
          onNewChat={newChat}
          user={user}
          isAuthenticated={Boolean(user)}
          onRequireAuth={() =>
            requestLogin("Please log in to access your recent chats.")
          }
          onSelectChat={(chatId) => {
            if (!user) {
              requestLogin("Please log in to view your recent chats.");
              return;
            }

            selectChat(chatId);
          }}
        />

        {/* CLOSE SIDEBAR */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-4 z-50 rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          title="Close sidebar"
        >
          <X size={20} />
        </button>

        {/* RESIZE HANDLE */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDrag}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="absolute -right-1 top-0 z-50 hidden h-full w-2 cursor-col-resize touch-none bg-transparent hover:bg-blue-500/50 md:block"
          title="Drag to resize sidebar"
        />
      </aside>

      {/* MAIN CHAT */}
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="absolute left-4 top-4 z-30 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition hover:bg-gray-100"
            title="Open sidebar"
          >
            <Menu size={21} />
          </button>
        )}

        <ChatWindow
          messages={user ? messages : []}
          activeChatId={activeChatId}
          loading={loading}
          sendMessage={sendMessage}
          user={user}
          onOpenAuth={() =>
            requestLogin("Log in or sign up to access your HRMS account.")
          }
          onRequireAuth={() =>
            requestLogin("Please log in to start a new chat.")
          }
          onLogout={handleLogout}
        />
      </main>

      {/* AUTHENTICATION POPUP */}
      {authPrompt && !user && (
        <AuthPage
          prompt={authPrompt}
          onLogin={handleLogin}
          onClose={closeAuthPrompt}
        />
      )}
    </div>
  );
}

export default App;

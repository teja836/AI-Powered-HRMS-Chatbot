
import { useState, useEffect, useCallback } from "react";
import { sendMessageToAI } from "../services/chatApi";

const STORAGE_KEY = "hrms_chat_history";
const ACTIVE_CHAT_KEY = "hrms_active_chat";

function createChat() {
  return {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "New Chat",
    sessionId: `hrms-${Date.now()}`,
    messages: [],
    updatedAt: Date.now(),
  };
}

function useChat() {
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    return localStorage.getItem(ACTIVE_CHAT_KEY);
  });

  const [loading, setLoading] = useState(false);

  const activeChat = conversations.find(
    (chat) => chat.id === activeChatId
  );

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations)
    );
  }, [conversations]);

  // Save active conversation ID
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
    } else {
      localStorage.removeItem(ACTIVE_CHAT_KEY);
    }
  }, [activeChatId]);

  // Restore a valid conversation after refresh
  useEffect(() => {
    if (conversations.length > 0) {
      const chatExists = conversations.some(
        (chat) => chat.id === activeChatId
      );

      if (!chatExists) {
        setActiveChatId(conversations[0].id);
      }
    } else if (activeChatId) {
      setActiveChatId(null);
    }
  }, [conversations, activeChatId]);

  // Create new chat
  const newChat = useCallback(() => {
    const chat = createChat();

    setConversations((prev) => [chat, ...prev]);
    setActiveChatId(chat.id);
  }, []);

  // Open previous chat
  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId);
  }, []);

  // Send message
  const sendMessage = useCallback(async (userQuery) => {
    if (!userQuery.trim() || loading) return;

    let chatId = activeChatId;
    let chat = conversations.find(
      (item) => item.id === chatId
    );

    // Create chat if none is selected
    if (!chat) {
      chat = createChat();
      chatId = chat.id;
      setActiveChatId(chatId);
    }

    // User message with sent time
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userQuery.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [
      ...(chat.messages || []),
      userMessage,
    ];

    setConversations((prev) => {
      const exists = prev.some(
        (item) => item.id === chatId
      );

      const updatedChat = {
        ...chat,
        title:
          chat.messages.length === 0
            ? userQuery.trim().slice(0, 35)
            : chat.title,
        messages: updatedMessages,
        updatedAt: Date.now(),
      };

      return exists
        ? prev.map((item) =>
            item.id === chatId ? updatedChat : item
          )
        : [updatedChat, ...prev];
    });

    setLoading(true);

    try {
      const data = await sendMessageToAI(
        userQuery.trim(),
        chat.sessionId
      );

      // AI response with received time
      const aiMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message || "No response received.",
        response: data,
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((item) =>
          item.id === chatId
            ? {
                ...item,
                messages: [...item.messages, aiMessage],
                updatedAt: Date.now(),
              }
            : item
        )
      );
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Unable to connect to HRMS AI. Please try again.",
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((item) =>
          item.id === chatId
            ? {
                ...item,
                messages: [...item.messages, errorMessage],
                updatedAt: Date.now(),
              }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  }, [activeChatId, conversations, loading]);

  return {
    conversations,
    activeChatId,
    messages: activeChat?.messages || [],
    loading,
    sendMessage,
    newChat,
    selectChat,
  };
}

export default useChat;

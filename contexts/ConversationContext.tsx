import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  createNewConversation: () => void;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  clearCurrentConversation: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};

interface ConversationProviderProps {
  children: ReactNode;
}

export const ConversationProvider: React.FC<ConversationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  const getStorageKey = () => `forgeai_conversations_${user?.id || 'guest'}`;

  useEffect(() => {
    if (!user) {
      setConversations([]);
      setCurrentConversation(null);
      return;
    }

    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
      const parsed = JSON.parse(stored);
      setConversations(parsed);
      if (parsed.length > 0) {
        setCurrentConversation(parsed[0]);
      } else {
        createNewConversation();
      }
    } else {
      createNewConversation();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user && conversations.length > 0) {
      localStorage.setItem(getStorageKey(), JSON.stringify(conversations));
    }
  }, [conversations, user]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  };

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    if (!currentConversation) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
      updatedAt: new Date().toISOString(),
      title: currentConversation.messages.length === 0 && role === 'user' 
        ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
        : currentConversation.title,
    };

    setCurrentConversation(updatedConversation);
    setConversations(prev =>
      prev.map(conv => (conv.id === updatedConversation.id ? updatedConversation : conv))
    );
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (currentConversation?.id === conversationId) {
      const remaining = conversations.filter(c => c.id !== conversationId);
      if (remaining.length > 0) {
        setCurrentConversation(remaining[0]);
      } else {
        createNewConversation();
      }
    }
  };

  const clearCurrentConversation = () => {
    if (!currentConversation) return;

    const clearedConversation = {
      ...currentConversation,
      messages: [],
      title: 'New Conversation',
      updatedAt: new Date().toISOString(),
    };

    setCurrentConversation(clearedConversation);
    setConversations(prev =>
      prev.map(conv => (conv.id === clearedConversation.id ? clearedConversation : conv))
    );
  };

  const value = {
    conversations,
    currentConversation,
    addMessage,
    createNewConversation,
    switchConversation,
    deleteConversation,
    clearCurrentConversation,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

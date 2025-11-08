import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { conversationAPI, Conversation as APIConversation, Message as APIMessage } from '../services/apiService';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  addMessage: (role: 'user' | 'assistant', content: string, conversationId?: string) => Promise<void>;
  createNewConversation: () => Promise<Conversation | null>;
  switchConversation: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearCurrentConversation: () => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  const createNewConversation = async (): Promise<Conversation | null> => {
    try {
      // Always create conversation locally for now
      // TODO: Add proper auth token validation and database persistence
      const newConversation: Conversation = {
        id: `local-${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      return null;
    }
  };

  const addMessage = async (role: 'user' | 'assistant', content: string, conversationId?: string) => {
    const targetConversation = conversationId 
      ? conversations.find(c => c.id === conversationId) || currentConversation
      : currentConversation;
      
    if (!targetConversation) {
      console.error('[ConversationContext] No target conversation found');
      return;
    }

    try {
      console.log('[ConversationContext] Adding message to conversation:', targetConversation.id);
      const newMessage = await conversationAPI.addMessage(targetConversation.id, role, content);
      console.log('[ConversationContext] Message added to database:', newMessage.id);

      const updatedTitle = targetConversation.messages.length === 0 && role === 'user' 
        ? content.slice(0, 50) + (content.length > 50 ? '...' : '')
        : targetConversation.title;

      const updatedConversation = {
        ...targetConversation,
        messages: [...targetConversation.messages, newMessage],
        title: updatedTitle,
      };

      setCurrentConversation(updatedConversation);
      setConversations(prev =>
        prev.map(conv => (conv.id === updatedConversation.id ? updatedConversation : conv))
      );
      console.log('[ConversationContext] State updated, total messages:', updatedConversation.messages.length);
    } catch (error) {
      console.error('[ConversationContext] Failed to add message:', error);
      throw error;
    }
  };

  const switchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      // Always delete locally for now
      // TODO: Add proper auth token validation and database persistence
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        const remaining = conversations.filter(c => c.id !== conversationId);
        if (remaining.length > 0) {
          setCurrentConversation(remaining[0]);
        } else {
          await createNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const clearCurrentConversation = async () => {
    if (!currentConversation) return;

    try {
      // Always clear locally for now
      // TODO: Add proper auth token validation and database persistence
      await createNewConversation();
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  };

  useEffect(() => {
    const loadConversations = async () => {
      // Always create a local conversation first
      const localConversation: Conversation = {
        id: `local-${Date.now()}`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
      };
      setConversations([localConversation]);
      setCurrentConversation(localConversation);
      
      // Only try to load from database if user is authenticated
      // For now, we'll skip database loading entirely to avoid 401 errors
      // TODO: Implement proper auth token validation before making API calls
    };

    loadConversations();
  }, []);

  const value = {
    conversations,
    currentConversation,
    addMessage,
    createNewConversation,
    switchConversation,
    deleteConversation,
    clearCurrentConversation,
    isLoading,
  };

  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
};

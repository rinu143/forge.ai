import React, { useState, useRef, useEffect } from 'react';
import { useConversation, Message } from '../contexts/ConversationContext';
import { chat, ChatMessage as GeminiChatMessage } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Loader } from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';

const ChatView: React.FC = () => {
  const { currentConversation, addMessage, clearCurrentConversation, createNewConversation } = useConversation();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    addMessage('user', userMessage);

    try {
      const history: GeminiChatMessage[] = currentConversation?.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: msg.content
      })) || [];

      const response = await chat(userMessage, history);
      addMessage('assistant', response);
    } catch (error: any) {
      addMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chat with <span className="gemini-gradient-text">Forge AI</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your personal AI co-pilot that remembers your conversations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearCurrentConversation}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
            title="Clear current conversation"
          >
            Clear
          </button>
          <button
            onClick={createNewConversation}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="Start new conversation"
          >
            New Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-6 space-y-6">
        {currentConversation?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <SparklesIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              Ask me anything about your startup, technology stack, market analysis, or get strategic advice. I'll remember our entire conversation!
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3 w-full max-w-2xl">
              {[
                "How can I validate my startup idea?",
                "What's the best tech stack for an MVP?",
                "Help me understand my target market",
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion)}
                  className="text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {currentConversation?.messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose dark:prose-invert max-w-none">
                      <MarkdownRenderer content={message.content} />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-100 dark:bg-white/10">
                  <Loader />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-white/10 pt-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 border-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </form>
    </div>
  );
};

export default ChatView;

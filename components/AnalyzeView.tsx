import React, { useState, useCallback, useRef, useEffect } from 'react';
import { analyzeProblem } from '../services/geminiService';
import { UserDrivenResponse, AnalysisChunk, FounderProfile, Theme } from '../types';
import { useConversation, Message } from '../contexts/ConversationContext';
import { chat, ChatMessage as GeminiChatMessage } from '../services/geminiService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Loader } from './Loader';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { FlaskConicalIcon } from './icons/FlaskConicalIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import FounderProfileForm from './FounderProfileForm';
import AnalysisVisualizer from './AnalysisVisualizer';

interface AnalyzeViewProps {
  setResponse: (response: UserDrivenResponse | null) => void;
  initialProblem?: string | null;
  onProblemProcessed?: () => void;
  profile: FounderProfile;
  setProfile: (profile: FounderProfile) => void;
  theme: Theme;
}

const AnalysisChunkCard: React.FC<{ chunk: AnalysisChunk }> = ({ chunk }) => {
  return (
    <div className="bg-gray-50 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl shadow-lg transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500/50">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-3">
            <FlaskConicalIcon className="w-5 h-5" />
            {chunk.title}
        </h3>
        <div className="mt-4">
          <MarkdownRenderer content={chunk.analysis} />
        </div>
        <div className="mt-6 border-t border-gray-200 dark:border-white/10 pt-4">
          <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3"><LightbulbIcon className="w-5 h-5 text-black dark:text-white" /> Key Insights</h4>
          <ul className="mt-3 list-none space-y-2">
            {chunk.key_insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-black dark:text-white mr-2">▪</span>
                <div className="flex-1">
                  <MarkdownRenderer content={insight} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const AnalyzeView: React.FC<AnalyzeViewProps> = ({ setResponse, initialProblem, onProblemProcessed, profile, setProfile, theme }) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'chat' | 'history'>('analyze');
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<UserDrivenResponse | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'visualizer'>('cards');

  const { currentConversation, conversations, addMessage, clearCurrentConversation, createNewConversation, switchConversation } = useConversation();
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const processedSignatureRef = useRef<string | null>(null);

  const seedChatWithAnalysis = useCallback(async (problem: string, analysis: UserDrivenResponse) => {
    await createNewConversation();
    
    await addMessage('user', problem);
    
    const analysisText = `# Analysis Complete\n\n## Problem Statement\n${problem}\n\n## Analysis Results\n\n${analysis.chunks.map(chunk => 
      `### ${chunk.title}\n${chunk.analysis}\n\n**Key Insights:**\n${chunk.key_insights.map(insight => `- ${insight}`).join('\n')}`
    ).join('\n\n')}`;
    
    await addMessage('assistant', analysisText);
    
    setActiveTab('chat');
  }, [createNewConversation, addMessage]);

  React.useEffect(() => {
    if (initialProblem) {
      const currentSignature = JSON.stringify({ problem: initialProblem, profile });
      
      if (processedSignatureRef.current !== currentSignature) {
        processedSignatureRef.current = currentSignature;
        setUserInput(initialProblem);
        setActiveTab('analyze');
        const autoAnalyze = async () => {
          setIsLoading(true);
          setError(null);
          setCurrentResponse(null);
          setResponse(null);

          try {
            const result = await analyzeProblem(initialProblem, profile);
            setCurrentResponse(result);
            setResponse(result);
            if (onProblemProcessed) {
              onProblemProcessed();
            }
            await seedChatWithAnalysis(initialProblem, result);
          } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
          } finally {
            setIsLoading(false);
          }
        };
        autoAnalyze();
      }
    }
  }, [initialProblem, profile, setResponse, onProblemProcessed, seedChatWithAnalysis]);

  const handleAnalyzeSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentResponse(null);
    setResponse(null);

    try {
      const result = await analyzeProblem(userInput, profile);
      setCurrentResponse(result);
      setResponse(result);
      await seedChatWithAnalysis(userInput, result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, profile, setResponse, seedChatWithAnalysis]);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    try {
      await addMessage('user', userMessage);

      const history: GeminiChatMessage[] = [
        ...(currentConversation?.messages.map(msg => ({
          role: msg.role === 'user' ? ('user' as const) : ('model' as const),
          parts: msg.content
        })) || []),
        { role: 'user' as const, parts: userMessage }
      ];

      const response = await chat(userMessage, history);
      await addMessage('assistant', response);
    } catch (error: any) {
      await addMessage('assistant', `Sorry, I encountered an error: ${error.message}`);
    } finally {
      setIsChatLoading(false);
      chatInputRef.current?.focus();
    }
  };

  const handleChatKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e);
    }
  };

  const handleConversationClick = (conversationId: string) => {
    switchConversation(conversationId);
    setActiveTab('chat');
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <span className="gemini-gradient-text">Forge AI</span> Analysis
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Analyze problems, chat with AI, and explore conversation history
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'analyze'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Analyze
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'chat'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-all duration-200 border-b-2 ${
            activeTab === 'history'
              ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          History
        </button>
      </div>

      {activeTab === 'analyze' ? (
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black dark:text-white px-4">Problem Analysis Engine</h2>
          <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto px-4">Get a deep, structured analysis tailored to your specific founder profile and constraints.</p>
          
          <div className="mt-6 sm:mt-8 lg:mt-10 max-w-4xl mx-auto">
            <FounderProfileForm profile={profile} setProfile={setProfile} disabled={isLoading} />
          </div>

          <form onSubmit={handleAnalyzeSubmit} className="mt-6 sm:mt-8 max-w-4xl mx-auto">
            <div className="gemini-glow-input border border-gray-300 dark:border-gray-500/30 rounded-lg p-0.5 transition-all duration-300">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter a problem to analyze, e.g., Predict crop failure for small Indian farmers..."
                className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-md text-sm sm:text-base text-black dark:text-white placeholder-gray-500 focus:outline-none transition-all duration-300 resize-none"
                disabled={isLoading}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 sm:mt-6 w-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-base sm:text-lg gemini-glow-button"
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? <><Loader /> <span className="ml-2">Thinking...</span></> : <><SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>Forge Personalized Analysis</>}
            </button>
          </form>

          {error && <div className="mt-8 text-center text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-800/50 p-4 rounded-lg max-w-3xl mx-auto border border-gray-400 dark:border-gray-600">{error}</div>}

          {currentResponse && (
            <div className="mt-12 max-w-6xl mx-auto animate-slide-up">
              <div className="bg-gray-50 dark:bg-[#1a1a1a]/80 border border-gray-200 dark:border-white/10 p-4 sm:p-6 rounded-xl mb-8">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase">Original Problem</h3>
                    <p className="text-black dark:text-gray-200 italic mt-1 text-sm sm:text-base">"{currentResponse.input_problem}"</p>
                    <hr className="my-4 border-gray-200 dark:border-white/10" />
                    <h3 className="text-xs sm:text-sm font-semibold text-black dark:text-white tracking-wider uppercase">Refined & Personalized Problem</h3>
                    <p className="text-black dark:text-white font-medium text-base sm:text-lg lg:text-xl mt-1">{currentResponse.refined_problem}</p>
                  </div>
                  <div className="flex gap-2 lg:ml-4 shrink-0">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        viewMode === 'cards'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Cards
                    </button>
                    <button
                      onClick={() => setViewMode('visualizer')}
                      className={`flex-1 lg:flex-none px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                        viewMode === 'visualizer'
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      Visualizer
                    </button>
                  </div>
                </div>
              </div>
              
              {viewMode === 'visualizer' ? (
                <div className="mb-8">
                  <AnalysisVisualizer response={currentResponse} theme={theme} />
                </div>
              ) : (
                <div className="space-y-6">
                  {currentResponse.chunks.map((chunk) => (
                    <AnalysisChunkCard key={chunk.id} chunk={chunk} />
                  ))}
                </div>
              )}

              <div className="mt-8 bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-500/30 rounded-xl p-6">
                 <h3 className="text-xl font-semibold text-black dark:text-white">Solution Guide: Personalized MVP Steps</h3>
                 <ol className="mt-4 list-decimal list-inside space-y-3">
                    {currentResponse.synthesis.solution_guide.map((step, index) => (
                        <li key={index} className="ml-2">
                          <MarkdownRenderer content={step} className="inline" />
                        </li>
                    ))}
                 </ol>
              </div>
            </div>
          )}
        </div>
      ) : activeTab === 'chat' ? (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-end mb-4 gap-2">
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

          <div className="flex-1 overflow-y-auto mb-6 space-y-6 min-h-0">
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
                      onClick={() => setChatInput(suggestion)}
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
                {isChatLoading && (
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

          <form onSubmit={handleChatSubmit} className="border-t border-gray-200 dark:border-white/10 pt-4">
            <div className="flex gap-2">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder="Ask a question or discuss your startup... (Shift+Enter for new line)"
                rows={1}
                className="flex-1 resize-none px-4 py-3 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-600 border-none"
                disabled={isChatLoading}
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
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
      ) : (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Conversation History</h3>
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No conversations yet. Start chatting to create your first conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleConversationClick(conv.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    currentConversation?.id === conv.id
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {conv.messages[0]?.content.substring(0, 60) || 'New Conversation'}
                        {conv.messages[0]?.content.length > 60 ? '...' : ''}
                      </p>
                      <p className={`text-xs mt-1 ${
                        currentConversation?.id === conv.id
                          ? 'text-white/70 dark:text-black/70'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''} • {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {currentConversation?.id === conv.id && (
                      <span className="text-xs px-2 py-1 rounded bg-white/20 dark:bg-black/20">Active</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalyzeView;

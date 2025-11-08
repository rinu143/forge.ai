import React, { useState, useCallback } from 'react';
import { analyzeProblem } from '../services/geminiService';
import { UserDrivenResponse, AnalysisChunk, FounderProfile, Theme } from '../types';
import { Loader } from './Loader';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { FlaskConicalIcon } from './icons/FlaskConicalIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import FounderProfileForm from './FounderProfileForm';
import { MarkdownRenderer } from './MarkdownRenderer';
import AnalysisVisualizer from './AnalysisVisualizer';

interface AnalyzeViewProps {
  setResponse: (response: UserDrivenResponse | null) => void;
  initialProblem?: string | null;
  onProblemProcessed?: () => void;
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

const AnalyzeView: React.FC<AnalyzeViewProps> = ({ setResponse, initialProblem, onProblemProcessed, theme }) => {
  const [userInput, setUserInput] = useState('');
  const [founderProfile, setFounderProfile] = useState<FounderProfile>({
    experience_years: 0,
    team_size: 0,
    runway_months: 0,
    tech_stack: [],
    location: '',
    funding_stage: 'pre-seed'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<UserDrivenResponse | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'visualizer'>('cards');

  // Auto-submit when initialProblem is provided
  React.useEffect(() => {
    if (initialProblem) {
      setUserInput(initialProblem);
      // Trigger analysis automatically
      const autoAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setCurrentResponse(null);
        setResponse(null);

        try {
          const result = await analyzeProblem(initialProblem, founderProfile);
          setCurrentResponse(result);
          setResponse(result);
          if (onProblemProcessed) {
            onProblemProcessed();
          }
        } catch (err: any) {
          setError(err.message || 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      autoAnalyze();
    }
  }, [initialProblem, founderProfile, setResponse, onProblemProcessed]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentResponse(null);
    setResponse(null);

    try {
      const result = await analyzeProblem(userInput, founderProfile);
      setCurrentResponse(result);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, founderProfile, setResponse]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black dark:text-white px-4">Problem Analysis Engine</h2>
      <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto px-4">Get a deep, structured analysis tailored to your specific founder profile and constraints.</p>
      
      <div className="mt-6 sm:mt-8 lg:mt-10 max-w-4xl mx-auto">
        <FounderProfileForm profile={founderProfile} setProfile={setFounderProfile} disabled={isLoading} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 max-w-4xl mx-auto">
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
  );
};

export default AnalyzeView;
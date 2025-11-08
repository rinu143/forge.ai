import React, { useState, useCallback } from 'react';
import { discoverOpportunities } from '../services/geminiService';
import { ProactiveDiscoveryResponse, Problem, FounderProfile } from '../types';
import { Loader } from './Loader';
import { SearchIcon } from './icons/SearchIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import FounderProfileForm from './FounderProfileForm';
import { MarkdownRenderer } from './MarkdownRenderer';

interface DiscoverViewProps {
  setResponse: (response: ProactiveDiscoveryResponse | null) => void;
  onProblemSelect: (problemStatement: string) => void;
}

const OpportunityCard: React.FC<{ problem: Problem; onClick: () => void }> = ({ problem, onClick }) => {
  const timeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    } catch (e) {
      return "a moment ago";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-50 dark:bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-xl p-6 transition-all duration-300 hover:border-gray-400 dark:hover:border-gray-500/50 hover:-translate-y-1 cursor-pointer hover:shadow-lg dark:hover:shadow-gray-900/50"
    >
      <div className="text-lg font-medium">
        <MarkdownRenderer content={problem.problem_statement} />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
        <div className="text-sm flex items-start">
          <SparklesIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-700 dark:text-gray-300" />
          <div className="italic flex-1">
            <MarkdownRenderer content={problem.personalization_note} />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <span className="bg-gray-200/10 dark:bg-gray-700/50 px-2 py-1 rounded-md text-xs">{problem.simulated_source}</span>
        <span>{timeAgo(problem.freshness_timestamp)}</span>
      </div>
    </div>
  );
};


const DiscoverView: React.FC<DiscoverViewProps> = ({ setResponse, onProblemSelect }) => {
  const [userInput, setUserInput] = useState('');
  const [founderProfile, setFounderProfile] = useState<FounderProfile>({
    experience_years: 0,
    team_size: 1,
    runway_months: 1,
    tech_stack: [],
    location: '',
    funding_stage: 'pre-seed'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResponse, setCurrentResponse] = useState<ProactiveDiscoveryResponse | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setCurrentResponse(null);
    setResponse(null);

    try {
      const result = await discoverOpportunities(userInput, founderProfile);
      setCurrentResponse(result);
      setResponse(result);
      // Fix: Corrected syntax for try-catch block.
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [userInput, founderProfile, setResponse]);

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-black dark:text-white px-4">Opportunity Scanner</h2>
      <p className="text-center text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-2 max-w-2xl mx-auto px-4">Discover emerging problems and opportunities tailored to your founder profile.</p>

      <div className="mt-6 sm:mt-8 lg:mt-10 max-w-4xl mx-auto">
        <FounderProfileForm profile={founderProfile} setProfile={setFounderProfile} disabled={isLoading} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 max-w-4xl mx-auto">
        <div className="relative gemini-glow-input border border-gray-300 dark:border-gray-500/30 rounded-lg p-0.5 transition-all duration-300">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter a sector to scan, e.g., agritech, fintech..."
            className="w-full p-4 pl-12 bg-gray-50 dark:bg-[#1a1a1a] rounded-md text-black dark:text-white placeholder-gray-500 focus:outline-none transition-all duration-300"
            disabled={isLoading}
            required
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center text-lg gemini-glow-button"
          disabled={isLoading || !userInput.trim()}
        >
          {isLoading ? <Loader /> : <><SparklesIcon className="w-5 h-5 mr-2" />Scan for Personalized Opportunities</>}
        </button>
      </form>

      {error && <div className="mt-8 text-center text-gray-800 dark:text-gray-300 bg-gray-200 dark:bg-gray-800/50 p-4 rounded-lg max-w-xl mx-auto border border-gray-400 dark:border-gray-600">{error}</div>}

      {currentResponse && (
        <div className="mt-12 max-w-3xl mx-auto animate-slide-up">
          <h3 className="text-2xl font-bold text-center mb-6 text-black dark:text-gray-200">
            Top 5 Opportunities in <span>{currentResponse.sector}</span>
          </h3>
          <div className="space-y-4">
            {currentResponse.problems.map((problem) => (
              <OpportunityCard
                key={problem.id}
                problem={problem}
                onClick={() => onProblemSelect(problem.problem_statement)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverView;
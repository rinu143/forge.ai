import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AnalyzeView from './components/AnalyzeView';
import DiscoverView from './components/DiscoverView';
import ComposerView from './components/ComposerView';
import { ViewMode, Theme, UserDrivenResponse, ProactiveDiscoveryResponse } from './types';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('analyze');
  const [theme, setTheme] = useState<Theme>('dark');
  const [analysisResponse, setAnalysisResponse] = useState<UserDrivenResponse | null>(null);
  const [discoveryResponse, setDiscoveryResponse] = useState<ProactiveDiscoveryResponse | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);

  // Debug: Log when responses change
  useEffect(() => {
    console.log('Analysis Response:', analysisResponse ? 'Available' : 'None');
    console.log('Discovery Response:', discoveryResponse ? 'Available' : 'None');
    console.log('Composer Enabled:', !!analysisResponse);
  }, [analysisResponse, discoveryResponse]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleViewChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  const handleThemeChange = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleProblemSelect = useCallback((problemStatement: string) => {
    setSelectedProblem(problemStatement);
    setViewMode('analyze');
  }, []);

  const renderView = () => {
    switch (viewMode) {
      case 'analyze':
        return <AnalyzeView setResponse={setAnalysisResponse} initialProblem={selectedProblem} onProblemProcessed={() => setSelectedProblem(null)} />;
      case 'discover':
        return <DiscoverView setResponse={setDiscoveryResponse} onProblemSelect={handleProblemSelect} />;
      case 'compose':
        return <ComposerView analysis={analysisResponse} opportunities={discoveryResponse?.problems || []} />;
      default:
        return <AnalyzeView setResponse={setAnalysisResponse} initialProblem={selectedProblem} onProblemProcessed={() => setSelectedProblem(null)} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen text-black dark:text-white font-sans antialiased bg-white dark:bg-black">
      <Sidebar 
        activeMode={viewMode} 
        onModeChange={handleViewChange} 
        theme={theme}
        onThemeChange={handleThemeChange}
        isComposerEnabled={!!analysisResponse}
      />

      {/* This is now your scrolling content area */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        
        {/* We removed min-h-screen from this div */}
        <div className="dark:bg-grid-white/[0.05] bg-grid-black/[0.05] relative">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 relative z-10">
            <main>
              {renderView()}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
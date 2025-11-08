import React, { useState } from 'react';
import { ViewMode, Theme } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { AnvilIcon } from './icons/AnvilIcon';
import { SearchIcon } from './icons/SearchIcon';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { ZapIcon } from './icons/ZapIcon';
import { MenuIcon, XIcon } from './icons/MenuIcon';
import { FlaskConicalIcon } from './icons/FlaskConicalIcon';
import { MessageSquareIcon } from './icons/MessageSquareIcon';

interface SidebarProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  theme: Theme;
  onThemeChange: () => void;
  isComposerEnabled: boolean;
}

const NavButton: React.FC<{
  mode: ViewMode;
  activeMode: ViewMode;
  onClick: (mode: ViewMode) => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}> = ({ mode, activeMode, onClick, disabled = false, title, children }) => {
  const isActive = activeMode === mode;
  return (
    <button
      onClick={() => onClick(mode)}
      className={`w-full flex items-center justify-start space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#1a1a1a] focus:ring-gray-400 ${
        isActive
          ? 'bg-gray-900 dark:bg-white/20 text-white'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-pressed={isActive}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeMode, onModeChange, theme, onThemeChange, isComposerEnabled }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleNavClick = (mode: ViewMode) => {
    onModeChange(mode);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden w-full bg-gray-100 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <AnvilIcon className="w-6 h-6 text-gray-900 dark:text-white" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Forge-<span className="gemini-gradient-text">AI</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onThemeChange}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 top-[57px]"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="bg-gray-100 dark:bg-[#1a1a1a] w-64 h-full shadow-xl animate-slide-in-left flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col space-y-2 p-4">
              <NavButton mode="chat" activeMode={activeMode} onClick={handleNavClick}>
                <MessageSquareIcon className="w-5 h-5" />
                <span>Chat</span>
              </NavButton>
              <NavButton mode="analyze" activeMode={activeMode} onClick={handleNavClick}>
                <FlaskConicalIcon className="w-5 h-5" />
                <span>Analyze</span>
              </NavButton>
              <NavButton mode="discover" activeMode={activeMode} onClick={handleNavClick}>
                <SearchIcon className="w-5 h-5" />
                <span>Discover</span>
              </NavButton>
              <NavButton
                mode="compose"
                activeMode={activeMode}
                onClick={handleNavClick}
                disabled={!isComposerEnabled}
                title={!isComposerEnabled ? "Complete analysis first" : "Generate action plan"}
              >
                <ZapIcon className="w-5 h-5" />
                <span>Composer</span>
              </NavButton>
            </nav>

            <div className="mt-auto p-4 space-y-3">
              {user && (
                <div className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-white/10">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                </div>
              )}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-gray-100 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-white/10 p-4 flex-col">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <AnvilIcon className="w-8 h-8 text-gray-900 dark:text-white" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Forge-<span className="gemini-gradient-text">AI</span>
          </h1>
        </div>
        
        <nav className="flex flex-col space-y-2">
          <NavButton mode="chat" activeMode={activeMode} onClick={onModeChange}>
            <MessageSquareIcon className="w-5 h-5" />
            <span>Chat</span>
          </NavButton>
          <NavButton mode="analyze" activeMode={activeMode} onClick={onModeChange}>
            <FlaskConicalIcon className="w-5 h-5" />
            <span>Analyze</span>
          </NavButton>
          <NavButton mode="discover" activeMode={activeMode} onClick={onModeChange}>
            <SearchIcon className="w-5 h-5" />
            <span>Discover</span>
          </NavButton>
          <NavButton
            mode="compose"
            activeMode={activeMode}
            onClick={onModeChange}
            disabled={!isComposerEnabled}
            title={!isComposerEnabled ? "Complete analysis first" : "Generate action plan"}
          >
            <ZapIcon className="w-5 h-5" />
            <span>Composer</span>
          </NavButton>
        </nav>

        <div className="mt-auto space-y-3">
          {user && (
            <div className="px-4 py-3 rounded-lg bg-gray-200 dark:bg-white/10">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Signed in as</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
            </div>
          )}
          
          <button
            onClick={onThemeChange}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#1a1a1a] focus:ring-gray-400"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-[#1a1a1a] focus:ring-red-400"
            aria-label="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
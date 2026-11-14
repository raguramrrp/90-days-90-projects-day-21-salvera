import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Search as SearchIcon,
  BarChart3, 
  Sparkles, 
  Briefcase, 
  MapPin, 
  Calculator, 
  GraduationCap, 
  Bookmark, 
  ChevronDown,
  UserCheck,
  Eye,
  Database, 
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';
import { SalveraLogo } from './SalveraLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onSearchClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Primary horizontal navigation requested by user
  const primaryNav = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'find-jobs', label: 'Find Jobs', icon: SearchIcon },
    { id: 'salary-explorer', label: 'Salary Explorer', icon: BarChart3 },
    { id: 'skills', label: 'Skill Intelligence', icon: Sparkles },
    { id: 'career-planner', label: 'Career Planner', icon: GraduationCap },
    { id: 'offer-studio', label: 'Offer Studio', icon: Calculator, badge: 'Financial' },
    { id: 'my-activity', label: 'My Activity', icon: Bookmark },
  ];

  // Secondary workspaces placed inside the Research & Workspaces menu
  const secondaryNav = [
    { id: 'roles', label: 'Role Explorer', icon: Briefcase, desc: 'Role directory & salary spreads' },
    { id: 'locations', label: 'Location Intelligence', icon: MapPin, desc: 'City cost-of-living & pay parity' },
    { id: 'market-watch', label: 'Market Watch', icon: Eye, desc: 'Compensation trends & tracklist' },
    { id: 'data-insights', label: 'Data & Methodology', icon: Database, desc: '5,292 stratified observations' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, desc: 'System configuration' },
  ];

  const isSecondaryActive = secondaryNav.some(item => item.id === activeTab);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E2E2D9] shadow-2xs">
      {/* Row 1 — Symmetrical Editorial Header with Centered Brand Logo & Title */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between border-b border-[#E2E2D9]/60 bg-white relative">
        {/* Left Side: Global Search */}
        <div className="flex items-center space-x-3 w-1/3 justify-start">
          <button 
            onClick={onSearchClick}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-[#F3EFE6]/60 hover:bg-[#F3EFE6] border border-[#E2E2D9] rounded-md text-xs text-[#707B75] transition group max-w-xs"
          >
            <SearchIcon className="w-3.5 h-3.5 text-[#707B75] group-hover:text-[#172B2A]" />
            <span className="truncate">Search roles, compensation, skills...</span>
          </button>

          <button
            onClick={onSearchClick}
            className="sm:hidden p-1.5 text-[#707B75] hover:text-[#202B29] hover:bg-[#F3EFE6] rounded"
          >
            <SearchIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Prominently Positioned SALVERA Logo & Brand Title */}
        <div className="flex items-center justify-center text-center">
          <button 
            onClick={() => setActiveTab('overview')}
            className="flex items-center space-x-2.5 focus:outline-hidden group"
          >
            <SalveraLogo size={30} showWordmark={true} />
          </button>
        </div>

        {/* Right Side: Profile & Tracker Quick Triggers */}
        <div className="flex items-center space-x-2.5 w-1/3 justify-end">
          <button
            onClick={() => setActiveTab('career-profile')}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
              activeTab === 'career-profile'
                ? 'bg-[#172B2A] text-white border-[#172B2A]'
                : 'bg-white border-[#E2E2D9] text-[#202B29] hover:bg-[#F3EFE6]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-[#B66B45]" />
            <span>Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('my-activity')}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition ${
              activeTab === 'my-activity'
                ? 'bg-[#172B2A] text-white border-[#172B2A]'
                : 'bg-white border-[#E2E2D9] text-[#202B29] hover:bg-[#F3EFE6]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#648C7A]" />
            <span>Tracker</span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#202B29] hover:bg-[#F3EFE6] rounded"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Row 2 — Primary Horizontal Navigation */}
      <nav className="hidden lg:flex w-full px-4 sm:px-6 lg:px-8 bg-[#F3EFE6]/80 border-t border-[#E2E2D9]/60 justify-between items-center text-xs">
        <div className="flex space-x-0.5 overflow-x-auto scrollbar-none min-w-max py-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-1.5 px-3.5 py-2.5 text-xs transition border-b-2 font-medium ${
                  isActive
                    ? 'border-[#172B2A] text-[#172B2A] font-semibold bg-white/90 shadow-2xs'
                    : 'border-transparent text-[#707B75] hover:text-[#202B29] hover:bg-white/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#B66B45]' : 'text-[#707B75]'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase tracking-wider ${
                    isActive ? 'bg-[#172B2A] text-white' : 'bg-[#D9DDD5] text-[#202B29]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Workspaces Dropdown */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded border transition ${
              isSecondaryActive 
                ? 'bg-[#172B2A] text-white border-[#172B2A]' 
                : 'bg-white border-[#E2E2D9] text-[#202B29] hover:bg-[#F3EFE6]'
            }`}
          >
            <span>Research & Workspaces</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>

          {workspaceMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-md shadow-lg border border-[#E2E2D9] py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#707B75] border-b border-[#E2E2D9]/60 mb-1">
                Secondary Research Workspaces
              </div>
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2.5 transition ${
                      isActive ? 'bg-[#F3EFE6] text-[#172B2A] font-semibold' : 'text-[#202B29] hover:bg-[#F3EFE6]/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#B66B45]' : 'text-[#707B75]'}`} />
                    <div className="truncate">
                      <div className="font-medium text-xs text-[#202B29]">{item.label}</div>
                      <div className="text-[10px] text-[#707B75] truncate">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E2E2D9] bg-white px-4 py-3 space-y-1 shadow-lg max-h-[85vh] overflow-y-auto">
          <div className="text-[10px] font-bold text-[#707B75] uppercase tracking-wider px-2 py-1">
            Primary Navigation
          </div>
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#172B2A] text-white'
                    : 'text-[#202B29] hover:bg-[#F3EFE6]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#B66B45]' : 'text-[#707B75]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="text-[10px] font-bold text-[#707B75] uppercase tracking-wider px-2 py-1 pt-3 border-t border-[#E2E2D9]">
            Research & Workspaces
          </div>
          {secondaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs transition ${
                  isActive
                    ? 'bg-[#F3EFE6] text-[#172B2A] font-semibold'
                    : 'text-[#202B29] hover:bg-[#F3EFE6]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-[#707B75]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

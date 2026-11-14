import React, { useState } from 'react';
import { Header } from './components/Header';
import { SalveraLogo } from './components/SalveraLogo';
import { SearchModal } from './components/SearchModal';
import { OverviewPage } from './pages/OverviewPage';
import { FindJobsPage } from './pages/FindJobsPage';
import { RecommendedJobsPage } from './pages/RecommendedJobsPage';
import { CareerProfilePage } from './pages/CareerProfilePage';
import { MyActivityPage } from './pages/MyActivityPage';
import { JobAlertsPage } from './pages/JobAlertsPage';
import { SalaryExplorerPage } from './pages/SalaryExplorerPage';
import { SkillIntelligencePage } from './pages/SkillIntelligencePage';
import { RoleExplorerPage } from './pages/RoleExplorerPage';
import { LocationIntelligencePage } from './pages/LocationIntelligencePage';
import { OfferStudioPage } from './pages/OfferStudioPage';
import { SalaryEstimatorPage } from './pages/SalaryEstimatorPage';
import { CareerPlannerPage } from './pages/CareerPlannerPage';
import { MarketWatchPage } from './pages/MarketWatchPage';
import { DataInsightsPage } from './pages/DataInsightsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [salaryFilters, setSalaryFilters] = useState<any>(null);

  const handleNavigate = (tab: string, filters?: any) => {
    setActiveTab(tab);
    if (filters) {
      setSalaryFilters(filters);
    }
  };

  const handleSelectRoleFromSearch = (role: string, city?: string) => {
    setSalaryFilters({ role_name: role, city: city || '' });
    setActiveTab('salary-explorer');
  };

  const handleSelectSkillFromSearch = (skill: string) => {
    setActiveTab('skills');
  };

  const handleSelectCityFromSearch = (city: string) => {
    setSalaryFilters({ city });
    setActiveTab('salary-explorer');
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] flex flex-col font-sans selection:bg-[#B66B45] selection:text-white">
      {/* Horizontal Top Navigation - No Left Sidebar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSearchClick={() => setSearchModalOpen(true)}
      />

      {/* Main Full-Width Content Container */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'overview' && <OverviewPage onNavigate={handleNavigate} />}
        {activeTab === 'find-jobs' && (
          <FindJobsPage 
            onNavigateToSalaryExplorer={(role, city) => {
              setSalaryFilters({ role_name: role, city });
              setActiveTab('salary-explorer');
            }}
            onNavigateToCareerProfile={() => setActiveTab('career-profile')}
          />
        )}
        {activeTab === 'recommended-jobs' && (
          <RecommendedJobsPage
            onSelectJob={(jobId) => {
              setActiveTab('find-jobs');
            }}
            onNavigateToProfile={() => setActiveTab('career-profile')}
          />
        )}
        {activeTab === 'career-profile' && (
          <CareerProfilePage
            onNavigateToFindJobs={() => setActiveTab('find-jobs')}
            onNavigateToRecommendations={() => setActiveTab('recommended-jobs')}
          />
        )}
        {activeTab === 'my-activity' && (
          <MyActivityPage
            onSelectJob={(jobId) => {
              setActiveTab('find-jobs');
            }}
            onNavigateToFindJobs={() => setActiveTab('find-jobs')}
          />
        )}
        {activeTab === 'job-alerts' && <JobAlertsPage />}
        {activeTab === 'salary-explorer' && <SalaryExplorerPage initialFilters={salaryFilters} />}
        {activeTab === 'skills' && <SkillIntelligencePage />}
        {activeTab === 'roles' && <RoleExplorerPage />}
        {activeTab === 'locations' && <LocationIntelligencePage />}
        {activeTab === 'offer-studio' && <OfferStudioPage />}
        {activeTab === 'salary-estimator' && <SalaryEstimatorPage />}
        {activeTab === 'career-planner' && <CareerPlannerPage />}
        {activeTab === 'market-watch' && <MarketWatchPage />}
        {activeTab === 'data-insights' && <DataInsightsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectRole={handleSelectRoleFromSearch}
        onSelectSkill={handleSelectSkillFromSearch}
        onSelectCity={handleSelectCityFromSearch}
      />

      {/* Professional Editorial Footer */}
      <footer className="w-full bg-white border-t border-[#E2E2D9] py-5 px-4 sm:px-6 lg:px-8 text-xs text-[#707B75]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <SalveraLogo size={22} />
            <span className="font-bold text-[#172B2A]">SALVERA</span>
            <span>•</span>
            <span>Career & Financial Intelligence Workstation</span>
            <span>•</span>
            <span className="text-[#B66B45] font-medium">Edition 2.2</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>VERIFIED BENCHMARKS</span>
            <span>CC-BY 4.0</span>
            <span>PRO</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

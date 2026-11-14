import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Briefcase, 
  ExternalLink, 
  MapPin, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Plus,
  IndianRupee,
  Layers,
  ChevronDown
} from 'lucide-react';
import { api, SavedJobItem, JobApplicationItem } from '../services/api';

interface MyActivityPageProps {
  onSelectJob?: (jobId: number) => void;
  onNavigateToFindJobs?: () => void;
}

export const MyActivityPage: React.FC<MyActivityPageProps> = ({
  onSelectJob,
  onNavigateToFindJobs
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'saved' | 'applications'>('saved');
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [applications, setApplications] = useState<JobApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      const [savedRes, appsRes] = await Promise.all([
        api.getSavedJobs(),
        api.getApplications()
      ]);
      setSavedJobs(savedRes || []);
      setApplications(appsRes || []);
    } catch (err) {
      console.error('Error fetching activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityData();
  }, []);

  const handleUnsave = async (jobId: number) => {
    try {
      await api.toggleSaveJob(jobId);
      setSavedJobs(prev => prev.filter(item => item.job_id !== jobId));
    } catch (err) {
      console.error('Error unsaving job:', err);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      const updated = await api.updateApplicationStatus(appId, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status } : a));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const KANBAN_COLUMNS = [
    { id: 'applied', label: 'Applied', color: 'border-blue-500' },
    { id: 'interviewing', label: 'Interviewing', color: 'border-amber-500' },
    { id: 'offered', label: 'Offered', color: 'border-emerald-500' },
    { id: 'archived', label: 'Archived / Rejected', color: 'border-gray-400' },
  ];

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E2D9] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9] uppercase tracking-wider">
                My Career Activity
              </span>
              <span className="text-xs text-[#707B75]">
                {savedJobs.length} Bookmarks • {applications.length} Applications
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172B2A] mt-1">
              Saved Jobs & Application Tracker
            </h1>
            <p className="text-xs sm:text-sm text-[#707B75] mt-0.5">
              Keep track of Indian technology opportunities, application statuses, and interview progressions.
            </p>
          </div>

          {onNavigateToFindJobs && (
            <button
              onClick={onNavigateToFindJobs}
              className="px-3.5 py-2 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-1.5 shrink-0"
            >
              <Briefcase className="w-3.5 h-3.5 text-[#D5B66D]" />
              <span>Explore More Jobs</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-4 flex space-x-2 border-b border-[#F0F3F1]">
          <button
            onClick={() => setActiveSubTab('saved')}
            className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'saved'
                ? 'border-[#286B59] text-[#286B59]'
                : 'border-transparent text-[#6B756F] hover:text-[#202723]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Jobs ({savedJobs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('applications')}
            className={`flex items-center space-x-1.5 pb-2 text-xs font-semibold border-b-2 transition ${
              activeSubTab === 'applications'
                ? 'border-[#286B59] text-[#286B59]'
                : 'border-transparent text-[#6B756F] hover:text-[#202723]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Application Kanban Tracker ({applications.length})</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="text-center py-12 text-[#6B756F] text-xs">Loading activity records...</div>
        ) : activeSubTab === 'saved' ? (
          /* Saved Jobs List */
          savedJobs.length === 0 ? (
            <div className="bg-white rounded-md border border-[#E3E7E3] p-10 text-center">
              <Bookmark className="w-8 h-8 text-[#98A39B] mx-auto mb-2 opacity-60" />
              <h3 className="text-sm font-semibold text-[#202723]">No saved jobs yet</h3>
              <p className="text-xs text-[#6B756F] mt-1 max-w-sm mx-auto">
                When browsing opportunities in Find Jobs, click the bookmark icon on any job to save it here for later review.
              </p>
              {onNavigateToFindJobs && (
                <button
                  onClick={onNavigateToFindJobs}
                  className="mt-3 px-3.5 py-1.5 bg-[#286B59] text-white text-xs font-semibold rounded hover:bg-[#1E5345]"
                >
                  Browse India Tech Jobs
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedJobs.map(item => {
                const job = item.job;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-md border border-[#E3E7E3] p-4 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[11px] text-[#286B59] font-medium flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{job.city}, India</span>
                          </div>
                          <h2 className="text-sm font-bold text-[#1E2521] mt-0.5">
                            {job.title}
                          </h2>
                          <div className="text-xs text-[#525E56] font-medium">
                            {job.company_name}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUnsave(item.job_id)}
                          title="Remove from saved"
                          className="p-1 text-[#8C9890] hover:text-red-600 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-2.5 text-[10px]">
                        <span className="px-1.5 py-0.5 bg-[#F0F4F2] text-[#3D4741] rounded border border-[#DFE5E1]">
                          {job.work_mode}
                        </span>
                        <span className="px-1.5 py-0.5 bg-[#F0F4F2] text-[#3D4741] rounded border border-[#DFE5E1]">
                          {job.experience_min}–{job.experience_max}y exp
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2.5 border-t border-[#F0F3F1] flex items-center justify-between">
                      {onSelectJob && (
                        <button
                          onClick={() => onSelectJob(job.id)}
                          className="text-xs text-[#286B59] font-medium hover:underline flex items-center space-x-0.5"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}

                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-[#286B59] text-white text-xs font-semibold rounded hover:bg-[#1E5345] transition flex items-center space-x-1"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Kanban Board */
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {KANBAN_COLUMNS.map(col => {
              const colApps = applications.filter(a => a.status.toLowerCase() === col.id);
              return (
                <div key={col.id} className="bg-[#F2F5F3]/70 rounded-md border border-[#E0E6E2] p-3 flex flex-col">
                  {/* Column Header */}
                  <div className={`border-t-2 ${col.color} pt-2 pb-2 flex items-center justify-between`}>
                    <span className="text-xs font-bold text-[#202723] uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.2 rounded-full bg-white text-[#525E56] border border-[#DCE2DD]">
                      {colApps.length}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-2.5 flex-1 min-h-[240px]">
                    {colApps.length === 0 ? (
                      <div className="text-center py-8 text-[11px] text-[#8C9890] italic">
                        No applications in this stage
                      </div>
                    ) : (
                      colApps.map(app => (
                        <div
                          key={app.id}
                          className="bg-white rounded border border-[#DCE2DD] p-3 shadow-2xs space-y-2"
                        >
                          <div>
                            <h4 className="text-xs font-bold text-[#1E2521] leading-tight">
                              {app.job_title}
                            </h4>
                            <div className="text-[11px] text-[#525E56] font-medium mt-0.5">
                              {app.company_name}
                            </div>
                            <div className="text-[10px] text-[#8C9890] mt-1 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Applied: {new Date(app.applied_date).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Quick Stage Mover */}
                          <div className="pt-2 border-t border-[#F2F5F3] flex items-center justify-between">
                            <span className="text-[10px] text-[#6B756F]">Move stage:</span>
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                              className="text-[10px] bg-[#F8FAF8] border border-[#DCE2DD] rounded px-1.5 py-0.5 font-medium text-[#202723] cursor-pointer"
                            >
                              <option value="applied">Applied</option>
                              <option value="interviewing">Interviewing</option>
                              <option value="offered">Offered</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

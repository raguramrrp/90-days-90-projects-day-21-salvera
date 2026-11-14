import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  IndianRupee, 
  Clock, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  ChevronRight, 
  Filter, 
  ArrowUpDown,
  Share2,
  Calendar,
  Layers,
  GraduationCap
} from 'lucide-react';
import { api, JobListing, JobDetail, JobSearchParams } from '../services/api';

interface FindJobsPageProps {
  onNavigateToSalaryExplorer?: (role: string, city: string) => void;
  onNavigateToCareerProfile?: () => void;
}

export const FindJobsPage: React.FC<FindJobsPageProps> = ({ 
  onNavigateToSalaryExplorer,
  onNavigateToCareerProfile 
}) => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState<JobDetail | null>(null);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedExpLevel, setSelectedExpLevel] = useState<string>('');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All Modes');
  const [selectedEmpType, setSelectedEmpType] = useState<string>('All Types');
  const [disclosedOnly, setDisclosedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('recent');

  // Track applied action feedback
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);

  const CITIES = [
    'All Cities', 'Bengaluru', 'Chennai', 'Hyderabad', 'Pune', 
    'Mumbai', 'Delhi NCR', 'Coimbatore', 'Tirunelveli', 'Madurai', 'Kochi'
  ];

  const EXP_LEVELS = [
    { label: 'All Experience', value: '' },
    { label: 'Fresher / Trainee (0–1 yrs)', value: 'fresher' },
    { label: 'Junior (1–3 yrs)', value: 'junior' },
    { label: 'Mid-Level (3–6 yrs)', value: 'mid' },
    { label: 'Senior (6+ yrs)', value: 'senior' },
  ];

  const WORK_MODES = ['All Modes', 'On-site', 'Hybrid', 'Remote'];
  const EMP_TYPES = ['All Types', 'Full-time', 'Internship'];

  // Fetch job list
  const fetchJobs = async (targetPage = 1) => {
    setLoadingList(true);
    try {
      const params: JobSearchParams = {
        query: searchQuery.trim() || undefined,
        city: selectedCity !== 'All Cities' ? selectedCity : undefined,
        experience_level: selectedExpLevel || undefined,
        work_mode: selectedWorkMode !== 'All Modes' ? selectedWorkMode : undefined,
        employment_type: selectedEmpType !== 'All Types' ? selectedEmpType : undefined,
        salary_disclosed_only: disclosedOnly,
        sort_by: sortBy,
        page: targetPage,
        page_size: 15,
      };

      const res = await api.searchJobs(params);
      setJobs(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.total_pages || 1);
      setPage(res.page || 1);

      // Default select first job if none selected or not in current list
      if (res.items && res.items.length > 0) {
        if (!selectedJobId || !res.items.some(j => j.id === selectedJobId)) {
          setSelectedJobId(res.items[0].id);
        }
      } else {
        setSelectedJobId(null);
        setSelectedJobDetail(null);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch single job detail
  const fetchJobDetail = async (jobId: number) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getJobDetail(jobId);
      setSelectedJobDetail(detail);
    } catch (err) {
      console.error('Error fetching job detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, [selectedCity, selectedExpLevel, selectedWorkMode, selectedEmpType, disclosedOnly, sortBy]);

  useEffect(() => {
    if (selectedJobId) {
      fetchJobDetail(selectedJobId);
    }
  }, [selectedJobId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs(1);
  };

  const handleToggleSave = async (e: React.MouseEvent, jobId: number) => {
    e.stopPropagation();
    try {
      const res = await api.toggleSaveJob(jobId);
      // Update local state in list
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: res.is_saved } : j));
      if (selectedJobDetail && selectedJobDetail.id === jobId) {
        setSelectedJobDetail({ ...selectedJobDetail, is_saved: res.is_saved });
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleTrackApplication = async (status: string) => {
    if (!selectedJobDetail) return;
    try {
      await api.trackApplication({
        job_id: selectedJobDetail.id,
        status,
        company_name: selectedJobDetail.company_name,
        job_title: selectedJobDetail.title,
        notes: `Marked as ${status} from Find Jobs page`,
      });

      setSelectedJobDetail(prev => prev ? { ...prev, application_status: status } : null);
      setJobs(prev => prev.map(j => j.id === selectedJobDetail.id ? { ...j, application_status: status } : j));
      
      setAppliedNotice(`Status updated to '${status.toUpperCase()}' in My Activity!`);
      setTimeout(() => setAppliedNotice(null), 3500);
    } catch (err) {
      console.error('Error tracking application:', err);
    }
  };

  // Format salary LPA string
  const formatSalary = (min?: number, max?: number, disclosed?: boolean) => {
    if (!disclosed || (!min && !max)) {
      return 'Salary not disclosed';
    }
    const minLpa = min ? (min / 100000).toFixed(1) : '';
    const maxLpa = max ? (max / 100000).toFixed(1) : '';
    if (minLpa && maxLpa) return `₹${minLpa} – ₹${maxLpa} LPA`;
    if (maxLpa) return `Up to ₹${maxLpa} LPA`;
    return `From ₹${minLpa} LPA`;
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      {/* Editorial Header */}
      <div className="bg-white border-b border-[#E2E2D9] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9] uppercase tracking-wider">
                India Job Discovery
              </span>
              <span className="text-xs text-[#707B75]">
                {totalCount} Opportunities Indexed
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172B2A] mt-1">
              Find Technology Opportunities in India
            </h1>
            <p className="text-xs sm:text-sm text-[#707B75] mt-0.5">
              Explore verified roles, evaluate advertised pay against historical market benchmarks, and identify skill alignment.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateToCareerProfile && (
              <button
                onClick={onNavigateToCareerProfile}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#F3EFE6] hover:bg-[#EAE4D5] text-[#172B2A] text-xs font-medium rounded-md border border-[#E2E2D9] transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B66B45]" />
                <span>Adjust Preferences</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="max-w-7xl mx-auto mt-4">
          <form onSubmit={handleSearchSubmit} className="space-y-2.5">
            {/* Main Search Input */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#707B75]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by job title, company, skills (e.g. 'Data Analyst in Chennai', 'Zoho', 'Python')..."
                  className="w-full pl-9 pr-4 py-2 bg-[#F3EFE6]/40 border border-[#E2E2D9] rounded-md text-xs sm:text-sm text-[#202B29] placeholder-[#707B75] focus:outline-hidden focus:border-[#172B2A] focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                className="px-5 py-2 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md shadow-xs transition shrink-0 flex items-center justify-center space-x-1.5"
              >
                <Search className="w-3.5 h-3.5 text-[#D5B66D]" />
                <span>Search Jobs</span>
              </button>
            </div>

            {/* Structured India Filters */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* City Filter */}
              <div className="flex items-center space-x-1 text-xs bg-white border border-[#E2E2D9] rounded-md px-2 py-1 shadow-2xs">
                <MapPin className="w-3 h-3 text-[#B66B45]" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs text-[#202B29] font-medium focus:outline-hidden cursor-pointer"
                >
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Experience Filter */}
              <div className="flex items-center space-x-1 text-xs bg-white border border-[#E2E2D9] rounded-md px-2 py-1 shadow-2xs">
                <GraduationCap className="w-3 h-3 text-[#172B2A]" />
                <select
                  value={selectedExpLevel}
                  onChange={(e) => setSelectedExpLevel(e.target.value)}
                  className="bg-transparent text-xs text-[#202B29] font-medium focus:outline-hidden cursor-pointer"
                >
                  {EXP_LEVELS.map(exp => (
                    <option key={exp.value} value={exp.value}>{exp.label}</option>
                  ))}
                </select>
              </div>

              {/* Work Mode */}
              <div className="flex items-center space-x-1 text-xs bg-white border border-[#E2E2D9] rounded-md px-2 py-1 shadow-2xs">
                <Building2 className="w-3 h-3 text-[#648C7A]" />
                <select
                  value={selectedWorkMode}
                  onChange={(e) => setSelectedWorkMode(e.target.value)}
                  className="bg-transparent text-xs text-[#202B29] font-medium focus:outline-hidden cursor-pointer"
                >
                  {WORK_MODES.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div className="flex items-center space-x-1 text-xs bg-white border border-[#E2E2D9] rounded-md px-2 py-1 shadow-2xs">
                <Briefcase className="w-3 h-3 text-[#B66B45]" />
                <select
                  value={selectedEmpType}
                  onChange={(e) => setSelectedEmpType(e.target.value)}
                  className="bg-transparent text-xs text-[#202B29] font-medium focus:outline-hidden cursor-pointer"
                >
                  {EMP_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Disclosed Salary Toggle */}
              <label className="flex items-center space-x-1.5 text-xs text-[#3E4943] bg-white border border-[#DCE2DD] rounded px-2.5 py-1 cursor-pointer hover:bg-[#F9FAF9]">
                <input
                  type="checkbox"
                  checked={disclosedOnly}
                  onChange={(e) => setDisclosedOnly(e.target.checked)}
                  className="rounded text-[#286B59] focus:ring-[#286B59] cursor-pointer"
                />
                <span>Salary Disclosed Only</span>
              </label>

              {/* Sort By */}
              <div className="ml-auto flex items-center space-x-1 text-xs text-[#5C6660]">
                <ArrowUpDown className="w-3 h-3" />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-[#DCE2DD] rounded px-2 py-1 text-xs font-medium text-[#202723] focus:outline-hidden"
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary_high">Salary (Highest First)</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Main Two-Column Discovery Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {appliedNotice && (
          <div className="mb-3 p-2.5 bg-[#EBF3EF] border border-[#286B59]/30 rounded text-xs text-[#286B59] font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#286B59]" />
            <span>{appliedNotice}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Job Feed (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs text-[#6B756F] px-1">
              <span>Showing {jobs.length} of {totalCount} openings</span>
              <span>India Tech Feed</span>
            </div>

            {loadingList ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-white p-4 rounded-md border border-[#E3E7E3] animate-pulse space-y-2">
                    <div className="h-4 bg-[#EDF1EE] rounded w-3/4"></div>
                    <div className="h-3 bg-[#EDF1EE] rounded w-1/2"></div>
                    <div className="h-3 bg-[#EDF1EE] rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-md border border-[#E3E7E3] p-8 text-center">
                <Briefcase className="w-8 h-8 text-[#98A39B] mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-[#202723]">No matching jobs found</h3>
                <p className="text-xs text-[#6B756F] mt-1 max-w-sm mx-auto">
                  Try clearing some filters (e.g. change City to 'All Cities' or remove specific keywords).
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCity('All Cities');
                    setSelectedExpLevel('');
                    setSelectedWorkMode('All Modes');
                    setSelectedEmpType('All Types');
                    setDisclosedOnly(false);
                  }}
                  className="mt-3 px-3 py-1.5 bg-[#EBF3EF] text-[#286B59] text-xs font-semibold rounded hover:bg-[#DDECE4]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {jobs.map((job) => {
                  const isSelected = selectedJobId === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJobId(job.id)}
                      className={`p-3.5 bg-white rounded-md border transition cursor-pointer relative ${
                        isSelected 
                          ? 'border-[#286B59] ring-1 ring-[#286B59] bg-[#F7FAF8]' 
                          : 'border-[#E3E7E3] hover:border-[#CCD5CE] hover:bg-[#FAFBFA]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-sm font-semibold text-[#1C2420] truncate">
                            {job.title}
                          </h2>
                          <div className="flex items-center space-x-1.5 text-xs text-[#525E56] mt-0.5">
                            <span className="font-medium text-[#202723]">{job.company_name}</span>
                            <span>•</span>
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 text-[#286B59] mr-0.5 shrink-0" />
                              {job.city}
                            </span>
                          </div>
                        </div>

                        {/* Quick Bookmark Action */}
                        <button
                          onClick={(e) => handleToggleSave(e, job.id)}
                          title={job.is_saved ? 'Remove Bookmark' : 'Save Job'}
                          className={`p-1.5 rounded transition shrink-0 ${
                            job.is_saved
                              ? 'text-[#286B59] bg-[#EBF3EF]'
                              : 'text-[#8A968F] hover:text-[#202723] hover:bg-[#F0F3F1]'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-[#F0F4F2] text-[#3D4741] font-medium border border-[#E0E6E2]">
                          {job.work_mode}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#F0F4F2] text-[#3D4741] font-medium border border-[#E0E6E2]">
                          {job.experience_min}–{job.experience_max} yrs
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-[#F0F4F2] text-[#3D4741] font-medium border border-[#E0E6E2]">
                          {job.employment_type}
                        </span>

                        {job.application_status && (
                          <span className="px-1.5 py-0.5 rounded bg-[#EBF3EF] text-[#286B59] font-bold border border-[#C5DCD0]">
                            {job.application_status.toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* Compensation Indicator */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F2F5F3] text-xs">
                        <div className="font-semibold text-[#286B59] flex items-center">
                          <IndianRupee className="w-3 h-3 mr-0.5 shrink-0" />
                          <span>{formatSalary(job.salary_min, job.salary_max, job.salary_disclosed)}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-[10px] text-[#7D8A82]">
                          <span>{job.source_name}</span>
                          {job.is_synthetic && (
                            <span className="px-1 py-0.2 rounded bg-[#FAF5EB] text-[#825215] border border-[#ECD9BA] font-semibold">
                              DEMO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 text-xs text-[#525E56]">
                    <button
                      disabled={page <= 1}
                      onClick={() => fetchJobs(page - 1)}
                      className="px-3 py-1 bg-white border border-[#DCE2DD] rounded hover:bg-[#F6F8F6] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span>Page {page} of {totalPages}</span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => fetchJobs(page + 1)}
                      className="px-3 py-1 bg-white border border-[#DCE2DD] rounded hover:bg-[#F6F8F6] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Detailed Job Inspection Workspace (7 cols) */}
          <div className="lg:col-span-7">
            {loadingDetail ? (
              <div className="bg-white p-6 rounded-md border border-[#E3E7E3] animate-pulse space-y-4">
                <div className="h-6 bg-[#EDF1EE] rounded w-2/3"></div>
                <div className="h-4 bg-[#EDF1EE] rounded w-1/3"></div>
                <div className="h-24 bg-[#EDF1EE] rounded"></div>
              </div>
            ) : selectedJobDetail ? (
              <div className="bg-white rounded-md border border-[#E3E7E3] shadow-xs divide-y divide-[#F0F3F1]">
                {/* Header & Primary Actions */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-0.5 rounded font-medium bg-[#EBF3EF] text-[#286B59] border border-[#D5E4DC]">
                          {selectedJobDetail.city}, India
                        </span>
                        <span className="text-xs text-[#6B756F]">
                          {selectedJobDetail.work_mode} • {selectedJobDetail.employment_type}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-[#19211D] mt-1.5">
                        {selectedJobDetail.title}
                      </h2>
                      <div className="text-sm font-medium text-[#404D45] mt-0.5 flex items-center space-x-2">
                        <span>{selectedJobDetail.company_name}</span>
                        <span>•</span>
                        <span className="text-xs text-[#738077]">
                          Experience: {selectedJobDetail.experience_min}–{selectedJobDetail.experience_max} years
                        </span>
                      </div>
                    </div>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={(e) => handleToggleSave(e, selectedJobDetail.id)}
                      className={`p-2 rounded-md border transition shrink-0 ${
                        selectedJobDetail.is_saved
                          ? 'bg-[#EBF3EF] border-[#286B59] text-[#286B59]'
                          : 'bg-white border-[#E3E7E3] text-[#69756E] hover:bg-[#F6F7F5]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${selectedJobDetail.is_saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Advertised Compensation & Apply Actions */}
                  <div className="mt-4 p-3.5 bg-[#F8FAF8] rounded-md border border-[#E1E7E3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-[#6B756F] font-medium uppercase tracking-wider">
                        Advertised Compensation
                      </div>
                      <div className="text-base sm:text-lg font-bold text-[#286B59] mt-0.5">
                        {formatSalary(selectedJobDetail.salary_min, selectedJobDetail.salary_max, selectedJobDetail.salary_disclosed)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <a
                        href={selectedJobDetail.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#286B59] hover:bg-[#1E5345] text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-1.5"
                      >
                        <span>Apply on Official Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Application Tracker Quick Selector */}
                      <select
                        value={selectedJobDetail.application_status || ''}
                        onChange={(e) => handleTrackApplication(e.target.value)}
                        className="bg-white border border-[#D1D9D3] text-xs font-medium text-[#202723] rounded-md px-2.5 py-2 focus:outline-hidden cursor-pointer"
                      >
                        <option value="" disabled>Track Status...</option>
                        <option value="applied">Mark as Applied</option>
                        <option value="interviewing">Interviewing</option>
                        <option value="offered">Offered</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SALVERA Market Benchmark Panel */}
                {selectedJobDetail.salary_benchmark && (
                  <div className="p-5 bg-[#FAFCFA]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-[#286B59]"></div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#286B59]">
                          SALVERA Market Benchmark Integration
                        </h3>
                      </div>
                      {onNavigateToSalaryExplorer && selectedJobDetail.salary_benchmark.canonical_role && (
                        <button
                          onClick={() => onNavigateToSalaryExplorer(
                            selectedJobDetail.salary_benchmark!.canonical_role!,
                            selectedJobDetail.city
                          )}
                          className="text-[11px] text-[#286B59] hover:underline flex items-center space-x-0.5"
                        >
                          <span>Explore Benchmark Distribution</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <div className="bg-white p-3 rounded border border-[#E3E8E4]">
                        <div className="text-[10px] text-[#707B75] uppercase">Market Median (P50)</div>
                        <div className="text-base font-bold text-[#202723] mt-0.5">
                          ₹{(selectedJobDetail.salary_benchmark.benchmark_median! / 100000).toFixed(1)} LPA
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-[#E3E8E4]">
                        <div className="text-[10px] text-[#707B75] uppercase">Typical Range (P25–P75)</div>
                        <div className="text-base font-bold text-[#202723] mt-0.5">
                          ₹{(selectedJobDetail.salary_benchmark.benchmark_p25! / 100000).toFixed(1)}L – ₹{(selectedJobDetail.salary_benchmark.benchmark_p75! / 100000).toFixed(1)}L
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-[#E3E8E4]">
                        <div className="text-[10px] text-[#707B75] uppercase">Database Observations</div>
                        <div className="text-base font-bold text-[#202723] mt-0.5">
                          {selectedJobDetail.salary_benchmark.sample_count} Records
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#525E56] mt-2.5 leading-relaxed bg-white/70 p-2.5 rounded border border-[#E8ECE9]">
                      {selectedJobDetail.salary_benchmark.comparison_text}
                    </p>
                  </div>
                )}

                {/* Skill Alignment & Gap Analysis */}
                {selectedJobDetail.skill_alignment && (
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B4740]">
                        Skill Requirements & Profile Alignment
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EBF3EF] text-[#286B59]">
                        {selectedJobDetail.skill_alignment.match_percentage}% Profile Match
                      </span>
                    </div>

                    {/* Matching Skills */}
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-[#286B59] flex items-center space-x-1 mb-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Matching Skills in Your Profile</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJobDetail.skill_alignment.matching_skills.length > 0 ? (
                          selectedJobDetail.skill_alignment.matching_skills.map(sk => (
                            <span key={sk} className="px-2 py-0.5 bg-[#EBF3EF] text-[#286B59] text-xs rounded border border-[#CDE0D6] font-medium">
                              {sk}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#7B8780] italic">
                            No direct skill overlaps identified. Add your skills in Career Profile to inspect alignment.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Missing Required Skills */}
                    {selectedJobDetail.skill_alignment.missing_required_skills.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-[#B9853C] flex items-center space-x-1 mb-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>Required Skills to Acquire</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJobDetail.skill_alignment.missing_required_skills.map(sk => (
                            <span key={sk} className="px-2 py-0.5 bg-[#FCF8F2] text-[#8C5D1E] text-xs rounded border border-[#F4E3C9] font-medium">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Missing Preferred Skills */}
                    {selectedJobDetail.skill_alignment.missing_preferred_skills.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[11px] font-semibold text-[#5A665F] mb-1.5">
                          Preferred / Nice-to-Have Skills
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJobDetail.skill_alignment.missing_preferred_skills.map(sk => (
                            <span key={sk} className="px-2 py-0.5 bg-[#F2F5F3] text-[#4F5953] text-xs rounded border border-[#DFE5E1]">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Job Description & Responsibilities */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B4740] mb-2">
                      About the Role
                    </h3>
                    <p className="text-xs sm:text-sm text-[#404B44] leading-relaxed">
                      {selectedJobDetail.description}
                    </p>
                  </div>

                  {selectedJobDetail.responsibilities && selectedJobDetail.responsibilities.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B4740] mb-2">
                        Key Responsibilities
                      </h3>
                      <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#404B44]">
                        {selectedJobDetail.responsibilities.map((r, idx) => (
                          <li key={idx} className="leading-relaxed">{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJobDetail.requirements && selectedJobDetail.requirements.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#3B4740] mb-2">
                        Candidate Requirements
                      </h3>
                      <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[#404B44]">
                        {selectedJobDetail.requirements.map((req, idx) => (
                          <li key={idx} className="leading-relaxed">{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Transparent Evaluation Disclosure */}
                  {selectedJobDetail.is_synthetic && (
                    <div className="p-3 bg-[#FAF5EB] rounded border border-[#ECD9BA] text-[11px] text-[#7A4B10]">
                      <span className="font-bold">Evaluation Dataset Notice:</span> This opening is a calibrated simulation reflecting realistic Indian technology market hiring standards for academic, career research, and platform evaluation purposes.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-md border border-[#E3E7E3] p-10 text-center text-[#6B756F]">
                Select a job from the list to view its complete description, salary benchmark comparison, and skill requirements.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

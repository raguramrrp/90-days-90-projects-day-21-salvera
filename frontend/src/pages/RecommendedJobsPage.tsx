import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Building2, 
  Briefcase, 
  IndianRupee, 
  Bookmark, 
  ExternalLink, 
  CheckCircle2, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { api, JobListing } from '../services/api';

interface RecommendedJobsPageProps {
  onSelectJob?: (jobId: number) => void;
  onNavigateToProfile?: () => void;
}

export const RecommendedJobsPage: React.FC<RecommendedJobsPageProps> = ({
  onSelectJob,
  onNavigateToProfile
}) => {
  const [recommendations, setRecommendations] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await api.getRecommendedJobs(25);
      setRecommendations(data || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleToggleSave = async (jobId: number) => {
    try {
      const res = await api.toggleSaveJob(jobId);
      setRecommendations(prev => prev.map(j => j.id === jobId ? { ...j, is_saved: res.is_saved } : j));
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const formatSalary = (min?: number, max?: number, disclosed?: boolean) => {
    if (!disclosed || (!min && !max)) return 'Salary not disclosed';
    const minLpa = min ? (min / 100000).toFixed(1) : '';
    const maxLpa = max ? (max / 100000).toFixed(1) : '';
    if (minLpa && maxLpa) return `₹${minLpa} – ₹${maxLpa} LPA`;
    return `Up to ₹${maxLpa} LPA`;
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E2D9] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9] uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#B66B45]" />
                <span>Explainable Matching</span>
              </span>
              <span className="text-xs text-[#707B75]">
                Calibrated to your active profile
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172B2A] mt-1">
              Personalized Recommendations for You
            </h1>
            <p className="text-xs sm:text-sm text-[#707B75] mt-0.5">
              Ranked by skill overlap (40%), target role alignment (25%), experience level fit (15%), and location preferences.
            </p>
          </div>

          {onNavigateToProfile && (
            <button
              onClick={onNavigateToProfile}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md shadow-xs transition shrink-0"
            >
              <UserCheck className="w-4 h-4 text-[#D5B66D]" />
              <span>Update Career Preferences</span>
            </button>
          )}
        </div>
      </div>

      {/* Recommendations Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-5 rounded-md border border-[#E3E7E3] animate-pulse space-y-3">
                <div className="h-5 bg-[#EDF1EE] rounded w-2/3"></div>
                <div className="h-4 bg-[#EDF1EE] rounded w-1/2"></div>
                <div className="h-16 bg-[#EDF1EE] rounded"></div>
              </div>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-md border border-[#E3E7E3] p-10 text-center">
            <Sparkles className="w-10 h-10 text-[#286B59] mx-auto mb-2 opacity-60" />
            <h3 className="text-sm font-semibold text-[#202723]">No recommendations generated yet</h3>
            <p className="text-xs text-[#6B756F] mt-1">
              Set up your target roles, skills, and city in your Career Profile to receive tailored suggestions.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-md border border-[#E3E7E3] p-5 shadow-xs hover:border-[#286B59]/40 transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Match Score & Save */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#EBF3EF] text-[#286B59] border border-[#C5DCD0]">
                          {job.match_score ? `${job.match_score}% MATCH` : 'HIGH RELEVANCE'}
                        </span>
                        <span className="text-xs text-[#6B756F]">{job.city} • {job.work_mode}</span>
                      </div>
                      <h2 className="text-base font-bold text-[#1C2420] mt-1.5">
                        {job.title}
                      </h2>
                      <div className="text-xs font-medium text-[#404D45] mt-0.5">
                        {job.company_name}
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(job.id)}
                      className={`p-1.5 rounded transition ${
                        job.is_saved
                          ? 'bg-[#EBF3EF] text-[#286B59]'
                          : 'text-[#8A968F] hover:bg-[#F2F5F3] hover:text-[#202723]'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${job.is_saved ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Why it matches (Human-readable explanations) */}
                  {job.match_reasons && job.match_reasons.length > 0 && (
                    <div className="mt-3 p-3 bg-[#F8FAF8] rounded border border-[#E1E8E4] space-y-1">
                      <div className="text-[10px] font-bold text-[#286B59] uppercase tracking-wider">
                        Why this opportunity fits your profile
                      </div>
                      {job.match_reasons.map((reason, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-xs text-[#404B44]">
                          <CheckCircle2 className="w-3 h-3 text-[#286B59] shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Compensation & Experience */}
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="font-semibold text-[#286B59] flex items-center">
                      <IndianRupee className="w-3 h-3 mr-0.5" />
                      <span>{formatSalary(job.salary_min, job.salary_max, job.salary_disclosed)}</span>
                    </div>
                    <div className="text-[#6B756F]">
                      Exp: {job.experience_min}–{job.experience_max} yrs
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-[#F0F3F1] flex items-center justify-between">
                  <span className="text-[11px] text-[#7D8A82]">
                    Posted {job.source_name}
                  </span>

                  <div className="flex items-center space-x-2">
                    {onSelectJob && (
                      <button
                        onClick={() => onSelectJob(job.id)}
                        className="px-3 py-1.5 text-xs text-[#286B59] hover:bg-[#EBF3EF] rounded font-medium transition flex items-center space-x-1"
                      >
                        <span>Inspect Alignment</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <a
                      href={job.apply_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#286B59] hover:bg-[#1E5345] text-white text-xs font-medium rounded shadow-xs transition flex items-center space-x-1"
                    >
                      <span>Apply</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

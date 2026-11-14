const API_BASE = '/api';

export interface OverviewSummary {
  total_records: number;
  total_roles: number;
  total_skills: number;
  total_locations: number;
  median_annual_salary: number;
  mean_annual_salary: number;
  salary_p25: number;
  salary_p75: number;
  latest_dataset_period: string;
  is_synthetic: boolean;
  currency: string;
}

export interface SalaryFilterParams {
  role_id?: number | string;
  role_name?: string;
  city?: string;
  min_experience?: number | string;
  max_experience?: number | string;
  industry?: string;
  employment_type?: string;
  search?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface SalaryRecord {
  id: number;
  job_title: string;
  role_category: string;
  city: string;
  state: string;
  country: string;
  experience_years: number;
  industry: string;
  employment_type: string;
  skills: string[];
  original_salary: number;
  original_currency: string;
  compensation_period: string;
  normalized_annual_salary: number;
  normalized_currency: string;
  survey_year: number;
  is_synthetic: boolean;
}

export interface SalaryPaginatedResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  records: SalaryRecord[];
  analytics: {
    record_count: number;
    median: number;
    mean: number;
    p25: number;
    p75: number;
    min_val: number;
    max_val: number;
    currency: string;
    sample_reliability_warning?: string;
  };
}

export interface SkillRankItem {
  skill_name: string;
  category: string;
  frequency_count: number;
  percentage: number;
  median_salary: number;
  p25_salary: number;
  p75_salary: number;
}

export interface SkillComparisonProfile {
  profile_label: string;
  skills_required: string[];
  matching_records: number;
  median_salary: number;
  p25_salary: number;
  p75_salary: number;
  avg_experience: number;
  common_roles: string[];
  top_locations: string[];
}

export interface RoleOverview {
  id: number;
  canonical_title: string;
  category: string;
  description?: string;
  record_count: number;
  median_salary: number;
  p25_salary: number;
  p75_salary: number;
  min_salary: number;
  max_salary: number;
  common_skills: string[];
  typical_experience: string;
  top_locations: string[];
}

export interface RoleComparisonItem {
  id: number;
  title: string;
  category: string;
  record_count: number;
  median_salary: number;
  p25_salary: number;
  p75_salary: number;
  min_exp: number;
  max_exp: number;
  key_skills: Array<{ skill: string; frequency: number }>;
  top_cities: string[];
}

export interface LocationOverview {
  id: number;
  city: string;
  state: string;
  tier: string;
  record_count: number;
  median_salary: number;
  p25_salary: number;
  p75_salary: number;
  top_roles: string[];
  top_skills: string[];
  col_index: number;
}

export interface JobOffer {
  id: number;
  comparison_id: number;
  offer_name: string;
  company_name: string;
  role_title: string;
  location_name: string;
  work_mode: string;
  fixed_salary: number;
  variable_salary: number;
  joining_bonus: number;
  annual_benefits: number;
  monthly_deductions: number;
  monthly_rent: number;
  monthly_commute: number;
  other_monthly_expenses: number;
  financials: {
    fixed_annual: number;
    variable_annual: number;
    one_time_joining: number;
    annual_recurring_benefits: number;
    total_stated_ctc: number;
    recurring_gross_annual: number;
    monthly_gross_equivalent: number;
    estimated_annual_deductions: number;
    estimated_monthly_take_home: number;
    total_monthly_expenses: number;
    estimated_monthly_disposable: number;
  };
}

export interface OfferComparison {
  id: number;
  comparison_name: string;
  notes?: string;
  offers: JobOffer[];
}

export interface PredictionResult {
  predicted_annual_salary: number;
  predicted_monthly_salary: number;
  lower_bound_salary: number;
  upper_bound_salary: number;
  confidence_interval_percentage: number;
  currency: string;
  comparable_records_count: number;
  model_version: string;
  algorithm: string;
  feature_contributions: Array<{
    factor: string;
    importance_weight: number;
    active_in_profile: boolean;
  }>;
  disclaimer: string;
}

export interface CareerPlanSkill {
  id: number;
  career_plan_id: number;
  skill_name: string;
  category: string;
  priority: string;
  completion_status: string;
  order_index: number;
  target_date?: string;
  notes?: string;
}

export interface CareerPlan {
  id: number;
  current_role: string;
  target_role_id: number;
  target_role_title: string;
  target_date?: string;
  target_salary_expectation?: number;
  skills_possessed: string[];
  skills_gap: CareerPlanSkill[];
  completion_percentage: number;
}

export interface WatchlistItem {
  id: number;
  item_type: string;
  item_name: string;
  baseline_median_salary?: number;
  baseline_sample_count?: number;
  current_median_salary?: number;
  current_sample_count?: number;
  salary_change_pct?: number;
  created_at?: string;
}

export interface DatasetItem {
  id: number;
  dataset_name: string;
  source_name: string;
  licence: string;
  collection_period: string;
  record_count: number;
  is_synthetic: boolean;
  status: string;
  quality_score: number;
  imported_at: string;
}

export interface DatasetQuality {
  total_records: number;
  missing_fields_pct: number;
  duplicate_rows_count: number;
  outlier_salary_count: number;
  valid_salary_pct: number;
  currency_consistency_pct: number;
  provenance_status: string;
  overall_quality_score: number;
}

export const api = {
  // Overview
  getOverviewSummary: async (): Promise<OverviewSummary> => {
    const res = await fetch(`${API_BASE}/overview/summary`);
    return res.json();
  },
  getSalaryDistribution: async () => {
    const res = await fetch(`${API_BASE}/overview/salary-distribution`);
    return res.json();
  },
  getExperienceCompensation: async () => {
    const res = await fetch(`${API_BASE}/overview/experience-compensation`);
    return res.json();
  },
  getTopSkills: async (limit = 10) => {
    const res = await fetch(`${API_BASE}/overview/top-skills?limit=${limit}`);
    return res.json();
  },
  getCareerInsights: async () => {
    const res = await fetch(`${API_BASE}/overview/career-insights`);
    return res.json();
  },

  // Salaries
  getSalaries: async (params: SalaryFilterParams): Promise<SalaryPaginatedResponse> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/salaries?${query.toString()}`);
    return res.json();
  },
  getSalaryDistributionFiltered: async (params: SalaryFilterParams) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'page' && k !== 'page_size') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/salaries/distribution?${query.toString()}`);
    return res.json();
  },
  getSalaryByExperienceFiltered: async (params: SalaryFilterParams) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'page' && k !== 'page_size') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/salaries/by-experience?${query.toString()}`);
    return res.json();
  },
  getSalaryScatter: async (params: SalaryFilterParams) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'page' && k !== 'page_size') {
        query.append(k, String(v));
      }
    });
    const res = await fetch(`${API_BASE}/salaries/scatter?${query.toString()}`);
    return res.json();
  },

  // Skills
  getSkillRankings: async (category?: string, roleId?: number): Promise<SkillRankItem[]> => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    if (roleId) query.append('role_id', String(roleId));
    const res = await fetch(`${API_BASE}/skills/rankings?${query.toString()}`);
    return res.json();
  },
  compareSkills: async (profiles: string[][], roleFilter?: string, cityFilter?: string): Promise<SkillComparisonProfile[]> => {
    const res = await fetch(`${API_BASE}/skills/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profiles, role_filter: roleFilter, city_filter: cityFilter }),
    });
    return res.json();
  },
  getSkillCombinations: async (topN = 15) => {
    const res = await fetch(`${API_BASE}/skills/combinations?top_n=${topN}`);
    return res.json();
  },

  // Roles
  getRoles: async (category?: string): Promise<RoleOverview[]> => {
    const url = category && category !== 'All' ? `${API_BASE}/roles?category=${encodeURIComponent(category)}` : `${API_BASE}/roles`;
    const res = await fetch(url);
    return res.json();
  },
  getRoleDetail: async (roleId: number) => {
    const res = await fetch(`${API_BASE}/roles/${roleId}`);
    return res.json();
  },
  compareRoles: async (roleIds: number[]) => {
    const res = await fetch(`${API_BASE}/roles/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_ids: roleIds }),
    });
    return res.json();
  },

  // Locations
  getLocations: async (): Promise<LocationOverview[]> => {
    const res = await fetch(`${API_BASE}/locations`);
    return res.json();
  },
  compareLocations: async (cities: string[]) => {
    const res = await fetch(`${API_BASE}/locations/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cities }),
    });
    return res.json();
  },

  // Offer Studio
  getOffers: async (comparisonId?: number): Promise<OfferComparison> => {
    const url = comparisonId ? `${API_BASE}/offers?comparison_id=${comparisonId}` : `${API_BASE}/offers`;
    const res = await fetch(url);
    return res.json();
  },
  addOffer: async (offerData: any, comparisonId?: number): Promise<JobOffer> => {
    const url = comparisonId ? `${API_BASE}/offers?comparison_id=${comparisonId}` : `${API_BASE}/offers`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData),
    });
    return res.json();
  },
  updateOffer: async (offerId: number, offerData: any): Promise<JobOffer> => {
    const res = await fetch(`${API_BASE}/offers/${offerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(offerData),
    });
    return res.json();
  },
  deleteOffer: async (offerId: number) => {
    const res = await fetch(`${API_BASE}/offers/${offerId}`, { method: 'DELETE' });
    return res.json();
  },

  // Predictions (Salary Estimator)
  predictSalary: async (payload: {
    role_title: string;
    experience_years: number;
    city: string;
    skills: string[];
    industry?: string;
    employment_type?: string;
  }): Promise<PredictionResult> => {
    const res = await fetch(`${API_BASE}/predictions/salary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  getModelInfo: async () => {
    const res = await fetch(`${API_BASE}/predictions/model-info`);
    return res.json();
  },
  getModelEvaluation: async () => {
    const res = await fetch(`${API_BASE}/predictions/evaluation`);
    return res.json();
  },

  // Career Planner
  getCareerPlan: async (planId?: number): Promise<CareerPlan> => {
    const url = planId ? `${API_BASE}/career-plans?plan_id=${planId}` : `${API_BASE}/career-plans`;
    const res = await fetch(url);
    return res.json();
  },
  createCareerPlan: async (payload: any): Promise<CareerPlan> => {
    const res = await fetch(`${API_BASE}/career-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  updateCareerSkillStatus: async (skillId: number, status: string, notes?: string) => {
    const res = await fetch(`${API_BASE}/career-plans/skills/${skillId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.json();
  },
  addCareerCustomSkill: async (planId: number, payload: any) => {
    const res = await fetch(`${API_BASE}/career-plans/${planId}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  deleteCareerSkill: async (skillId: number) => {
    const res = await fetch(`${API_BASE}/career-plans/skills/${skillId}`, { method: 'DELETE' });
    return res.json();
  },

  // Market Watch
  getWatchlists: async (): Promise<WatchlistItem[]> => {
    const res = await fetch(`${API_BASE}/watchlists`);
    return res.json();
  },
  addWatchlist: async (payload: { item_type: string; item_name: string }) => {
    const res = await fetch(`${API_BASE}/watchlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },
  removeWatchlist: async (itemId: number) => {
    const res = await fetch(`${API_BASE}/watchlists/${itemId}`, { method: 'DELETE' });
    return res.json();
  },

  // Datasets
  getDatasets: async (): Promise<DatasetItem[]> => {
    const res = await fetch(`${API_BASE}/datasets`);
    return res.json();
  },
  getDatasetQuality: async (datasetId?: number): Promise<DatasetQuality> => {
    const url = datasetId ? `${API_BASE}/datasets/quality?dataset_id=${datasetId}` : `${API_BASE}/datasets/quality`;
    const res = await fetch(url);
    return res.json();
  },
  uploadDatasetCsv: async (file: File, isSynthetic = true) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('is_synthetic', String(isSynthetic));
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  // --- India-First Job Discovery & Activity ---
  searchJobs: async (params: JobSearchParams): Promise<PaginatedJobsResponse> => {
    const query = new URLSearchParams();
    if (params.query) query.append('query', params.query);
    if (params.role) query.append('role', params.role);
    if (params.city && params.city !== 'All Cities') query.append('city', params.city);
    if (params.skills) query.append('skills', params.skills);
    if (params.experience_level) query.append('experience_level', params.experience_level);
    if (params.work_mode && params.work_mode !== 'All Modes') query.append('work_mode', params.work_mode);
    if (params.employment_type && params.employment_type !== 'All Types') query.append('employment_type', params.employment_type);
    if (params.salary_disclosed_only) query.append('salary_disclosed_only', 'true');
    if (params.min_salary) query.append('min_salary', String(params.min_salary));
    if (params.freshness_days) query.append('freshness_days', String(params.freshness_days));
    if (params.page) query.append('page', String(params.page));
    if (params.page_size) query.append('page_size', String(params.page_size));
    if (params.sort_by) query.append('sort_by', params.sort_by);

    const res = await fetch(`${API_BASE}/jobs/search?${query.toString()}`);
    return res.json();
  },

  getJobFilterMetadata: async () => {
    const res = await fetch(`${API_BASE}/jobs/filters/metadata`);
    return res.json();
  },

  getJobDetail: async (jobId: number): Promise<JobDetail> => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}`);
    return res.json();
  },

  toggleSaveJob: async (jobId: number): Promise<{ job_id: number; is_saved: boolean; message: string }> => {
    const res = await fetch(`${API_BASE}/jobs/${jobId}/save`, { method: 'POST' });
    return res.json();
  },

  getRecommendedJobs: async (limit = 20): Promise<JobListing[]> => {
    const res = await fetch(`${API_BASE}/jobs/recommended?limit=${limit}`);
    return res.json();
  },

  getCareerProfile: async (): Promise<CareerProfile> => {
    const res = await fetch(`${API_BASE}/career-profile`);
    return res.json();
  },

  updateCareerProfile: async (profile: Partial<CareerProfile>): Promise<CareerProfile> => {
    const res = await fetch(`${API_BASE}/career-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    return res.json();
  },

  getSavedJobs: async (): Promise<SavedJobItem[]> => {
    const res = await fetch(`${API_BASE}/my-activity/saved`);
    return res.json();
  },

  getApplications: async (): Promise<JobApplicationItem[]> => {
    const res = await fetch(`${API_BASE}/my-activity/applications`);
    return res.json();
  },

  trackApplication: async (payload: { job_id: number; status: string; company_name: string; job_title: string; notes?: string }): Promise<JobApplicationItem> => {
    const res = await fetch(`${API_BASE}/my-activity/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  updateApplicationStatus: async (applicationId: number, payload: { status: string; notes?: string; interview_date?: string; offered_salary?: number }): Promise<JobApplicationItem> => {
    const res = await fetch(`${API_BASE}/my-activity/applications/${applicationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getJobAlerts: async (): Promise<JobAlertItem[]> => {
    const res = await fetch(`${API_BASE}/my-activity/alerts`);
    return res.json();
  },

  createJobAlert: async (payload: { alert_title: string; role_keywords?: string; skills?: string[]; city?: string; min_salary?: number }): Promise<JobAlertItem> => {
    const res = await fetch(`${API_BASE}/my-activity/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  getNotifications: async (): Promise<JobNotificationItem[]> => {
    const res = await fetch(`${API_BASE}/my-activity/notifications`);
    return res.json();
  },
};

// --- Job Discovery Interfaces ---
export interface JobListing {
  id: number;
  source_id?: number;
  source_name: string;
  title: string;
  company_name: string;
  company_logo_url?: string;
  city: string;
  state?: string;
  country: string;
  is_remote_eligible_india: boolean;
  work_mode: string;
  employment_type: string;
  experience_min: number;
  experience_max: number;
  salary_disclosed: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  skills_raw: string[];
  apply_url: string;
  posted_at: string;
  is_active: boolean;
  is_synthetic: boolean;
  is_saved: boolean;
  application_status?: string;
  match_score?: number;
  match_reasons?: string[];
}

export interface SalaryBenchmarkComparison {
  has_benchmark: boolean;
  canonical_role?: string;
  benchmark_median?: number;
  benchmark_p25?: number;
  benchmark_p75?: number;
  sample_count: number;
  advertised_midpoint?: number;
  comparison_percentage?: number;
  comparison_text: string;
}

export interface SkillAlignmentResult {
  matching_skills: string[];
  missing_required_skills: string[];
  missing_preferred_skills: string[];
  match_percentage: number;
}

export interface JobDetail extends JobListing {
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: Array<{ id: number; skill_name: string; skill_type: string }>;
  salary_benchmark?: SalaryBenchmarkComparison;
  skill_alignment?: SkillAlignmentResult;
}

export interface JobSearchParams {
  query?: string;
  role?: string;
  city?: string;
  skills?: string;
  experience_level?: string;
  min_experience?: number;
  max_experience?: number;
  work_mode?: string;
  employment_type?: string;
  salary_disclosed_only?: boolean;
  min_salary?: number;
  freshness_days?: number;
  page?: number;
  page_size?: number;
  sort_by?: string;
}

export interface PaginatedJobsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: JobListing[];
}

export interface CareerProfile {
  id: number;
  user_id: string;
  profile_title: string;
  candidate_type: string;
  target_roles: string[];
  primary_skills: string[];
  secondary_skills: string[];
  experience_years: number;
  current_city: string;
  preferred_cities: string[];
  preferred_work_modes: string[];
  preferred_employment_types: string[];
  min_expected_salary: number;
  education_degree?: string;
  graduation_year?: number;
  updated_at: string;
}

export interface SavedJobItem {
  id: number;
  job_id: number;
  created_at: string;
  notes?: string;
  job: JobListing;
}

export interface JobApplicationItem {
  id: number;
  job_id: number;
  status: string;
  company_name: string;
  job_title: string;
  applied_date: string;
  interview_date?: string;
  offered_salary?: number;
  notes?: string;
  updated_at: string;
  job?: JobListing;
}

export interface JobAlertItem {
  id: number;
  alert_title: string;
  role_keywords?: string;
  skills: string[];
  city?: string;
  work_mode?: string;
  min_salary?: number;
  frequency: string;
  is_active: boolean;
  created_at: string;
}

export interface JobNotificationItem {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  job_id?: number;
  alert_id?: number;
}


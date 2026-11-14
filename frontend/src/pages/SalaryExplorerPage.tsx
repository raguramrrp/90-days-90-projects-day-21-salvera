import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ScatterChart, Scatter, ZAxis, Cell 
} from 'recharts';
import { 
  Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, 
  AlertTriangle, CheckCircle2, Search, RefreshCw 
} from 'lucide-react';
import { api, SalaryRecord, SalaryFilterParams } from '../services/api';

interface SalaryExplorerPageProps {
  initialFilters?: SalaryFilterParams;
}

export const SalaryExplorerPage: React.FC<SalaryExplorerPageProps> = ({ initialFilters }) => {
  const [params, setParams] = useState<SalaryFilterParams>({
    role_name: initialFilters?.role_name || '',
    city: initialFilters?.city || '',
    industry: initialFilters?.industry || '',
    employment_type: initialFilters?.employment_type || '',
    min_experience: initialFilters?.min_experience || '',
    max_experience: initialFilters?.max_experience || '',
    search: initialFilters?.search || '',
    page: 1,
    page_size: 25,
    sort_by: 'normalized_annual_salary',
    sort_order: 'desc',
  });

  const [data, setData] = useState<{
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    records: SalaryRecord[];
    analytics: any;
  } | null>(null);

  const [distribution, setDistribution] = useState<any[]>([]);
  const [expData, setExpData] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize initialFilters prop when navigating from Overview or Global Search
  useEffect(() => {
    if (initialFilters) {
      setParams(prev => {
        const next = {
          ...prev,
          role_name: initialFilters.role_name !== undefined ? initialFilters.role_name : prev.role_name,
          city: initialFilters.city !== undefined ? initialFilters.city : prev.city,
          industry: initialFilters.industry !== undefined ? initialFilters.industry : prev.industry,
          employment_type: initialFilters.employment_type !== undefined ? initialFilters.employment_type : prev.employment_type,
          search: initialFilters.search !== undefined ? initialFilters.search : prev.search,
          page: 1,
        };
        fetchSalaryData(next);
        return next;
      });
    }
  }, [initialFilters]);

  // Common filter options
  const roles = [
    'All Roles', 'Data Analyst', 'Business Analyst', 'Data Scientist', 
    'Business Intelligence Analyst', 'Data Engineer', 'Python Developer', 
    'Java Developer', 'Frontend Developer', 'Backend Developer', 
    'Full Stack Developer', 'Software Engineer', 'Machine Learning Engineer', 
    'AI Engineer', 'Deep Learning Engineer', 'Computer Vision Engineer', 
    'QA Engineer', 'Software Test Engineer', 'Cybersecurity Analyst', 
    'Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer'
  ];

  const cities = ['All Cities', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Coimbatore'];
  const industries = ['All Industries', 'Information Technology', 'Fintech', 'E-commerce', 'Healthcare Tech', 'Enterprise Software', 'EdTech', 'Consulting'];
  const employmentTypes = ['All Types', 'Full-time', 'Contract', 'Remote'];

  const fetchSalaryData = async (activeParams?: SalaryFilterParams) => {
    try {
      setLoading(true);
      const queryParams = { ...(activeParams || params) };
      if (queryParams.role_name === 'All Roles') queryParams.role_name = '';
      if (queryParams.city === 'All Cities') queryParams.city = '';
      if (queryParams.industry === 'All Industries') queryParams.industry = '';
      if (queryParams.employment_type === 'All Types') queryParams.employment_type = '';

      const [pagedRes, distRes, expRes, scatRes] = await Promise.all([
        api.getSalaries(queryParams),
        api.getSalaryDistributionFiltered(queryParams),
        api.getSalaryByExperienceFiltered(queryParams),
        api.getSalaryScatter(queryParams),
      ]);
      setData(pagedRes);
      setDistribution(distRes);
      setExpData(expRes);
      setScatterData(scatRes);
    } catch (err) {
      console.error('Failed to fetch salary data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryData();
  }, [params.page, params.sort_by, params.sort_order]);

  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = { ...params, page: 1 };
    setParams(updated);
    fetchSalaryData(updated);
  };

  const handleRelaxFilters = () => {
    // Keep primary role and city, relax secondary criteria
    const relaxed: SalaryFilterParams = {
      ...params,
      industry: '',
      employment_type: '',
      min_experience: '',
      max_experience: '',
      search: '',
      page: 1,
    };
    setParams(relaxed);
    fetchSalaryData(relaxed);
  };

  const handleResetFilters = () => {
    const resetState: SalaryFilterParams = {
      role_name: '',
      city: '',
      industry: '',
      employment_type: '',
      min_experience: '',
      max_experience: '',
      search: '',
      page: 1,
      page_size: 25,
      sort_by: 'normalized_annual_salary',
      sort_order: 'desc',
    };
    setParams(resetState);
    fetchSalaryData(resetState);
  };

  const handleExportCsv = () => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && k !== 'page' && k !== 'page_size') {
        q.append(k, String(v));
      }
    });
    window.open(`/api/salaries/export-csv?${q.toString()}`, '_blank');
  };

  const hasActiveFilters = Boolean(
    (params.role_name && params.role_name !== 'All Roles') ||
    (params.city && params.city !== 'All Cities') ||
    (params.industry && params.industry !== 'All Industries') ||
    (params.employment_type && params.employment_type !== 'All Types') ||
    params.min_experience ||
    params.max_experience ||
    params.search
  );

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Title & Export Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2D9] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Salary Explorer</h1>
            <p className="text-xs text-[#707B75] mt-0.5">
              Query normalized compensation distributions, quartile bands, and individual survey records.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#172B2A] rounded-md text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#B66B45]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <form onSubmit={handleApplyFilters} className="bg-white p-4 rounded-md border border-[#E2E2D9] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#172B2A] border-b border-[#E2E2D9]/60 pb-2">
            <div className="flex items-center space-x-1.5">
              <Filter className="w-3.5 h-3.5 text-[#B66B45]" />
              <span>Analytics Filter Controls</span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-[#707B75] hover:text-[#172B2A] flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">Standardized Role</label>
              <select
                value={params.role_name}
                onChange={(e) => setParams({ ...params, role_name: e.target.value })}
                className="w-full p-1.5 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
              >
                {roles.map(r => <option key={r} value={r === 'All Roles' ? '' : r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">City / Location</label>
              <select
                value={params.city}
                onChange={(e) => setParams({ ...params, city: e.target.value })}
                className="w-full p-1.5 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
              >
                {cities.map(c => <option key={c} value={c === 'All Cities' ? '' : c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">Industry Sector</label>
              <select
                value={params.industry}
                onChange={(e) => setParams({ ...params, industry: e.target.value })}
                className="w-full p-1.5 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
              >
                {industries.map(i => <option key={i} value={i === 'All Industries' ? '' : i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">Employment Mode</label>
              <select
                value={params.employment_type}
                onChange={(e) => setParams({ ...params, employment_type: e.target.value })}
                className="w-full p-1.5 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
              >
                {employmentTypes.map(t => <option key={t} value={t === 'All Types' ? '' : t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">Min Exp (Yrs)</label>
              <input
                type="number"
                placeholder="e.g. 0"
                value={params.min_experience}
                onChange={(e) => setParams({ ...params, min_experience: e.target.value })}
                className="w-full p-1.5 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">Max Exp (Yrs)</label>
              <input
                type="number"
                placeholder="e.g. 15"
                value={params.max_experience}
                onChange={(e) => setParams({ ...params, max_experience: e.target.value })}
                className="w-full p-1.5 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[#707B75] font-medium mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Python, SQL..."
                  value={params.search || ''}
                  onChange={(e) => setParams({ ...params, search: e.target.value })}
                  className="w-full p-1.5 pl-6 border border-[#E2E2D9] rounded text-[#202B29] bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] outline-hidden"
                />
                <Search className="w-3 h-3 text-[#707B75] absolute left-2 top-2.5" />
              </div>
            </div>
          </div>

        {/* Active Filter Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-[#E2E2D9]/60 text-[11px]">
            <span className="text-[#707B75] font-medium mr-1">Active Criteria:</span>
            {params.role_name && params.role_name !== 'All Roles' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9]">
                Role: {params.role_name}
                <button type="button" onClick={() => { const u = { ...params, role_name: '' }; setParams(u); fetchSalaryData(u); }} className="ml-1 hover:text-[#B66B45]">×</button>
              </span>
            )}
            {params.city && params.city !== 'All Cities' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9]">
                City: {params.city}
                <button type="button" onClick={() => { const u = { ...params, city: '' }; setParams(u); fetchSalaryData(u); }} className="ml-1 hover:text-[#B66B45]">×</button>
              </span>
            )}
            {params.industry && params.industry !== 'All Industries' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9]">
                Industry: {params.industry}
                <button type="button" onClick={() => { const u = { ...params, industry: '' }; setParams(u); fetchSalaryData(u); }} className="ml-1 hover:text-[#B66B45]">×</button>
              </span>
            )}
            {params.employment_type && params.employment_type !== 'All Types' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9]">
                Type: {params.employment_type}
                <button type="button" onClick={() => { const u = { ...params, employment_type: '' }; setParams(u); fetchSalaryData(u); }} className="ml-1 hover:text-[#B66B45]">×</button>
              </span>
            )}
            {(params.min_experience || params.max_experience) && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9]">
                Exp: {params.min_experience || 0} - {params.max_experience || 15} yrs
                <button type="button" onClick={() => { const u = { ...params, min_experience: '', max_experience: '' }; setParams(u); fetchSalaryData(u); }} className="ml-1 hover:text-[#B66B45]">×</button>
              </span>
            )}
            {params.search && (
              <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9]">
                Keyword: "{params.search}"
                <button type="button" onClick={() => { const u = { ...params, search: '' }; setParams(u); fetchSalaryData(u); }} className="ml-1 hover:text-[#B66B45]">×</button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] text-[#B66B45] hover:underline ml-1 font-medium"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md transition shadow-xs"
          >
            Apply Query Filters
          </button>
        </div>
      </form>

      {/* Analytical Summary Cards */}
      {data?.analytics && (
        <div className="space-y-2">
          {data.analytics.sample_reliability_warning && (
            <div className="p-2.5 rounded-md bg-[#FAF5EB] border border-[#ECD9BA] text-xs text-[#825215] flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B66B45]" />
              <span>{data.analytics.sample_reliability_warning}</span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Sample Size (N)</div>
              <div className="text-lg font-bold text-[#172B2A] mt-0.5 tabular-nums font-mono">{data.analytics.record_count.toLocaleString()}</div>
            </div>
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#172B2A]">Median (P50)</div>
              <div className="text-lg font-extrabold text-[#172B2A] mt-0.5 tabular-nums font-mono">₹{(data.analytics.median / 100000).toFixed(1)} LPA</div>
            </div>
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">25th Percentile</div>
              <div className="text-lg font-bold text-[#202B29] mt-0.5 tabular-nums font-mono">₹{(data.analytics.p25 / 100000).toFixed(1)} LPA</div>
            </div>
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">75th Percentile</div>
              <div className="text-lg font-bold text-[#B66B45] mt-0.5 tabular-nums font-mono">₹{(data.analytics.p75 / 100000).toFixed(1)} LPA</div>
            </div>
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Arithmetic Mean</div>
              <div className="text-lg font-bold text-[#202B29] mt-0.5 tabular-nums font-mono">₹{(data.analytics.mean / 100000).toFixed(1)} LPA</div>
            </div>
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Minimum Observed</div>
              <div className="text-lg font-bold text-[#202B29] mt-0.5 tabular-nums font-mono">₹{(data.analytics.min_val / 100000).toFixed(1)} LPA</div>
            </div>
            <div className="bg-white p-3 rounded-md border border-[#E2E2D9] shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Maximum Observed</div>
              <div className="text-lg font-bold text-[#B66B45] mt-0.5 tabular-nums font-mono">₹{(data.analytics.max_val / 100000).toFixed(1)} LPA</div>
            </div>
          </div>
        </div>
      )}

      {/* Visualizations Grid — Tiered Color System & Rich Tooltips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Histogram */}
        <div className="bg-white p-5 rounded-md border border-[#E2E2D9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#172B2A] tracking-tight">Filtered Salary Frequency Distribution</h3>
              <span className="text-[10px] text-[#707B75] font-mono">Binned by ₹ LPA</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] mt-2 pb-2 border-b border-[#E2E2D9]/60">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#648C7A]"></span>
                <span className="text-[#707B75]">Entry Tier</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#172B2A]"></span>
                <span className="text-[#172B2A] font-semibold">Core Median</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#B66B45]"></span>
                <span className="text-[#B66B45] font-semibold">Upper Quartile</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D5B66D]"></span>
                <span className="text-[#707B75]">Elite Tier</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D9" vertical={false} />
                <XAxis dataKey="bin_range" tick={{ fontSize: 9, fill: '#707B75', fontFamily: 'monospace' }} />
                <YAxis tick={{ fontSize: 9, fill: '#707B75' }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} records`, 'Observation Count']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E2D9', fontSize: 11, borderRadius: 6, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {distribution.map((_, index) => (
                    <Cell 
                      key={`explorer-cell-${index}`} 
                      fill={index < 2 ? '#648C7A' : index < 4 ? '#172B2A' : index < 6 ? '#B66B45' : '#D5B66D'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Experience vs Salary Scatter Plot */}
        <div className="bg-white p-5 rounded-md border border-[#E2E2D9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#172B2A] tracking-tight">Experience vs Annual Compensation Scatter</h3>
              <span className="text-[10px] text-[#707B75] font-mono">N = {scatterData.length} observations</span>
            </div>
            <div className="flex items-center space-x-3 text-[10px] mt-2 pb-2 border-b border-[#E2E2D9]/60">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#648C7A]"></span>
                <span className="text-[#707B75]">&lt; ₹15L</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#172B2A]"></span>
                <span className="text-[#172B2A] font-semibold">₹15L-30L</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#B66B45]"></span>
                <span className="text-[#B66B45] font-semibold">₹30L-50L</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-[#D5B66D]"></span>
                <span className="text-[#707B75]">&gt; ₹50L</span>
              </span>
            </div>
          </div>

          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D9" />
                <XAxis type="number" dataKey="experience" name="Experience" unit=" yrs" tick={{ fontSize: 9, fill: '#707B75' }} />
                <YAxis type="number" dataKey="salary_lpa" name="Salary" unit="L" tick={{ fontSize: 9, fill: '#707B75' }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [name === 'Salary' ? `₹${value} LPA` : `${value} yrs`, name]}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E2D9', fontSize: 11, borderRadius: 6, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell 
                      key={`scatter-pt-${index}`}
                      fill={entry.salary_lpa > 50 ? '#D5B66D' : entry.salary_lpa > 30 ? '#B66B45' : entry.salary_lpa > 15 ? '#172B2A' : '#648C7A'}
                      fillOpacity={0.7}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Zero Results Guidance Card */}
      {data?.total === 0 && (
        <div className="bg-white rounded-md border border-[#ECD9BA] bg-[#FAF8F5] p-6 text-center space-y-3 shadow-xs">
          <div className="inline-flex p-2.5 bg-[#F5EBD9] rounded-full text-[#B66B45]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-[#172B2A]">No Exact Records Match All Selected Criteria</h3>
            <p className="text-xs text-[#707B75]">
              Your filter combination is very specific for this dataset slice. You can broaden your query by resetting secondary criteria while keeping your core role and location.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleRelaxFilters}
              className="px-3.5 py-1.5 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md transition shadow-xs"
            >
              Broaden Query (Keep Role & City)
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#172B2A] text-xs font-medium rounded-md transition"
            >
              Reset All Filters
            </button>
          </div>
        </div>
      )}

      {/* Salary Records Table */}
      <div className="bg-white rounded-md border border-[#E2E2D9] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E2D9] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#172B2A] tracking-tight">Granular Salary Records</h3>
            <p className="text-[11px] text-[#707B75]">Showing page {data?.page} of {data?.total_pages} ({data?.total.toLocaleString()} total matching records)</p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[#707B75]">Sort:</span>
            <button
              onClick={() => setParams({ ...params, sort_order: params.sort_order === 'asc' ? 'desc' : 'asc' })}
              className="flex items-center space-x-1 px-2.5 py-1 bg-[#F3EFE6]/60 border border-[#E2E2D9] rounded-md text-[#172B2A] hover:bg-[#F3EFE6]"
            >
              <span>{params.sort_order === 'asc' ? 'Lowest First' : 'Highest First'}</span>
              <ArrowUpDown className="w-3 h-3 text-[#707B75]" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F3EFE6]/70 text-[#172B2A] border-b border-[#E2E2D9] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Job Title & Category</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Experience</th>
                <th className="py-2.5 px-3">Industry</th>
                <th className="py-2.5 px-3">Key Skills</th>
                <th className="py-2.5 px-3 text-right">Annual Salary (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E2D9]/60">
              {data?.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#707B75]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertTriangle className="w-5 h-5 text-[#B66B45]" />
                      <span className="font-semibold text-[#172B2A]">No records found matching current query criteria</span>
                      <span className="text-[11px] text-[#707B75]">Click "Broaden Query" to relax secondary filters while preserving your primary role.</span>
                      <div className="pt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={handleRelaxFilters}
                          className="px-3 py-1 bg-[#172B2A] text-white rounded-md text-xs hover:bg-[#254240] transition"
                        >
                          Broaden Query
                        </button>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-3 py-1 bg-white border border-[#E2E2D9] text-[#172B2A] rounded-md text-xs hover:bg-[#F3EFE6] transition"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.records.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F3EFE6]/30 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#172B2A]">{r.job_title}</div>
                      <div className="text-[10px] text-[#707B75]">{r.role_category}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-[#202B29]">{r.city}</div>
                      <div className="text-[10px] text-[#707B75]">{r.employment_type}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#172B2A]">{r.experience_years.toFixed(1)} yrs</td>
                    <td className="py-2.5 px-3 text-[#707B75]">{r.industry}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {r.skills.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="bg-[#F3EFE6] text-[#172B2A] px-1.5 py-0.5 rounded text-[10px] border border-[#E2E2D9]">
                            {s}
                          </span>
                        ))}
                        {r.skills.length > 4 && (
                          <span className="text-[10px] text-[#707B75]">+{r.skills.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="font-bold text-[#172B2A] tabular-nums font-mono">₹{(r.normalized_annual_salary / 100000).toFixed(2)} LPA</div>
                      <div className="text-[10px] text-[#707B75] tabular-nums font-mono">₹{Math.round(r.normalized_annual_salary / 12).toLocaleString()}/mo</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#E2E2D9] bg-[#F3EFE6]/40 flex items-center justify-between text-xs text-[#707B75]">
          <div>
            Showing {(params.page! - 1) * params.page_size! + 1} - {Math.min(params.page! * params.page_size!, data?.total || 0)} of {data?.total}
          </div>
          <div className="flex items-center space-x-1">
            <button
              disabled={params.page === 1}
              onClick={() => setParams({ ...params, page: Math.max(1, params.page! - 1) })}
              className="p-1.5 border border-[#E2E2D9] rounded-md bg-white hover:bg-[#F3EFE6] disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-[#172B2A]">
              Page {data?.page} of {data?.total_pages}
            </span>
            <button
              disabled={params.page === data?.total_pages}
              onClick={() => setParams({ ...params, page: Math.min(data?.total_pages || 1, params.page! + 1) })}
              className="p-1.5 border border-[#E2E2D9] rounded-md bg-white hover:bg-[#F3EFE6] disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

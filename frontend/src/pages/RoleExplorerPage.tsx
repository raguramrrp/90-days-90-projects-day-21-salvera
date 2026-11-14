import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, CheckSquare, Square, Download, ChevronRight, 
  MapPin, Clock, ArrowRight, Layers, Search, Filter, 
  ArrowUpDown, X, ExternalLink, BarChart2, Sparkles, 
  Check, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { api, RoleOverview, RoleComparisonItem, OverviewSummary } from '../services/api';

export const RoleExplorerPage: React.FC = () => {
  const [roles, setRoles] = useState<RoleOverview[]>([]);
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'records' | 'salary_desc' | 'salary_asc' | 'title'>('records');
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([1, 2, 3]);
  const [comparisonData, setComparisonData] = useState<RoleComparisonItem[]>([]);
  const [isComparisonExpanded, setIsComparisonExpanded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [inspectingRole, setInspectingRole] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const categories = [
    'All',
    'Data & Analytics',
    'Software Development',
    'AI & ML',
    'Quality & Security',
    'Infrastructure'
  ];

  // Fetch roles and market context metrics
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [rolesRes, sumRes] = await Promise.all([
          api.getRoles(selectedCategory),
          api.getOverviewSummary()
        ]);
        setRoles(rolesRes);
        setSummary(sumRes);
      } catch (err) {
        console.error('Failed to load role intelligence data', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [selectedCategory]);

  // Fetch comparison data when selected roles change
  useEffect(() => {
    const fetchComparison = async () => {
      if (selectedRoleIds.length === 0) {
        setComparisonData([]);
        return;
      }
      try {
        const res = await api.compareRoles(selectedRoleIds);
        setComparisonData(res);
      } catch (err) {
        console.error('Failed to compare roles', err);
      }
    };
    fetchComparison();
  }, [selectedRoleIds]);

  const toggleRoleSelection = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedRoleIds.includes(id)) {
      setSelectedRoleIds(prev => prev.filter(rId => rId !== id));
    } else {
      if (selectedRoleIds.length < 4) {
        setSelectedRoleIds(prev => [...prev, id]);
      }
    }
  };

  const openRoleInspector = async (roleId: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setLoadingDetail(true);
      const detail = await api.getRoleDetail(roleId);
      setInspectingRole(detail);
    } catch (err) {
      console.error('Failed to load role detail', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/roles/export-csv', '_blank');
  };

  // Filter and sort roles
  const filteredAndSortedRoles = useMemo(() => {
    let result = [...roles];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(r => 
        r.canonical_title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        r.common_skills.some(s => s.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sortBy === 'records') return b.record_count - a.record_count;
      if (sortBy === 'salary_desc') return b.median_salary - a.median_salary;
      if (sortBy === 'salary_asc') return a.median_salary - b.median_salary;
      if (sortBy === 'title') return a.canonical_title.localeCompare(b.canonical_title);
      return 0;
    });

    return result;
  }, [roles, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-sans text-[#202B29]">
        
        {/* 1. Page Introduction Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2D9] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#172B2A]">
              Technology Role Intelligence
            </h1>
            <p className="text-xs text-[#707B75] mt-0.5">
              Explore compensation benchmarks, role requirements and the skills associated with technology careers.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#172B2A] rounded-md text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#B66B45]" />
              <span>Export Roles CSV</span>
            </button>
          </div>
        </div>

      {/* 2. Compact Market Context Strip (Actual Backend Values) */}
      <div className="bg-white border border-[#E1E7E2] rounded-md shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#E1E7E2] text-xs">
          <div className="p-3 sm:px-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E]">Roles Indexed</div>
            <div className="text-base font-bold text-[#202923] mt-0.5">
              {summary ? summary.total_roles : roles.length} Standardized Roles
            </div>
          </div>
          <div className="p-3 sm:px-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E]">Salary Observations</div>
            <div className="text-base font-bold text-[#202923] mt-0.5">
              {summary ? summary.total_records.toLocaleString() : '5,292'} Verified Records
            </div>
          </div>
          <div className="p-3 sm:px-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E]">Skills Mapped</div>
            <div className="text-base font-bold text-[#202923] mt-0.5">
              {summary ? summary.total_skills : '85'} Technical Skills
            </div>
          </div>
          <div className="p-3 sm:px-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E]">Dataset Period</div>
            <div className="text-base font-bold text-[#202923] mt-0.5">
              {summary ? summary.latest_dataset_period : '2024–2025'} Corpus
            </div>
          </div>
          <div className="p-3 sm:px-4 col-span-2 sm:col-span-4 lg:col-span-1 bg-[#FAFBF9]">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[#286B59]">Benchmark Region</div>
            <div className="text-base font-bold text-[#286B59] mt-0.5">
              India Tech Hubs (₹ INR)
            </div>
          </div>
        </div>
      </div>

      {/* 3. Role Comparison Workspace (Compact Dock & Expandable Matrix) */}
      {selectedRoleIds.length > 0 && (
        <div className="bg-white border border-[#286B59]/30 rounded-md shadow-xs overflow-hidden transition">
          {/* Compact Control Strip */}
          <div className="p-3 bg-[#F0F5F2] border-b border-[#D8E4DC] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-[#286B59] flex items-center space-x-1.5 mr-1">
                <CheckSquare className="w-4 h-4 text-[#286B59]" />
                <span>Comparison Studio ({selectedRoleIds.length}/4 Selected):</span>
              </span>
              {comparisonData.map(cr => (
                <span 
                  key={cr.id} 
                  className="inline-flex items-center px-2 py-1 rounded bg-white text-[#202923] border border-[#CCD4CF] text-[11px] font-medium shadow-2xs"
                >
                  <span>{cr.title}</span>
                  <button 
                    onClick={() => toggleRoleSelection(cr.id)} 
                    className="ml-1.5 text-[#8E9991] hover:text-[#B64E49] transition"
                    title="Remove from comparison"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedRoleIds.length < 4 && (
                <span className="text-[11px] text-[#69756E] italic">
                  (select up to {4 - selectedRoleIds.length} more from the directory)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsComparisonExpanded(prev => !prev)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#286B59] hover:bg-[#1E5345] text-white rounded text-xs font-medium transition shadow-xs"
              >
                <span>{isComparisonExpanded ? 'Collapse Matrix' : 'View Comparison Matrix'}</span>
                {isComparisonExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setSelectedRoleIds([])}
                className="px-2.5 py-1 text-xs text-[#69756E] hover:text-[#B64E49] transition"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Expanded Side-by-Side Comparison Matrix */}
          {isComparisonExpanded && (
            <div className="p-4 sm:p-5 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#E1E7E2]">
                    <th className="py-2.5 px-3 font-semibold text-[#69756E] uppercase tracking-wider text-[10px] w-48 bg-[#FAFBFA]">
                      Benchmark Dimension
                    </th>
                    {comparisonData.map(cr => (
                      <th key={cr.id} className="py-2.5 px-4 font-bold text-[#202923] border-l border-[#E1E7E2]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-[#202923]">{cr.title}</div>
                            <span className="text-[10px] uppercase font-semibold text-[#286B59] bg-[#E8F0EB] px-1.5 py-0.5 rounded">
                              {cr.category}
                            </span>
                          </div>
                          <button 
                            onClick={() => toggleRoleSelection(cr.id)}
                            className="text-[#8E9991] hover:text-[#B64E49] text-sm p-1"
                            title="Remove role"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F3F1]">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">Median Base Compensation</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2]">
                        <div className="text-base font-extrabold text-[#286B59]">
                          ₹{(cr.median_salary / 100000).toFixed(1)} LPA
                        </div>
                        <div className="text-[10px] text-[#69756E]">50th percentile</div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">25th Percentile (P25)</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2] font-semibold text-[#202923]">
                        ₹{(cr.p25_salary / 100000).toFixed(1)} LPA
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">75th Percentile (P75)</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2] font-semibold text-[#202923]">
                        ₹{(cr.p75_salary / 100000).toFixed(1)} LPA
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">Interquartile Spread (IQR)</td>
                    {comparisonData.map(cr => {
                      const spread = (cr.p75_salary - cr.p25_salary) / 100000;
                      return (
                        <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2] text-[#4F5953]">
                          ₹{spread.toFixed(1)} LPA spread
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">Typical Experience</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2] text-[#202923]">
                        {cr.min_exp.toFixed(0)} – {cr.max_exp.toFixed(0)} yrs
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">Observation Volume</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2] text-[#202923]">
                        {cr.record_count} verified records
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-medium text-[#69756E] bg-[#FAFBFA] align-top">Core Skill Frequency</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-3 px-4 border-l border-[#E1E7E2] align-top">
                        <div className="space-y-1.5 max-w-xs">
                          {cr.key_skills.slice(0, 5).map((ks: any) => (
                            <div key={ks.skill} className="space-y-0.5">
                              <div className="flex justify-between text-[11px]">
                                <span className="font-medium text-[#202923]">{ks.skill}</span>
                                <span className="text-[#69756E]">{Math.round(ks.frequency * 100)}%</span>
                              </div>
                              <div className="w-full bg-[#E8ECE9] h-1 rounded-full overflow-hidden">
                                <div 
                                  className="bg-[#286B59] h-full rounded-full" 
                                  style={{ width: `${Math.round(ks.frequency * 100)}%` }} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-[#69756E] bg-[#FAFBFA]">Primary Tech Hubs</td>
                    {comparisonData.map(cr => (
                      <td key={cr.id} className="py-2.5 px-4 border-l border-[#E1E7E2] text-[#69756E]">
                        {cr.top_cities.join(', ')}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Directory Filter & Category Bar */}
      <div className="bg-white border border-[#E1E7E2] rounded-md p-3.5 space-y-3 shadow-xs">
        {/* Category Selector */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E] mr-1">Discipline:</span>
          {categories.map((c) => {
            const isCatActive = selectedCategory === c;
            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`text-xs px-2.5 py-1 rounded transition border ${
                  isCatActive
                    ? 'bg-[#E8F0EB] text-[#286B59] font-semibold border-[#286B59]'
                    : 'bg-white text-[#69756E] hover:text-[#202923] hover:bg-[#F5F7F5] border-[#E1E7E2]'
                }`}
              >
                {c === 'All' ? 'All Roles' : c}
              </button>
            );
          })}
        </div>

        {/* Search & Sort Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#F0F3F1]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#69756E] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by role title, description, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#CCD4CF] rounded text-[#202923] outline-none focus:border-[#286B59] transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#8E9991] hover:text-[#202923] text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-[#69756E]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="p-1.5 border border-[#CCD4CF] rounded text-[#202923] bg-white outline-none text-xs"
              >
                <option value="records">Most Observations</option>
                <option value="salary_desc">Highest Median Compensation</option>
                <option value="salary_asc">Lowest Median Compensation</option>
                <option value="title">Alphabetical (A–Z)</option>
              </select>
            </div>
            <span className="text-[#69756E] text-[11px] whitespace-nowrap">
              Showing {filteredAndSortedRoles.length} roles
            </span>
          </div>
        </div>
      </div>

      {/* 5. Main Role Directory (Table/List Hybrid) */}
      <div className="bg-white border border-[#E1E7E2] rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAFBF9] text-[#69756E] border-b border-[#E1E7E2] font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4 w-72">Role & Focus</th>
                <th className="py-3 px-3 w-40">Category</th>
                <th className="py-3 px-3 w-36">Median Base</th>
                <th className="py-3 px-3 w-48">Interquartile Range (P25–P75)</th>
                <th className="py-3 px-3 w-28">Observations</th>
                <th className="py-3 px-4">Core Associated Skills</th>
                <th className="py-3 px-4 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F1]">
              {filteredAndSortedRoles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#69756E]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-5 h-5 text-[#8E9991]" />
                      <span className="font-semibold text-[#202923]">No technology roles match your criteria</span>
                      <span className="text-[11px]">Try adjusting your search query or selecting "All Roles".</span>
                      <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                        className="mt-2 px-3 py-1 bg-[#286B59] text-white rounded text-xs hover:bg-[#1E5345] transition"
                      >
                        Reset Filter
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedRoles.map((r) => {
                  const isSelected = selectedRoleIds.includes(r.id);
                  return (
                    <tr 
                      key={r.id} 
                      onClick={() => openRoleInspector(r.id)}
                      className={`hover:bg-[#FAFBF9] cursor-pointer transition ${
                        isSelected ? 'bg-[#F4F8F5]/80' : ''
                      }`}
                    >
                      {/* Role & Description */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-[#202923] flex items-center space-x-1.5">
                          <span>{r.canonical_title}</span>
                        </div>
                        <p className="text-[11px] text-[#69756E] mt-0.5 line-clamp-2 leading-relaxed">
                          {r.description || 'Technology specialist role responsible for system development and analytics.'}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#286B59] bg-[#E8F0EB] px-2 py-0.5 rounded border border-[#D5E4DC]">
                          {r.category}
                        </span>
                      </td>

                      {/* Median Base Compensation */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-sm text-[#202923]">
                          ₹{(r.median_salary / 100000).toFixed(1)} LPA
                        </div>
                        <div className="text-[10px] text-[#69756E]">50th percentile</div>
                      </td>

                      {/* Range (P25 - P75) */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#202923] text-xs">
                          ₹{(r.p25_salary / 100000).toFixed(1)} – {(r.p75_salary / 100000).toFixed(1)} LPA
                        </div>
                        <div className="w-32 bg-[#E8ECE9] h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div 
                            className="bg-[#286B59] h-full rounded-full" 
                            style={{ 
                              marginLeft: `${Math.min(40, (r.p25_salary / 3500000) * 100)}%`,
                              width: `${Math.max(20, ((r.p75_salary - r.p25_salary) / 3500000) * 100)}%` 
                            }} 
                          />
                        </div>
                      </td>

                      {/* Observations */}
                      <td className="py-3 px-3">
                        <div className="font-medium text-[#202923]">{r.record_count}</div>
                        <div className="text-[10px] text-[#69756E]">observations</div>
                      </td>

                      {/* Core Skills */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {r.common_skills.slice(0, 4).map((s, idx) => (
                            <span 
                              key={idx} 
                              className="bg-[#F0F5F2] text-[#286B59] px-1.5 py-0.5 rounded text-[10px] border border-[#DEE7E2]"
                            >
                              {s}
                            </span>
                          ))}
                          {r.common_skills.length > 4 && (
                            <span className="text-[10px] text-[#69756E] self-center">
                              +{r.common_skills.length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => toggleRoleSelection(r.id, e)}
                            className={`p-1 rounded text-xs font-medium flex items-center space-x-1 transition ${
                              isSelected 
                                ? 'text-[#286B59] font-bold' 
                                : 'text-[#69756E] hover:text-[#202923]'
                            }`}
                            title={isSelected ? "Remove from comparison" : "Add to comparison"}
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#286B59]" />
                            ) : (
                              <Square className="w-4 h-4 text-[#CCD4CF]" />
                            )}
                            <span className="text-[11px] hidden md:inline">
                              {isSelected ? 'Selected' : 'Compare'}
                            </span>
                          </button>
                          
                          <button
                            onClick={(e) => openRoleInspector(r.id, e)}
                            className="px-2 py-1 bg-white border border-[#CCD4CF] hover:bg-[#F5F7F5] text-[#202923] rounded text-[11px] font-medium transition"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Contextual Role Detail Inspector Drawer (Slide-Over Panel) */}
      {inspectingRole && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-2xs transition-opacity animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-[#E1E7E2] flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-[#E1E7E2] bg-[#FAFBF9] flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#286B59] bg-[#E8F0EB] px-2 py-0.5 rounded border border-[#D5E4DC]">
                  {inspectingRole.category}
                </span>
                <h2 className="text-lg font-bold text-[#202923] mt-1.5">
                  {inspectingRole.title}
                </h2>
                <p className="text-xs text-[#69756E] mt-1 leading-relaxed">
                  {inspectingRole.description}
                </p>
              </div>
              <button 
                onClick={() => setInspectingRole(null)} 
                className="p-1 rounded text-[#8E9991] hover:text-[#202923] hover:bg-[#E8ECE9] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-6 text-xs">
              {/* Compensation Metric Summary Strip */}
              <div>
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E] mb-2">
                  Compensation Benchmarks
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-3 rounded bg-[#FAFBF9] border border-[#E1E7E2]">
                    <div className="text-[10px] text-[#69756E]">25th Percentile</div>
                    <div className="text-sm font-bold text-[#202923] mt-0.5">
                      ₹{(inspectingRole.p25_salary / 100000).toFixed(1)} LPA
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[#E8F0EB] border border-[#D5E4DC]">
                    <div className="text-[10px] text-[#286B59] font-semibold">Median (P50)</div>
                    <div className="text-base font-extrabold text-[#286B59] mt-0.5">
                      ₹{(inspectingRole.median_salary / 100000).toFixed(1)} LPA
                    </div>
                  </div>
                  <div className="p-3 rounded bg-[#FAFBF9] border border-[#E1E7E2]">
                    <div className="text-[10px] text-[#69756E]">75th Percentile</div>
                    <div className="text-sm font-bold text-[#202923] mt-0.5">
                      ₹{(inspectingRole.p75_salary / 100000).toFixed(1)} LPA
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Metrics */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#F0F3F1]">
                <div>
                  <div className="text-[10px] text-[#69756E]">Sample Size</div>
                  <div className="font-semibold text-[#202923] mt-0.5">{inspectingRole.record_count} records</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#69756E]">Avg Experience</div>
                  <div className="font-semibold text-[#202923] mt-0.5">{inspectingRole.avg_experience} years</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#69756E]">Observed Range</div>
                  <div className="font-semibold text-[#202923] mt-0.5">
                    ₹{(inspectingRole.min_salary / 100000).toFixed(1)} – {(inspectingRole.max_salary / 100000).toFixed(1)}L
                  </div>
                </div>
              </div>

              {/* Empirical Skill Breakdown with Clean Bars */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E]">
                    Empirical Skill Prevalence
                  </h3>
                  <span className="text-[10px] text-[#69756E]">Occurrence across verified records</span>
                </div>
                <div className="space-y-2">
                  {inspectingRole.skills_distribution?.map((s: any) => (
                    <div key={s.skill} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#202923]">{s.skill}</span>
                        <span className="text-[#69756E]">{s.percentage}% ({s.count} records)</span>
                      </div>
                      <div className="w-full bg-[#E8ECE9] h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#286B59] h-full rounded-full transition-all" 
                          style={{ width: `${s.percentage}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Footprint */}
              {inspectingRole.location_distribution && inspectingRole.location_distribution.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[#69756E] mb-2">
                    Primary Tech Hub Distribution
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {inspectingRole.location_distribution.map((loc: any) => (
                      <div key={loc.city} className="p-2 rounded bg-[#FAFBF9] border border-[#E1E7E2] flex items-center justify-between">
                        <span className="text-[#202923] font-medium">{loc.city}</span>
                        <span className="text-[#69756E] text-[11px]">{loc.count} records</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#E1E7E2] bg-[#FAFBF9] flex items-center justify-between">
              <button
                onClick={() => toggleRoleSelection(inspectingRole.id)}
                className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition ${
                  selectedRoleIds.includes(inspectingRole.id)
                    ? 'bg-[#FBEBEB] text-[#B64E49] border border-[#F0D5D5]'
                    : 'bg-[#E8F0EB] text-[#286B59] border border-[#D5E4DC] hover:bg-[#DCEAE0]'
                }`}
              >
                {selectedRoleIds.includes(inspectingRole.id) ? (
                  <>
                    <span>Remove from Comparison</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Add to Comparison Matrix</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setInspectingRole(null)}
                className="px-4 py-1.5 bg-white border border-[#CCD4CF] text-[#202923] rounded text-xs font-medium hover:bg-[#F5F7F5] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

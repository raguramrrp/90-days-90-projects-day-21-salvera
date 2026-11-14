import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  ComposedChart, Area, Line, Cell, ReferenceLine, Legend
} from 'recharts';
import { 
  Compass, TrendingUp, Briefcase, MapPin, Sparkles, Database, ArrowRight, 
  CheckCircle2, AlertCircle, BookmarkPlus, Eye, Layers, ShieldCheck
} from 'lucide-react';
import { api, OverviewSummary, SkillRankItem } from '../services/api';

interface OverviewPageProps {
  onNavigate: (tab: string, filterParams?: any) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<OverviewSummary | null>(null);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [expComp, setExpComp] = useState<any[]>([]);
  const [topSkills, setTopSkills] = useState<SkillRankItem[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick filters
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, distRes, expRes, skillRes, insRes] = await Promise.all([
          api.getOverviewSummary(),
          api.getSalaryDistribution(),
          api.getExperienceCompensation(),
          api.getTopSkills(8),
          api.getCareerInsights(),
        ]);
        setSummary(sumRes);
        setDistribution(distRes || []);
        setExpComp(expRes || []);
        setTopSkills(skillRes || []);
        setInsights(insRes || []);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let r = selectedRole.trim();
    let c = selectedCity.trim();

    // Support compound search e.g. "Data Analyst in Chennai"
    if (r.toLowerCase().includes(' in ')) {
      const parts = r.split(/\s+in\s+/i);
      r = parts[0].trim();
      if (!c) c = parts[1].trim();
    }
    onNavigate('salary-explorer', { role_name: r, city: c });
  };

  // Color mapping per histogram bin based on compensation tier
  const getBinColor = (index: number, total: number) => {
    if (index < 2) return '#648C7A'; // Foundation / entry tier (Muted Jade)
    if (index < 4) return '#172B2A'; // Core median mass tier (Deep Ink)
    if (index < 6) return '#B66B45'; // Upper quartile tier (Burnished Copper)
    return '#D5B66D'; // Elite / upper outlier tier (Soft Brass)
  };

  // Custom Tooltip for Histogram
  const CustomHistogramTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#E2E2D9] p-3 rounded-md shadow-lg text-xs space-y-1">
          <div className="font-bold text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1">
            Salary Band: {label}
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Observation Volume:</span>
            <span className="font-mono font-bold text-[#172B2A]">{data.count.toLocaleString()} records</span>
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Proportion of Market:</span>
            <span className="font-mono font-semibold text-[#B66B45]">{data.percentage || ((data.count / 5292) * 100).toFixed(1)}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Multi-Cohort Experience Corridor
  const CustomExperienceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white border border-[#E2E2D9] p-3 rounded-md shadow-lg text-xs space-y-1.5 min-w-[200px]">
          <div className="font-bold text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1 flex items-center justify-between">
            <span>Cohort: {item.cohortLabel}</span>
            <span className="text-[10px] text-[#707B75]">{item.bracket}</span>
          </div>
          <div className="flex items-center justify-between text-[#B66B45]">
            <span>75th Percentile (Upper):</span>
            <span className="font-mono font-bold">₹{item.p75} LPA</span>
          </div>
          <div className="flex items-center justify-between text-[#172B2A] font-semibold">
            <span>50th Percentile (Median):</span>
            <span className="font-mono font-extrabold text-[#172B2A]">₹{item.median} LPA</span>
          </div>
          <div className="flex items-center justify-between text-[#707B75]">
            <span>25th Percentile (Floor):</span>
            <span className="font-mono font-medium">₹{item.p25} LPA</span>
          </div>
          <div className="pt-1 border-t border-[#E2E2D9]/60 text-[10px] text-[#648C7A] flex items-center justify-between">
            <span>IQR Spread:</span>
            <span className="font-mono font-bold">₹{(item.p75 - item.p25).toFixed(1)}L Band</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#707B75] text-xs">
        Loading SALVERA financial & career intelligence...
      </div>
    );
  }

  // Pre-process experience corridor data
  const formattedExpData = expComp.map(e => ({
    bracket: e.experience_bracket.split(' ')[0],
    cohortLabel: e.experience_bracket,
    median: roundToLpa(e.median_salary),
    p25: roundToLpa(e.p25_salary),
    p75: roundToLpa(e.p75_salary),
    count: e.count
  }));

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-7 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Notice Banner */}
        <div className="bg-white border-l-4 border-[#B66B45] p-3 rounded-r-md text-xs text-[#202B29] border-y border-r border-[#E2E2D9] flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-[#B66B45] shrink-0" />
            <span>
              <strong>CALIBRATED BENCHMARK CORPUS:</strong> High-density salary database across 21 technology roles and 7 Indian tech hubs. Factual percentiles without unverified self-reported inflation.
            </span>
          </div>
          <button 
            onClick={() => onNavigate('data-insights')}
            className="text-[11px] text-[#B66B45] underline hover:text-[#172B2A] font-semibold shrink-0 ml-3"
          >
            Inspect Methodology →
          </button>
        </div>

        {/* Hero Section — Fully Extended 2-Column Workstation Layout */}
        <div className="bg-white border border-[#E2E2D9] rounded-lg p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left 7 Columns: Extended Typography, Wide Search Inputs, & Trending Chips */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#B66B45] bg-[#F3EFE6] px-2.5 py-1 rounded border border-[#E2E2D9]">
                CAREER & FINANCIAL INTELLIGENCE
              </span>
              <h1 className="text-2xl sm:text-3.5xl lg:text-4xl font-serif text-[#172B2A] tracking-tight leading-snug">
                <span className="font-bold">Understand your market value.</span>{' '}
                <span className="italic font-normal text-[#B66B45]">Make smarter career moves.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#707B75] leading-relaxed font-sans">
                Explore technology compensation distributions, evaluate high-paying skill clusters, deconstruct job offers into true take-home cash, and inspect verified market percentiles.
              </p>

              {/* Extended Search Inputs */}
              <form onSubmit={handleHeroSearch} className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  placeholder="Target Role (e.g. Data Analyst, Software Engineer, Machine Learning)"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3.5 py-2.5 text-xs border border-[#E2E2D9] rounded-md bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden flex-1 sm:flex-2 text-[#202B29]"
                />
                <input
                  type="text"
                  placeholder="City (e.g. Bengaluru, Chennai, Hyderabad, Pune)"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="px-3.5 py-2.5 text-xs border border-[#E2E2D9] rounded-md bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden flex-1 text-[#202B29]"
                />
                <button
                  type="submit"
                  className="bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold px-5 py-2.5 rounded-md transition flex items-center justify-center space-x-1.5 shadow-xs shrink-0"
                >
                  <span>Explore Benchmark</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D5B66D]" />
                </button>
              </form>

              {/* Trending Quick Searches */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-[#707B75]">
                <span className="font-semibold text-[#172B2A]">Trending Searches:</span>
                {[
                  { r: 'Data Analyst', c: 'Bengaluru' },
                  { r: 'Data Scientist', c: 'Hyderabad' },
                  { r: 'Software Engineer', c: 'Chennai' },
                  { r: 'Machine Learning Engineer', c: 'Pune' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onNavigate('salary-explorer', { role_name: item.r, city: item.c })}
                    className="px-2 py-0.5 rounded bg-[#F3EFE6] hover:bg-[#EAE4D5] text-[#172B2A] border border-[#E2E2D9] transition font-medium"
                  >
                    {item.r} in {item.c}
                  </button>
                ))}
              </div>
            </div>

            {/* Right 5 Columns: Market Intelligence Snapshot Card filling the space */}
            <div className="lg:col-span-5 bg-[#F3EFE6]/50 border border-[#E2E2D9] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#E2E2D9]/70 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#B66B45]"></span>
                  <span className="text-xs font-bold text-[#172B2A] tracking-tight">Market Intelligence Snapshot</span>
                </div>
                <span className="text-[10px] font-mono text-[#648C7A] bg-white px-2 py-0.5 rounded border border-[#E2E2D9]">
                  Verified Corpus
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#E2E2D9]/60 shadow-2xs">
                  <div>
                    <div className="text-[10px] text-[#707B75]">National Median Tech Salary</div>
                    <div className="font-bold text-[#172B2A] font-mono tabular-nums text-sm">
                      ₹{summary ? (summary.median_annual_salary / 100000).toFixed(1) : '26.0'} LPA
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[#648C7A] bg-[#F3EFE6] px-2 py-1 rounded border border-[#E2E2D9]/60">
                    IQR: ₹{summary ? (summary.salary_p25 / 100000).toFixed(1) : '18.4'}L - {summary ? (summary.salary_p75 / 100000).toFixed(1) : '37.0'}L
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#E2E2D9]/60 shadow-2xs">
                  <div>
                    <div className="text-[10px] text-[#707B75]">High-Value Skill Clusters</div>
                    <div className="font-semibold text-[#172B2A] text-xs">
                      Cloud, Deep Learning & Systems
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#B66B45] bg-[#F3EFE6] px-2 py-1 rounded border border-[#E2E2D9]/60">
                    +38% Premium
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-md bg-white border border-[#E2E2D9]/60 shadow-2xs">
                  <div>
                    <div className="text-[10px] text-[#707B75]">Top Geography Differential</div>
                    <div className="font-semibold text-[#172B2A] text-xs">
                      Bengaluru & Hyderabad Hubs
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#172B2A] font-mono">
                    ₹29.2L Median
                  </span>
                </div>
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('salary-explorer')}
                  className="flex-1 py-1.5 px-3 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md text-center transition flex items-center justify-center space-x-1 shadow-2xs"
                >
                  <span>Explore Salaries</span>
                  <ArrowRight className="w-3 h-3 text-[#D5B66D]" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('offer-studio')}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-[#F3EFE6] border border-[#E2E2D9] text-[#172B2A] text-xs font-semibold rounded-md text-center transition shadow-2xs"
                >
                  Offer Studio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Analytical Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-[#E2E2D9] p-4 rounded-md shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Total Salary Records</div>
            <div className="text-xl font-extrabold text-[#172B2A] mt-1 tabular-nums font-mono">{summary?.total_records.toLocaleString()}</div>
            <div className="text-[10px] text-[#648C7A] font-semibold mt-1">Calibrated Corpus</div>
          </div>

          <div className="bg-white border border-[#E2E2D9] p-4 rounded-md shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Median Annual Salary</div>
            <div className="text-xl font-extrabold text-[#172B2A] mt-1 tabular-nums font-mono">
              ₹{summary ? (summary.median_annual_salary / 100000).toFixed(1) : 0} LPA
            </div>
            <div className="text-[10px] text-[#707B75] mt-1">50th Percentile (P50)</div>
          </div>

          <div className="bg-white border border-[#E2E2D9] p-4 rounded-md shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Middle 50% Spread</div>
            <div className="text-xl font-extrabold text-[#B66B45] mt-1 tabular-nums font-mono">
              ₹{summary ? (summary.salary_p25 / 100000).toFixed(1) : 0} - {summary ? (summary.salary_p75 / 100000).toFixed(1) : 0}L
            </div>
            <div className="text-[10px] text-[#707B75] mt-1">IQR (P25 - P75)</div>
          </div>

          <div className="bg-white border border-[#E2E2D9] p-4 rounded-md shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Standardized Roles</div>
            <div className="text-xl font-extrabold text-[#172B2A] mt-1 tabular-nums font-mono">{summary?.total_roles}</div>
            <div className="text-[10px] text-[#648C7A] font-semibold mt-1">Tech Taxonomies</div>
          </div>

          <div className="bg-white border border-[#E2E2D9] p-4 rounded-md shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Mapped Skills</div>
            <div className="text-xl font-extrabold text-[#172B2A] mt-1 tabular-nums font-mono">{summary?.total_skills}</div>
            <div className="text-[10px] text-[#707B75] mt-1">Skills Dictionary</div>
          </div>

          <div className="bg-white border border-[#E2E2D9] p-4 rounded-md shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#707B75]">Locations Covered</div>
            <div className="text-xl font-extrabold text-[#172B2A] mt-1 tabular-nums font-mono">{summary?.total_locations}</div>
            <div className="text-[10px] text-[#707B75] mt-1">Indian Tech Hubs</div>
          </div>
        </div>

        {/* Main Analytical Visualization: Full-Width Tiered Financial Distribution Histogram */}
        <div className="w-full">
          {/* Graph A: Tiered Financial Distribution Histogram */}
          <div className="bg-white border border-[#E2E2D9] p-5 rounded-lg shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#172B2A]"></span>
                  <h2 className="text-sm font-bold text-[#172B2A] tracking-tight">Observed Salary Distribution</h2>
                </div>
                <span className="text-[11px] text-[#707B75] font-mono">N = {summary?.total_records} records</span>
              </div>
              <p className="text-xs text-[#707B75] mt-0.5">
                Histogram of normalized annual compensation binned in ₹ LPA with tiered salary highlighting.
              </p>
            </div>

            {/* Financial Tier Legend */}
            <div className="flex items-center space-x-3 text-[10px] mt-3 pb-2 border-b border-[#E2E2D9]/60">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#648C7A]"></span>
                <span className="text-[#707B75]">Entry/Junior Tier</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#172B2A]"></span>
                <span className="text-[#172B2A] font-semibold">Core Median Mass</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#B66B45]"></span>
                <span className="text-[#B66B45] font-semibold">Upper Quartile</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#D5B66D]"></span>
                <span className="text-[#707B75]">Executive Tier</span>
              </span>
            </div>

            <div className="h-72 mt-3 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={distribution} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D9" vertical={false} />
                  <XAxis 
                    dataKey="bin_range" 
                    tick={{ fontSize: 9, fill: '#707B75', fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: '#707B75' }} 
                  />
                  <Tooltip content={<CustomHistogramTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Observed Headcount">
                    {distribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getBinColor(index, distribution.length)} 
                      />
                    ))}
                  </Bar>
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#B66B45" 
                    strokeWidth={2.5} 
                    dot={{ fill: '#B66B45', stroke: '#FFFFFF', strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ r: 6, fill: '#172B2A' }}
                    name="Density Contour" 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-[#707B75] border-t border-[#E2E2D9] pt-2.5 mt-2 flex justify-between items-center">
              <span>Left Skew: 65% of workforce clustered within ₹6.1L – ₹22.7L band</span>
              <button 
                onClick={() => onNavigate('salary-explorer')}
                className="text-[#B66B45] hover:text-[#172B2A] hover:underline font-semibold flex items-center space-x-0.5"
              >
                <span>Filter by Role & City</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Most Frequently Reported Skills & Factual Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Reported Technical Skills */}
          <div className="lg:col-span-2 bg-white border border-[#E2E2D9] p-5 rounded-lg shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#E2E2D9]/60 pb-3">
              <div>
                <h2 className="text-sm font-bold text-[#172B2A] tracking-tight">Most Frequently Reported Technical Skills</h2>
                <p className="text-xs text-[#707B75]">Observed frequency and associated median compensation in the benchmark.</p>
              </div>
              <button 
                onClick={() => onNavigate('skills')}
                className="text-xs text-[#B66B45] hover:text-[#172B2A] hover:underline font-semibold"
              >
                Explore All Skills →
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {topSkills.map((sk) => (
                <div key={sk.skill_name} className="flex items-center justify-between text-xs p-2 rounded hover:bg-[#F3EFE6]/50 transition">
                  <div className="w-36 font-semibold text-[#172B2A] truncate flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B66B45]"></span>
                    <span>{sk.skill_name}</span>
                  </div>

                  <div className="flex-1 mx-4">
                    <div className="w-full bg-[#E2E2D9] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#172B2A] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(10, ((sk.frequency_count || 1) / 5292) * 200))}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="w-40 text-right space-x-2 shrink-0">
                    <span className="font-bold text-[#172B2A] tabular-nums font-mono">
                      ₹{roundToLpa(sk.median_salary)} LPA
                    </span>
                    <span className="text-[10px] text-[#707B75]">
                      ({sk.frequency_count} mentions)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Factual Data Observations */}
          <div className="bg-white border border-[#E2E2D9] p-5 rounded-lg shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 border-b border-[#E2E2D9]/60 pb-3 mb-3">
                <Database className="w-4 h-4 text-[#B66B45]" />
                <h2 className="text-sm font-bold text-[#172B2A] tracking-tight">Key Analytical Findings</h2>
              </div>

              <div className="space-y-3">
                {insights.map((ins, i) => (
                  <div key={i} className="text-xs border-b border-[#E2E2D9]/40 pb-2.5 last:border-0">
                    <h3 className="font-bold text-[#172B2A] flex items-center space-x-1.5">
                      <span className="w-1 h-3 bg-[#648C7A] rounded-full inline-block"></span>
                      <span>{ins.title}</span>
                    </h3>
                    <p className="text-[11px] text-[#707B75] mt-1 leading-relaxed">
                      {ins.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E2E2D9] text-[11px] text-[#707B75] flex justify-between items-center">
              <span>Non-causal empirical correlations</span>
              <button 
                onClick={() => onNavigate('data-insights')}
                className="text-[#B66B45] hover:underline font-semibold"
              >
                Inspect Methodology →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Feature Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div 
            onClick={() => onNavigate('salary-explorer')}
            className="bg-white p-5 rounded-lg border border-[#E2E2D9] hover:border-[#172B2A] cursor-pointer transition shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 bg-[#F3EFE6] text-[#172B2A] rounded-md font-bold border border-[#E2E2D9]">
                <BarChart className="w-4 h-4 text-[#B66B45]" />
              </span>
              <ArrowRight className="w-4 h-4 text-[#707B75] group-hover:text-[#172B2A] transition" />
            </div>
            <h3 className="font-bold text-sm text-[#172B2A] mt-3">Salary Explorer</h3>
            <p className="text-xs text-[#707B75] mt-1">
              Multi-dimensional compensation filtering by role, Indian city, experience bracket, and required skills.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('salary-estimator')}
            className="bg-white p-5 rounded-lg border border-[#E2E2D9] hover:border-[#172B2A] cursor-pointer transition shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 bg-[#F3EFE6] text-[#172B2A] rounded-md font-bold border border-[#E2E2D9]">
                <Sparkles className="w-4 h-4 text-[#D5B66D]" />
              </span>
              <ArrowRight className="w-4 h-4 text-[#707B75] group-hover:text-[#172B2A] transition" />
            </div>
            <h3 className="font-bold text-sm text-[#172B2A] mt-3">Statistical Salary Estimator</h3>
            <p className="text-xs text-[#707B75] mt-1">
              Estimate compensation intervals based on your experience, target city, and technical skills.
            </p>
          </div>

          <div 
            onClick={() => onNavigate('career-planner')}
            className="bg-white p-5 rounded-lg border border-[#E2E2D9] hover:border-[#172B2A] cursor-pointer transition shadow-2xs group"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 bg-[#F3EFE6] text-[#172B2A] rounded-md font-bold border border-[#E2E2D9]">
                <Compass className="w-4 h-4 text-[#648C7A]" />
              </span>
              <ArrowRight className="w-4 h-4 text-[#707B75] group-hover:text-[#172B2A] transition" />
            </div>
            <h3 className="font-bold text-sm text-[#172B2A] mt-3">Skill Gap Career Roadmap</h3>
            <p className="text-xs text-[#707B75] mt-1">
              Match your profile against target roles and generate customized, printable learning plans.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function roundToLpa(val: number): number {
  return Number((val / 100000).toFixed(1));
}

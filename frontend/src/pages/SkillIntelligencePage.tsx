import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { 
  Sparkles, Search, Layers, Download, Plus, Trash2, ArrowRight, 
  HelpCircle, CheckCircle, TrendingUp 
} from 'lucide-react';
import { api, SkillRankItem, SkillComparisonProfile } from '../services/api';

export const SkillIntelligencePage: React.FC = () => {
  const [rankings, setRankings] = useState<SkillRankItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [combinations, setCombinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Skill Comparison State
  const [profileA, setProfileA] = useState<string[]>(['Python']);
  const [profileB, setProfileB] = useState<string[]>(['Python', 'SQL']);
  const [newSkillA, setNewSkillA] = useState('');
  const [newSkillB, setNewSkillB] = useState('');
  const [comparisonResults, setComparisonResults] = useState<SkillComparisonProfile[]>([]);
  const [comparing, setComparing] = useState(false);

  const categories = [
    'All', 'Programming', 'Database & Query', 'BI & Visualization', 
    'Cloud & DevOps', 'Machine Learning', 'Testing & QA', 'Frameworks & Libraries'
  ];

  const fetchSkillsData = async () => {
    try {
      setLoading(true);
      const [rankRes, comboRes] = await Promise.all([
        api.getSkillRankings(selectedCategory === 'All' ? undefined : selectedCategory),
        api.getSkillCombinations(12),
      ]);
      setRankings(rankRes);
      setCombinations(comboRes);
    } catch (err) {
      console.error('Failed to fetch skill data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsData();
  }, [selectedCategory]);

  const runComparison = async () => {
    try {
      setComparing(true);
      const res = await api.compareSkills([profileA, profileB]);
      setComparisonResults(res);
    } catch (err) {
      console.error('Failed to run skill comparison', err);
    } finally {
      setComparing(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, []);

  const handleExportCsv = () => {
    window.open('/api/skills/export-csv', '_blank');
  };

  const filteredRankings = rankings.filter(s => 
    s.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Top 8 skills by median salary for analytical chart
  const topSkillsBySalary = [...rankings]
    .sort((a, b) => b.median_salary - a.median_salary)
    .slice(0, 8)
    .map(s => ({
      name: s.skill_name,
      median: Number((s.median_salary / 100000).toFixed(1)),
      p25: Number((s.p25_salary / 100000).toFixed(1)),
      p75: Number((s.p75_salary / 100000).toFixed(1)),
      category: s.category,
      frequency: s.frequency_count,
    }));

  // Top 8 combinations by salary lift
  const topCombosByLift = [...combinations]
    .sort((a, b) => b.relative_lift - a.relative_lift)
    .slice(0, 8)
    .map(c => ({
      pair: `${c.skill_a} + ${c.skill_b}`,
      lift: c.relative_lift,
      salary: Number((c.median_salary / 100000).toFixed(1)),
      postings: c.co_occurrence_count
    }));

  // Color mapping helper for skill tiers
  const getSkillBarColor = (index: number) => {
    const colors = ['#172B2A', '#B66B45', '#648C7A', '#D5B66D', '#172B2A', '#B66B45', '#648C7A', '#D5B66D'];
    return colors[index % colors.length];
  };

  // Custom Tooltip for Skill Salary BarChart
  const CustomSkillTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#E2E2D9] p-3 rounded-md shadow-lg text-xs space-y-1">
          <div className="font-bold text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1 flex justify-between items-center">
            <span>{data.name}</span>
            <span className="text-[10px] text-[#707B75] bg-[#F3EFE6] px-1.5 py-0.5 rounded">{data.category}</span>
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Median Compensation:</span>
            <span className="font-mono font-bold text-[#172B2A]">₹{data.median} LPA</span>
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Interquartile Band:</span>
            <span className="font-mono font-semibold text-[#B66B45]">₹{data.p25} - {data.p75}L</span>
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Corpus Frequency:</span>
            <span className="font-mono text-[#648C7A]">{data.frequency} records</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Lift Chart
  const CustomLiftTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#E2E2D9] p-3 rounded-md shadow-lg text-xs space-y-1">
          <div className="font-bold text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1">
            Bundle: {data.pair}
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Empirical Salary Lift:</span>
            <span className="font-mono font-bold text-[#B66B45]">+{data.lift}%</span>
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Median Compensation:</span>
            <span className="font-mono font-semibold text-[#172B2A]">₹{data.salary} LPA</span>
          </div>
          <div className="flex items-center justify-between space-x-3 text-[#202B29]">
            <span className="text-[#707B75]">Postings Count:</span>
            <span className="font-mono text-[#707B75]">{data.postings} listings</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2D9] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Skill Intelligence & Premium Analytics</h1>
            <p className="text-xs text-[#707B75] mt-0.5">
              Discover technical skills associated with higher compensation bands and analyze multi-skill portfolios.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#172B2A] rounded-md text-xs font-medium transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#B66B45]" />
            <span>Export Skills CSV</span>
          </button>
        </div>

        {/* Visual Analytics Grid: Attractive & Informative Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Top High-Yield Skills by Median Pay */}
          <div className="bg-white border border-[#E2E2D9] p-5 rounded-lg shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#172B2A]"></span>
                  <h2 className="text-sm font-bold text-[#172B2A] tracking-tight">Top High-Yield Technical Skills</h2>
                </div>
                <span className="text-[10px] font-mono text-[#707B75]">Median Pay (₹ LPA)</span>
              </div>
              <p className="text-xs text-[#707B75] mt-0.5">
                Highest median compensation across mapped skill taxonomies in calibrated corpus.
              </p>
            </div>

            <div className="h-68 mt-3 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={topSkillsBySalary} 
                  margin={{ top: 5, right: 25, left: 15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D9" horizontal={false} />
                  <XAxis type="number" unit="L" tick={{ fontSize: 9, fill: '#707B75' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#172B2A', fontWeight: 500 }} width={75} />
                  <Tooltip content={<CustomSkillTooltip />} />
                  <Bar dataKey="median" radius={[0, 4, 4, 0]}>
                    {topSkillsBySalary.map((_, index) => (
                      <Cell key={`skill-bar-${index}`} fill={getSkillBarColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-[11px] text-[#707B75] border-t border-[#E2E2D9] pt-2.5 mt-2 flex justify-between items-center">
              <span>Highest premiums cluster in Cloud Infrastructure, Deep Learning & Distributed Systems</span>
            </div>
          </div>

          {/* Chart 2: Skill Combination Empirical Salary Lift */}
          <div className="bg-white border border-[#E2E2D9] p-5 rounded-lg shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#B66B45]"></span>
                  <h2 className="text-sm font-bold text-[#172B2A] tracking-tight">Co-occurring Skill Bundles Salary Lift</h2>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#B66B45] border border-[#E2E2D9]">
                  Relative Lift %
                </span>
              </div>
              <p className="text-xs text-[#707B75] mt-0.5">
                Empirical compensation premium observed when two high-demand skills are paired together.
              </p>
            </div>

            <div className="h-68 mt-3 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCombosByLift} margin={{ top: 15, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D9" vertical={false} />
                  <XAxis 
                    dataKey="pair" 
                    tick={{ fontSize: 8.5, fill: '#172B2A', angle: -25, textAnchor: 'end' }} 
                    interval={0}
                  />
                  <YAxis unit="%" tick={{ fontSize: 9, fill: '#707B75' }} />
                  <Tooltip content={<CustomLiftTooltip />} />
                  <Bar dataKey="lift" radius={[4, 4, 0, 0]}>
                    {topCombosByLift.map((_, index) => (
                      <Cell key={`combo-lift-${index}`} fill={index % 2 === 0 ? '#B66B45' : '#648C7A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-[11px] text-[#707B75] border-t border-[#E2E2D9] pt-2.5 mt-2 flex justify-between items-center">
              <span>Frequent itemset mining over 5,292 multi-skill survey postings</span>
            </div>
          </div>
        </div>

        {/* Signature Feature: Skill Comparison Workspace */}
        <div className="bg-white border border-[#E2E2D9] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E2D9]/60 pb-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#F3EFE6] text-[#172B2A] rounded">
                <Sparkles className="w-4 h-4 text-[#B66B45]" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-[#172B2A]">Multi-Profile Skill Comparison Studio</h2>
                <p className="text-[11px] text-[#707B75]">Compare empirical salary spreads across complementary skill portfolios.</p>
              </div>
            </div>
            <button
              onClick={runComparison}
              disabled={comparing}
              className="bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold px-4 py-1.5 rounded-md transition shadow-xs"
            >
              {comparing ? 'Recalculating...' : 'Compare Portfolios'}
            </button>
          </div>

          {/* Profile Builders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile A */}
            <div className="p-3.5 rounded-md border border-[#E2E2D9] bg-[#F3EFE6]/30">
              <div className="text-xs font-bold text-[#172B2A] mb-2 flex items-center justify-between">
                <span>Profile A (Baseline)</span>
                <span className="text-[10px] text-[#707B75]">{profileA.length} skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px]">
                {profileA.map((s, idx) => (
                  <span key={idx} className="bg-white border border-[#E2E2D9] text-[#172B2A] px-2 py-0.5 rounded text-xs flex items-center space-x-1 shadow-2xs">
                    <span>{s}</span>
                    <button onClick={() => setProfileA(profileA.filter((_, i) => i !== idx))} className="text-[#707B75] hover:text-[#B66B45]">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add skill (e.g. SQL, Python, Excel)"
                  value={newSkillA}
                  onChange={(e) => setNewSkillA(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkillA.trim()) {
                      e.preventDefault();
                      setProfileA([...profileA, newSkillA.trim()]);
                      setNewSkillA('');
                    }
                  }}
                  className="w-full text-xs p-1.5 bg-white border border-[#E2E2D9] rounded text-[#202B29] outline-hidden focus:border-[#172B2A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkillA.trim()) {
                      setProfileA([...profileA, newSkillA.trim()]);
                      setNewSkillA('');
                    }
                  }}
                  className="px-2.5 py-1 bg-[#172B2A] text-white text-xs font-medium rounded hover:bg-[#254240]"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Profile B */}
            <div className="p-3.5 rounded-md border border-[#E2E2D9] bg-[#F3EFE6]/30">
              <div className="text-xs font-bold text-[#172B2A] mb-2 flex items-center justify-between">
                <span>Profile B (Expanded Portfolio)</span>
                <span className="text-[10px] text-[#707B75]">{profileB.length} skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[32px]">
                {profileB.map((s, idx) => (
                  <span key={idx} className="bg-white border border-[#E2E2D9] text-[#172B2A] px-2 py-0.5 rounded text-xs flex items-center space-x-1 shadow-2xs">
                    <span>{s}</span>
                    <button onClick={() => setProfileB(profileB.filter((_, i) => i !== idx))} className="text-[#707B75] hover:text-[#B66B45]">
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add skill (e.g. AWS, PyTorch, Docker)"
                  value={newSkillB}
                  onChange={(e) => setNewSkillB(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newSkillB.trim()) {
                      e.preventDefault();
                      setProfileB([...profileB, newSkillB.trim()]);
                      setNewSkillB('');
                    }
                  }}
                  className="w-full text-xs p-1.5 bg-white border border-[#E2E2D9] rounded text-[#202B29] outline-hidden focus:border-[#172B2A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newSkillB.trim()) {
                      setProfileB([...profileB, newSkillB.trim()]);
                      setNewSkillB('');
                    }
                  }}
                  className="px-2.5 py-1 bg-[#172B2A] text-white text-xs font-medium rounded hover:bg-[#254240]"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Comparison Output Cards */}
          {comparisonResults.length === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {comparisonResults.map((prof, idx) => (
                <div key={idx} className="p-4 rounded-md border border-[#E2E2D9] bg-white shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-[#B66B45] uppercase tracking-wider">
                    {idx === 0 ? 'Profile A Results' : 'Profile B Results'}
                  </div>
                  <div className="text-sm font-bold text-[#172B2A]">{prof.profile_label}</div>
                  
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E2E2D9]/60 text-xs">
                    <div>
                      <div className="text-[10px] text-[#707B75]">Sample Size</div>
                      <div className="font-bold text-[#172B2A] tabular-nums font-mono">{prof.matching_records} records</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#707B75]">Median Salary</div>
                      <div className="font-extrabold text-[#172B2A] tabular-nums font-mono">₹{(prof.median_salary / 100000).toFixed(1)} LPA</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-[#707B75]">P25 - P75 Spread</div>
                      <div className="font-bold text-[#B66B45] tabular-nums font-mono">₹{(prof.p25_salary / 100000).toFixed(1)} - {(prof.p75_salary / 100000).toFixed(1)}L</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#707B75] pt-2">
                    <strong className="text-[#172B2A]">Top Roles:</strong> {prof.common_roles.join(', ') || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistical Caveat */}
          <div className="bg-[#FAF5EB] border border-[#ECD9BA] p-3 rounded-md text-[11px] text-[#825215] flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-[#B66B45] shrink-0" />
            <span>
              <strong>Statistical Association Disclosure:</strong> Records containing these skill combinations show a higher median compensation in the selected dataset. This indicates strong market demand and role seniority associations, but individual salary offers also depend on candidate capability, company scale, and role responsibilities.
            </span>
          </div>
        </div>

        {/* Skill Bundles & Co-occurrence Matrix */}
        <div className="bg-white border border-[#E2E2D9] rounded-lg p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#172B2A]">High-Value Skill Combinations (Frequent Itemset Bundles)</h2>
              <p className="text-xs text-[#707B75]">Technical pairs frequently co-occurring in benchmark roles with relative salary lift.</p>
            </div>
            <span className="text-xs text-[#B66B45] font-semibold bg-[#F3EFE6] px-2 py-0.5 rounded border border-[#E2E2D9]">
              Empirical Mining
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {combinations.map((c, i) => (
              <div key={i} className="p-3 rounded-md border border-[#E2E2D9] bg-[#F3EFE6]/30 hover:bg-[#F3EFE6]/60 transition">
                <div className="flex items-center justify-between text-xs font-bold text-[#172B2A]">
                  <span>{c.skill_a} + {c.skill_b}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${c.relative_lift >= 0 ? 'bg-[#F3EFE6] text-[#B66B45] border border-[#E2E2D9]' : 'bg-[#FAF0F0] text-[#B64E49]'}`}>
                    {c.relative_lift >= 0 ? `+${c.relative_lift}%` : `${c.relative_lift}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#707B75] mt-2">
                  <span>{c.co_occurrence_count} postings</span>
                  <span className="font-bold text-[#172B2A] tabular-nums font-mono">₹{(c.median_salary / 100000).toFixed(1)} LPA</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Leaderboard Table */}
        <div className="bg-white rounded-md border border-[#E2E2D9] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-[#172B2A] tracking-tight">Full Skill Compensation Rankings</h3>
              <p className="text-[11px] text-[#707B75]">Ranked by prevalence across observed salary records.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs px-2.5 py-1.5 border border-[#E2E2D9] rounded-md outline-hidden bg-[#F3EFE6]/30 focus:bg-white focus:border-[#172B2A] text-[#202B29] w-40"
              />
              <div className="flex flex-wrap gap-1">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition ${
                      selectedCategory === c
                        ? 'bg-[#172B2A] text-white font-medium shadow-2xs'
                        : 'bg-[#F3EFE6]/60 text-[#707B75] hover:bg-[#F3EFE6] hover:text-[#172B2A]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFE6]/70 text-[#172B2A] border-b border-[#E2E2D9] font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Skill Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Prevalence Count</th>
                  <th className="py-2.5 px-3">% of Records</th>
                  <th className="py-2.5 px-3 text-right">Median Salary (INR)</th>
                  <th className="py-2.5 px-3 text-right">Interquartile Band</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E2D9]/60">
                {filteredRankings.map((s, idx) => (
                  <tr key={s.skill_name} className="hover:bg-[#F3EFE6]/30 transition">
                    <td className="py-2.5 px-3 font-semibold text-[#172B2A] flex items-center space-x-1.5">
                      <span className="text-[10px] text-[#707B75] w-4">{idx + 1}.</span>
                      <span>{s.skill_name}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="bg-[#F3EFE6] text-[#707B75] border border-[#E2E2D9] px-2 py-0.5 rounded text-[10px]">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#202B29] tabular-nums font-mono">{s.frequency_count}</td>
                    <td className="py-2.5 px-3 text-[#707B75] tabular-nums font-mono">{s.percentage}%</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#172B2A] tabular-nums font-mono">
                      ₹{(s.median_salary / 100000).toFixed(2)} LPA
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#B66B45] tabular-nums font-mono">
                      ₹{(s.p25_salary / 100000).toFixed(1)} - {(s.p75_salary / 100000).toFixed(1)}L
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

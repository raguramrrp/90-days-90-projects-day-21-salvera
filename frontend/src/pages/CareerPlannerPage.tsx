import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Plus, Download, CheckCircle, Clock, Circle, 
  Trash2, FileText, ArrowRight, Target, Sparkles, BookOpen 
} from 'lucide-react';
import { api, CareerPlan, CareerPlanSkill, RoleOverview } from '../services/api';

export const CareerPlannerPage: React.FC = () => {
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [roles, setRoles] = useState<RoleOverview[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [currentRole, setCurrentRole] = useState('Junior Data Analyst');
  const [targetRoleId, setTargetRoleId] = useState<number>(3); // e.g. Data Scientist
  const [targetDate, setTargetDate] = useState('2025-12-31');
  const [targetSalary, setTargetSalary] = useState<number>(1800000);
  const [userSkills, setUserSkills] = useState<string>('SQL, Excel, Python');

  // Custom skill input
  const [customSkillName, setCustomSkillName] = useState('');
  const [customCategory, setCustomCategory] = useState('recommended_addition');
  const [customPriority, setCustomPriority] = useState('Medium');

  const fetchPlanAndRoles = async () => {
    try {
      setLoading(true);
      const [planRes, rolesRes] = await Promise.all([
        api.getCareerPlan(),
        api.getRoles(),
      ]);
      setPlan(planRes);
      setRoles(rolesRes);
      if (planRes) {
        setCurrentRole(planRes.current_role);
        setTargetRoleId(planRes.target_role_id);
        if (planRes.target_date) setTargetDate(planRes.target_date);
        if (planRes.target_salary_expectation) setTargetSalary(planRes.target_salary_expectation);
      }
    } catch (err) {
      console.error('Failed to load career plan', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanAndRoles();
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const skillList = userSkills.split(',').map(s => s.trim()).filter(Boolean);
      const newPlan = await api.createCareerPlan({
        current_role: currentRole,
        target_role_id: Number(targetRoleId),
        target_date: targetDate,
        target_salary_expectation: Number(targetSalary),
        current_skills: skillList,
      });
      setPlan(newPlan);
    } catch (err) {
      console.error('Failed to generate career plan', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (skill: CareerPlanSkill) => {
    const nextStatus = 
      skill.completion_status === 'Planned' ? 'In Progress' :
      skill.completion_status === 'In Progress' ? 'Completed' : 'Planned';
    
    try {
      await api.updateCareerSkillStatus(skill.id, nextStatus);
      // Refresh
      const updated = await api.getCareerPlan(plan?.id);
      setPlan(updated);
    } catch (err) {
      console.error('Failed to update skill status', err);
    }
  };

  const handleAddCustomSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSkillName.trim() || !plan) return;
    try {
      await api.addCareerCustomSkill(plan.id, {
        skill_name: customSkillName.trim(),
        category: customCategory,
        priority: customPriority,
        completion_status: 'Planned',
        order_index: (plan.skills_gap.length || 0) + 1,
        target_date: targetDate,
        notes: 'User defined custom learning milestone',
      });
      setCustomSkillName('');
      const updated = await api.getCareerPlan(plan.id);
      setPlan(updated);
    } catch (err) {
      console.error('Failed to add custom skill', err);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    if (!plan) return;
    try {
      await api.deleteCareerSkill(skillId);
      const updated = await api.getCareerPlan(plan.id);
      setPlan(updated);
    } catch (err) {
      console.error('Failed to delete skill', err);
    }
  };

  const handleExportPdf = () => {
    window.open('/api/career-plans/export-pdf', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2D9] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Career Planner & Skill Gap Analysis</h1>
            <p className="text-xs text-[#707B75] mt-0.5">
              Audit your current capabilities against target role requirements and track a personalized learning roadmap.
            </p>
          </div>
          <button
            onClick={handleExportPdf}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#172B2A] hover:bg-[#254240] text-white rounded-md text-xs font-semibold transition shadow-xs"
          >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Career Plan PDF</span>
        </button>
      </div>

      {/* Plan Setup Form */}
      <div className="bg-white border border-[#E3E7E3] rounded-lg p-5 shadow-xs">
        <h2 className="text-xs font-bold text-[#202723] uppercase tracking-wider mb-3">
          Career Target & Gap Analysis Setup
        </h2>
        <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Current Job Title / Status</label>
            <input
              type="text"
              required
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Target Job Role</label>
            <select
              value={targetRoleId}
              onChange={(e) => setTargetRoleId(Number(e.target.value))}
              className="w-full p-2 border border-[#CCD4CF] rounded bg-white outline-none"
            >
              {roles.map(r => <option key={r.id} value={r.id}>{r.canonical_title}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Expected Salary (Annual INR)</label>
            <input
              type="number"
              value={targetSalary}
              onChange={(e) => setTargetSalary(Number(e.target.value))}
              className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">
              Your Current Technical Skills (comma-separated)
            </label>
            <input
              type="text"
              value={userSkills}
              onChange={(e) => setUserSkills(e.target.value)}
              placeholder="e.g. SQL, Excel, Python, Git"
              className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 bg-[#286B59] hover:bg-[#1E5345] text-white font-semibold rounded text-xs transition shadow-xs"
            >
              Generate Gap Roadmap
            </button>
          </div>
        </form>
      </div>

      {/* Plan Dashboard & Roadmap */}
      {plan && (
        <div className="space-y-6">
          {/* Plan Status Banner */}
          <div className="bg-white border border-[#D5E0D8] rounded-lg p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#286B59] bg-[#EBF3EF] px-2 py-0.5 rounded">
                ACTIVE PLAN
              </span>
              <h2 className="text-lg font-bold text-[#202723] mt-1">
                {plan.current_role} → {plan.target_role_title}
              </h2>
              <div className="text-xs text-[#6B756F] mt-0.5">
                Target Timeline: {plan.target_date || 'Q4 2025'} • Target Expectation: ₹{((plan.target_salary_expectation || 0) / 100000).toFixed(1)} LPA
              </div>
            </div>

            <div className="w-full md:w-64 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#202723]">
                <span>Roadmap Progress</span>
                <span className="text-[#286B59]">{plan.completion_percentage}%</span>
              </div>
              <div className="w-full bg-[#EEF2EF] h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#286B59] h-full rounded-full transition-all duration-300"
                  style={{ width: `${plan.completion_percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-[#6B756F] text-right">
                {plan.skills_gap.filter(s => s.completion_status === 'Completed').length} of {plan.skills_gap.length} milestones complete
              </div>
            </div>
          </div>

          {/* Roadmap Milestones Table */}
          <div className="bg-white rounded-lg border border-[#E3E7E3] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E3E7E3] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#202723] tracking-tight">Structured Learning Roadmap</h3>
                <p className="text-[11px] text-[#6B756F]">Click any milestone status to advance progress.</p>
              </div>
              <span className="text-xs text-[#6B756F]">
                {plan.skills_gap.length} Total Milestones
              </span>
            </div>

            <div className="divide-y divide-[#F0F3F1]">
              {plan.skills_gap.map((skill, idx) => {
                const isDone = skill.completion_status === 'Completed';
                const isInProg = skill.completion_status === 'In Progress';

                return (
                  <div key={skill.id} className="p-3.5 flex items-center justify-between hover:bg-[#FAFBF9] transition text-xs">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleStatus(skill)}
                        className="text-[#6B756F] hover:text-[#286B59] transition"
                        title="Click to toggle status"
                      >
                        {isDone ? (
                          <CheckCircle className="w-5 h-5 text-[#286B59]" />
                        ) : isInProg ? (
                          <Clock className="w-5 h-5 text-[#B9853C]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#CCD4CF]" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`font-semibold ${isDone ? 'line-through text-[#8E9991]' : 'text-[#202723]'}`}>
                            {skill.skill_name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            skill.category === 'core_gap' ? 'bg-[#FAF0ED] text-[#B64E49]' :
                            skill.category === 'current_strength' ? 'bg-[#EAF5EF] text-[#286B59]' :
                            'bg-[#F0F4F2] text-[#4F5953]'
                          }`}>
                            {skill.category.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-[10px] text-[#8E9991]">Priority: {skill.priority}</span>
                        </div>
                        <div className="text-[11px] text-[#6B756F] mt-0.5">{skill.notes || 'Benchmark recommendation'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleStatus(skill)}
                        className={`text-xs px-2.5 py-1 rounded font-medium border transition ${
                          isDone ? 'bg-[#EBF3EF] border-[#C8DFD2] text-[#286B59]' :
                          isInProg ? 'bg-[#FAF5EB] border-[#ECD9BA] text-[#B9853C]' :
                          'bg-white border-[#CCD4CF] text-[#6B756F]'
                        }`}
                      >
                        {skill.completion_status}
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-[#8E9991] hover:text-[#B64E49] p-1"
                        title="Delete milestone"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Milestone Footer */}
            <form onSubmit={handleAddCustomSkill} className="p-3 bg-[#FAFBF9] border-t border-[#E3E7E3] flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#4F5953]">Add Milestone:</span>
              <input
                type="text"
                placeholder="Skill or certification name..."
                value={customSkillName}
                onChange={(e) => setCustomSkillName(e.target.value)}
                className="p-1.5 border border-[#CCD4CF] rounded bg-white outline-none flex-1 min-w-[180px]"
              />
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="p-1.5 border border-[#CCD4CF] rounded bg-white outline-none"
              >
                <option value="core_gap">Core Gap</option>
                <option value="recommended_addition">Recommended</option>
                <option value="advanced_specialization">Advanced</option>
              </select>
              <select
                value={customPriority}
                onChange={(e) => setCustomPriority(e.target.value)}
                className="p-1.5 border border-[#CCD4CF] rounded bg-white outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#286B59] text-white rounded font-medium shadow-xs"
              >
                Add Skill
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

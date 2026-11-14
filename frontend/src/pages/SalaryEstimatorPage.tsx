import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Sparkles, AlertCircle, CheckCircle2, Sliders, 
  HelpCircle, ChevronRight, BarChart2 
} from 'lucide-react';
import { api, PredictionResult } from '../services/api';

export const SalaryEstimatorPage: React.FC = () => {
  const [roleTitle, setRoleTitle] = useState('Data Scientist');
  const [experienceYears, setExperienceYears] = useState<number>(3.5);
  const [city, setCity] = useState('Bengaluru');
  const [industry, setIndustry] = useState('Information Technology');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Python', 'SQL', 'Machine Learning', 'PyTorch']);
  const [newSkill, setNewSkill] = useState('');

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [evalMeta, setEvalMeta] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const availableRoles = [
    'Data Analyst', 'Business Analyst', 'Data Scientist', 'Business Intelligence Analyst',
    'Data Engineer', 'Python Developer', 'Java Developer', 'Frontend Developer',
    'Backend Developer', 'Full Stack Developer', 'Software Engineer',
    'Machine Learning Engineer', 'AI Engineer', 'Deep Learning Engineer',
    'Computer Vision Engineer', 'QA Engineer', 'Software Test Engineer',
    'Cybersecurity Analyst', 'Cloud Engineer', 'DevOps Engineer', 'Site Reliability Engineer'
  ];

  const availableCities = ['Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Mumbai', 'Delhi NCR', 'Coimbatore'];
  const suggestedSkills = ['Python', 'SQL', 'FastAPI', 'PyTorch', 'AWS', 'Docker', 'Kubernetes', 'Tableau', 'Power BI', 'Scikit-learn', 'React', 'Git'];

  useEffect(() => {
    // Load model evaluation metadata
    const loadEval = async () => {
      try {
        const res = await api.getModelEvaluation();
        setEvalMeta(res);
      } catch (err) {
        console.error('Failed to load evaluation metadata', err);
      }
    };
    loadEval();
    handlePredict();
  }, []);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.predictSalary({
        role_title: roleTitle,
        experience_years: Number(experienceYears),
        city,
        skills: selectedSkills,
        industry,
        employment_type: employmentType,
      });
      setPrediction(res);
    } catch (err) {
      console.error('Failed to run salary estimation', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim())) {
      setSelectedSkills([...selectedSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Title & Header */}
        <div className="border-b border-[#E2E2D9] pb-4">
          <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Salary Estimator</h1>
          <p className="text-xs text-[#707B75] mt-0.5">
            Statistical compensation estimates and range intervals based on role, location, and technical profile.
          </p>
        </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Profile Parameters */}
        <div className="lg:col-span-5 bg-white border border-[#E3E7E3] rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#F0F3F1] pb-3">
            <span className="p-1.5 bg-[#EBF3EF] text-[#286B59] rounded">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#202723]">Profile Parameters</h2>
          </div>

          <form onSubmit={handlePredict} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Target Role</label>
              <select
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full p-2 border border-[#CCD4CF] rounded bg-white text-[#202723] outline-none"
              >
                {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-[#6B756F] font-semibold">Experience in Years</label>
                <span className="font-bold text-[#286B59]">{experienceYears} years</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full accent-[#286B59]"
              />
              <div className="flex justify-between text-[10px] text-[#8E9991] mt-0.5">
                <span>0 yrs (Entry)</span>
                <span>5 yrs (Mid)</span>
                <span>10+ yrs (Senior/Lead)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2 border border-[#CCD4CF] rounded bg-white text-[#202723] outline-none"
                >
                  {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full p-2 border border-[#CCD4CF] rounded bg-white text-[#202723] outline-none"
                >
                  <option value="Information Technology">IT / Software</option>
                  <option value="Fintech">Fintech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare Tech">HealthTech</option>
                  <option value="Enterprise Software">SaaS Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Candidate Technical Skills</label>
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAFBF9] border border-[#CCD4CF] rounded min-h-[50px]">
                {selectedSkills.map(s => (
                  <span key={s} className="bg-white border border-[#CBD5CD] text-[#202723] px-2 py-0.5 rounded text-[11px] flex items-center space-x-1">
                    <span>{s}</span>
                    <button type="button" onClick={() => toggleSkill(s)} className="text-[#8E9991] hover:text-[#B64E49]">
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-1.5 mt-2">
                <input
                  type="text"
                  placeholder="Type custom skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="flex-1 p-1.5 border border-[#CCD4CF] rounded outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-3 py-1 bg-[#286B59] text-white rounded font-medium"
                >
                  Add
                </button>
              </div>

              <div className="mt-2 text-[10px] text-[#6B756F]">
                Quick add:
                <div className="flex flex-wrap gap-1 mt-1">
                  {suggestedSkills.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSkill(s)}
                      className={`px-1.5 py-0.5 rounded border transition ${
                        selectedSkills.includes(s)
                          ? 'bg-[#286B59] text-white border-[#286B59]'
                          : 'bg-white text-[#4F5953] border-[#CCD4CF] hover:bg-[#F0F4F2]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2 bg-[#286B59] hover:bg-[#1E5345] text-white font-semibold text-xs rounded transition shadow-xs"
            >
              {loading ? 'Evaluating Model...' : 'Calculate Model Prediction'}
            </button>
          </form>
        </div>

        {/* Right Output: Model Estimation & Confidence Interval */}
        <div className="lg:col-span-7 space-y-4">
          {prediction && (
            <div className="bg-white border border-[#D5E0D8] rounded-lg p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#286B59] bg-[#EBF3EF] px-2 py-0.5 rounded">
                    ML PREDICTION RESULT
                  </span>
                  <div className="text-xs text-[#6B756F] mt-1">
                    Algorithm: {prediction.algorithm} (Version {prediction.model_version})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#6B756F]">Comparable Samples in DB</span>
                  <div className="text-xs font-bold text-[#202723]">{prediction.comparable_records_count} matching records</div>
                </div>
              </div>

              {/* Main Predicted Salary Number */}
              <div className="bg-[#FAFBF9] border border-[#DEE7E2] p-5 rounded-md text-center space-y-1">
                <span className="text-xs font-medium text-[#6B756F]">Estimated Market Value (Annualized)</span>
                <div className="text-3xl font-extrabold text-[#286B59]">
                  ₹{(prediction.predicted_annual_salary / 100000).toFixed(2)} LPA
                </div>
                <div className="text-xs text-[#4F5953] font-medium">
                  Equivalent to ~₹{Math.round(prediction.predicted_monthly_salary).toLocaleString()} per month
                </div>
              </div>

              {/* Prediction Interval Bar */}
              <div className="p-4 bg-white border border-[#E3E7E3] rounded-md space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#202723]">90% Statistical Uncertainty Range</span>
                  <span className="text-[11px] text-[#6B756F]">Residual Error Bounds</span>
                </div>

                <div className="relative pt-4 pb-2">
                  <div className="w-full bg-[#EEF2EF] h-3 rounded-full overflow-hidden relative">
                    <div className="bg-[#A5B8AC] h-full w-full rounded-full" />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#202723] mt-2">
                    <div>
                      <span className="block text-[10px] text-[#6B756F] font-normal">Lower Bound (P05)</span>
                      ₹{(prediction.lower_bound_salary / 100000).toFixed(2)} LPA
                    </div>
                    <div className="text-center">
                      <span className="block text-[10px] text-[#286B59] font-normal">Expected Median</span>
                      ₹{(prediction.predicted_annual_salary / 100000).toFixed(2)} LPA
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-[#6B756F] font-normal">Upper Bound (P95)</span>
                      ₹{(prediction.upper_bound_salary / 100000).toFixed(2)} LPA
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Association Breakdown */}
              <div>
                <h3 className="text-xs font-bold text-[#202723] mb-2 flex items-center justify-between">
                  <span>Major Factors Influencing This Prediction</span>
                  <span className="text-[10px] text-[#6B756F] font-normal">Trained Importance Weight</span>
                </h3>

                <div className="space-y-1.5">
                  {prediction.feature_contributions.map((f, i) => (
                    <div key={i} className="flex items-center justify-between text-xs p-2 rounded bg-[#FAFBF9] border border-[#E8ECE9]">
                      <span className={`font-medium ${f.active_in_profile ? 'text-[#286B59]' : 'text-[#6B756F]'}`}>
                        {f.factor}
                      </span>
                      <div className="flex items-center space-x-2">
                        {f.active_in_profile && (
                          <span className="text-[10px] bg-[#EBF3EF] text-[#286B59] px-1.5 py-0.5 rounded font-medium">
                            Active in query
                          </span>
                        )}
                        <span className="text-xs font-semibold text-[#4F5953]">
                          {(f.importance_weight * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Honest Disclaimer */}
              <div className="bg-[#FAF7F2] p-3 rounded border border-[#EEDCC4] text-[11px] text-[#6B532F] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#B9853C] mt-0.5" />
                <span>{prediction.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Evaluation Benchmarks Table */}
      {evalMeta && (
        <div className="bg-white border border-[#E3E7E3] rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-2">
            <div>
              <h2 className="text-sm font-bold text-[#202723]">Model Comparison & Cross-Validation Benchmarks</h2>
              <p className="text-[11px] text-[#6B756F]">Trained scikit-learn regressors evaluated on held-out 20% test records without data leakage.</p>
            </div>
            <span className="text-xs text-[#286B59] font-semibold bg-[#EBF3EF] px-2 py-0.5 rounded">
              Selected: {evalMeta.best_model}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF9] text-[#4F5953] border-b border-[#E3E7E3] font-semibold">
                <tr>
                  <th className="py-2 px-3">Algorithm</th>
                  <th className="py-2 px-3">R² Score (Variance Explained)</th>
                  <th className="py-2 px-3">Mean Absolute Error (MAE)</th>
                  <th className="py-2 px-3">Root Mean Squared Error (RMSE)</th>
                  <th className="py-2 px-3">Median Absolute Error</th>
                  <th className="py-2 px-3">Train / Test Split</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F3F1]">
                {Object.entries(evalMeta.models_comparison || {}).map(([name, m]: [string, any]) => {
                  const isBest = name === evalMeta.best_model;
                  return (
                    <tr key={name} className={isBest ? 'bg-[#FAFBF9] font-medium' : ''}>
                      <td className="py-2.5 px-3 flex items-center space-x-1.5">
                        {isBest && <CheckCircle2 className="w-3.5 h-3.5 text-[#286B59]" />}
                        <span className="font-semibold text-[#202723]">{name}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-[#286B59]">{(m.r2_score * 100).toFixed(1)}%</span>
                      </td>
                      <td className="py-2.5 px-3">₹{Math.round(m.mae).toLocaleString()}</td>
                      <td className="py-2.5 px-3">₹{Math.round(m.rmse).toLocaleString()}</td>
                      <td className="py-2.5 px-3">₹{Math.round(m.median_abs_error).toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-[#6B756F]">{m.train_samples} / {m.test_samples}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Sparkles, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  IndianRupee, 
  Check, 
  Plus, 
  X, 
  Save,
  Building2,
  Calendar
} from 'lucide-react';
import { api, CareerProfile } from '../services/api';

interface CareerProfilePageProps {
  onNavigateToFindJobs?: () => void;
  onNavigateToRecommendations?: () => void;
}

export const CareerProfilePage: React.FC<CareerProfilePageProps> = ({
  onNavigateToFindJobs,
  onNavigateToRecommendations
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Form States
  const [profileTitle, setProfileTitle] = useState<string>('Data & AI Aspirant');
  const [candidateType, setCandidateType] = useState<string>('Student');
  const [educationDegree, setEducationDegree] = useState<string>('B.Tech Artificial Intelligence & Data Science');
  const [graduationYear, setGraduationYear] = useState<number>(2025);
  const [experienceYears, setExperienceYears] = useState<number>(0.5);
  const [currentCity, setCurrentCity] = useState<string>('Chennai');
  const [minSalaryLpa, setMinSalaryLpa] = useState<number>(5.0);

  // Multi-item collections
  const [targetRoles, setTargetRoles] = useState<string[]>(['Data Analyst', 'Machine Learning Engineer']);
  const [newRoleInput, setNewRoleInput] = useState<string>('');

  const [primarySkills, setPrimarySkills] = useState<string[]>(['Python', 'SQL', 'Power BI', 'Pandas', 'Machine Learning']);
  const [newPrimarySkillInput, setNewPrimarySkillInput] = useState<string>('');

  const [secondarySkills, setSecondarySkills] = useState<string[]>(['FastAPI', 'Docker', 'Git']);
  const [newSecondarySkillInput, setNewSecondarySkillInput] = useState<string>('');

  const [preferredCities, setPreferredCities] = useState<string[]>(['Chennai', 'Bengaluru', 'Hyderabad', 'Coimbatore']);
  const [preferredWorkModes, setPreferredWorkModes] = useState<string[]>(['Hybrid', 'Remote', 'On-site']);
  const [preferredEmpTypes, setPreferredEmpTypes] = useState<string[]>(['Full-time', 'Internship']);

  const ALL_CITIES = ['Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Coimbatore', 'Tirunelveli', 'Madurai', 'Kochi'];
  const WORK_MODES = ['Hybrid', 'Remote', 'On-site'];
  const EMP_TYPES = ['Full-time', 'Internship'];

  // Load profile from API
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getCareerProfile();
        if (data) {
          setProfileTitle(data.profile_title || 'Data & AI Aspirant');
          setCandidateType(data.candidate_type || 'Student');
          setEducationDegree(data.education_degree || 'B.Tech Artificial Intelligence & Data Science');
          setGraduationYear(data.graduation_year || 2025);
          setExperienceYears(data.experience_years || 0.5);
          setCurrentCity(data.current_city || 'Chennai');
          setMinSalaryLpa(data.min_expected_salary ? Number((data.min_expected_salary / 100000).toFixed(1)) : 5.0);
          setTargetRoles(data.target_roles || ['Data Analyst']);
          setPrimarySkills(data.primary_skills || ['Python', 'SQL']);
          setSecondarySkills(data.secondary_skills || ['Git']);
          setPreferredCities(data.preferred_cities || ['Chennai', 'Bengaluru']);
          setPreferredWorkModes(data.preferred_work_modes || ['Hybrid', 'Remote']);
          setPreferredEmpTypes(data.preferred_employment_types || ['Full-time', 'Internship']);
        }
      } catch (err) {
        console.error('Error loading career profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload: Partial<CareerProfile> = {
        profile_title: profileTitle,
        candidate_type: candidateType,
        education_degree: educationDegree,
        graduation_year: graduationYear,
        experience_years: experienceYears,
        current_city: currentCity,
        min_expected_salary: minSalaryLpa * 100000,
        target_roles: targetRoles,
        primary_skills: primarySkills,
        secondary_skills: secondarySkills,
        preferred_cities: preferredCities,
        preferred_work_modes: preferredWorkModes,
        preferred_employment_types: preferredEmpTypes,
      };

      await api.updateCareerProfile(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving career profile:', err);
    } finally {
      setSaving(false);
    }
  };

  // Helper additions
  const addTargetRole = () => {
    if (newRoleInput.trim() && !targetRoles.includes(newRoleInput.trim())) {
      setTargetRoles([...targetRoles, newRoleInput.trim()]);
      setNewRoleInput('');
    }
  };

  const removeTargetRole = (role: string) => {
    setTargetRoles(targetRoles.filter(r => r !== role));
  };

  const addPrimarySkill = () => {
    if (newPrimarySkillInput.trim() && !primarySkills.includes(newPrimarySkillInput.trim())) {
      setPrimarySkills([...primarySkills, newPrimarySkillInput.trim()]);
      setNewPrimarySkillInput('');
    }
  };

  const removePrimarySkill = (sk: string) => {
    setPrimarySkills(primarySkills.filter(s => s !== sk));
  };

  const addSecondarySkill = () => {
    if (newSecondarySkillInput.trim() && !secondarySkills.includes(newSecondarySkillInput.trim())) {
      setSecondarySkills([...secondarySkills, newSecondarySkillInput.trim()]);
      setNewSecondarySkillInput('');
    }
  };

  const removeSecondarySkill = (sk: string) => {
    setSecondarySkills(secondarySkills.filter(s => s !== sk));
  };

  const toggleCity = (city: string) => {
    if (preferredCities.includes(city)) {
      setPreferredCities(preferredCities.filter(c => c !== city));
    } else {
      setPreferredCities([...preferredCities, city]);
    }
  };

  const toggleWorkMode = (mode: string) => {
    if (preferredWorkModes.includes(mode)) {
      setPreferredWorkModes(preferredWorkModes.filter(m => m !== mode));
    } else {
      setPreferredWorkModes([...preferredWorkModes, mode]);
    }
  };

  const toggleEmpType = (type: string) => {
    if (preferredEmpTypes.includes(type)) {
      setPreferredEmpTypes(preferredEmpTypes.filter(t => t !== type));
    } else {
      setPreferredEmpTypes([...preferredEmpTypes, type]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E2D9] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9] uppercase tracking-wider">
                Candidate Profile
              </span>
              <span className="text-xs text-[#707B75]">India Career Preferences</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172B2A] mt-1">
              Your Career & Recommendation Preferences
            </h1>
            <p className="text-xs sm:text-sm text-[#707B75] mt-0.5">
              Customize your target roles, skills, and city preferences to calibrate the recommendation scoring engine.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {onNavigateToRecommendations && (
              <button
                type="button"
                onClick={onNavigateToRecommendations}
                className="px-3.5 py-2 bg-[#F3EFE6] hover:bg-[#EAE4D5] text-[#172B2A] text-xs font-semibold rounded-md border border-[#E2E2D9] transition flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B66B45]" />
                <span>View Recommendations</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {saveSuccess && (
          <div className="mb-4 p-3 bg-[#EBF3EF] border border-[#286B59] text-[#286B59] text-xs font-semibold rounded-md flex items-center space-x-2">
            <Check className="w-4 h-4 text-[#286B59]" />
            <span>Preferences saved successfully! Recommendations are refreshed based on your updated criteria.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Section 1: Candidate Persona & Experience */}
          <div className="bg-white p-5 rounded-md border border-[#E3E7E3] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1E2521] uppercase tracking-wider border-b border-[#F0F3F1] pb-2">
              1. Candidate Persona & Background
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Profile Headline / Title
                </label>
                <input
                  type="text"
                  value={profileTitle}
                  onChange={(e) => setProfileTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Candidate Status
                </label>
                <select
                  value={candidateType}
                  onChange={(e) => setCandidateType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                >
                  <option value="Student">Final-Year Student</option>
                  <option value="Fresher">Recent Graduate / Fresher (0–1 yr)</option>
                  <option value="Working Professional">Technology Professional (1+ yrs)</option>
                  <option value="Career Switcher">Career Switcher</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Degree / Education Discipline
                </label>
                <input
                  type="text"
                  value={educationDegree}
                  onChange={(e) => setEducationDegree(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-[#404D45] mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#404D45] mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="30"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Target Roles & Career Aims */}
          <div className="bg-white p-5 rounded-md border border-[#E3E7E3] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1E2521] uppercase tracking-wider border-b border-[#F0F3F1] pb-2">
              2. Target Technology Roles (25% Recommendation Weight)
            </h2>

            <div className="flex flex-wrap gap-1.5">
              {targetRoles.map(role => (
                <span key={role} className="flex items-center space-x-1 px-2.5 py-1 bg-[#EBF3EF] text-[#286B59] text-xs font-semibold rounded border border-[#C5DCD0]">
                  <span>{role}</span>
                  <button type="button" onClick={() => removeTargetRole(role)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRoleInput}
                onChange={(e) => setNewRoleInput(e.target.value)}
                placeholder="Add target role (e.g. 'Data Analyst', 'Frontend Developer')..."
                className="flex-1 px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTargetRole(); } }}
              />
              <button
                type="button"
                onClick={addTargetRole}
                className="px-3 py-1.5 bg-[#286B59] text-white text-xs font-semibold rounded hover:bg-[#1E5345] transition flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Role</span>
              </button>
            </div>
          </div>

          {/* Section 3: Technical Skills */}
          <div className="bg-white p-5 rounded-md border border-[#E3E7E3] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1E2521] uppercase tracking-wider border-b border-[#F0F3F1] pb-2">
              3. Technical Skills (40% Recommendation Weight)
            </h2>

            {/* Primary Skills */}
            <div>
              <label className="block text-xs font-medium text-[#404D45] mb-1.5">
                Primary Core Skills (Ranked Highest in Matching)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {primarySkills.map(sk => (
                  <span key={sk} className="flex items-center space-x-1 px-2.5 py-1 bg-[#286B59] text-white text-xs font-medium rounded">
                    <span>{sk}</span>
                    <button type="button" onClick={() => removePrimarySkill(sk)} className="hover:text-red-200">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPrimarySkillInput}
                  onChange={(e) => setNewPrimarySkillInput(e.target.value)}
                  placeholder="Add primary skill (e.g. Python, SQL, React)..."
                  className="flex-1 px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPrimarySkill(); } }}
                />
                <button
                  type="button"
                  onClick={addPrimarySkill}
                  className="px-3 py-1.5 bg-[#286B59] text-white text-xs font-semibold rounded hover:bg-[#1E5345]"
                >
                  Add Core Skill
                </button>
              </div>
            </div>

            {/* Secondary Skills */}
            <div className="pt-2 border-t border-[#F0F3F1]">
              <label className="block text-xs font-medium text-[#404D45] mb-1.5">
                Secondary / Complementary Skills
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {secondarySkills.map(sk => (
                  <span key={sk} className="flex items-center space-x-1 px-2 py-0.5 bg-[#F0F4F2] text-[#3D4741] text-xs font-medium rounded border border-[#DFE5E1]">
                    <span>{sk}</span>
                    <button type="button" onClick={() => removeSecondarySkill(sk)} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSecondarySkillInput}
                  onChange={(e) => setNewSecondarySkillInput(e.target.value)}
                  placeholder="Add secondary skill (e.g. Git, Docker, Excel)..."
                  className="flex-1 px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSecondarySkill(); } }}
                />
                <button
                  type="button"
                  onClick={addSecondarySkill}
                  className="px-3 py-1.5 bg-[#525E56] text-white text-xs font-semibold rounded hover:bg-[#3D4741]"
                >
                  Add Secondary
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Location, Work Mode & Compensation */}
          <div className="bg-white p-5 rounded-md border border-[#E3E7E3] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#1E2521] uppercase tracking-wider border-b border-[#F0F3F1] pb-2">
              4. Location & Working Arrangements (India Only)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Current City
                </label>
                <select
                  value={currentCity}
                  onChange={(e) => setCurrentCity(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                >
                  {ALL_CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Minimum Target Annual Salary (in LPA)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="100"
                    value={minSalaryLpa}
                    onChange={(e) => setMinSalaryLpa(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  />
                  <span className="text-xs text-[#6B756F] font-semibold shrink-0">LPA</span>
                </div>
              </div>
            </div>

            {/* Preferred Cities */}
            <div>
              <label className="block text-xs font-medium text-[#404D45] mb-1.5">
                Preferred Cities for Employment (India)
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_CITIES.map(city => {
                  const isChecked = preferredCities.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`px-3 py-1 text-xs rounded border transition ${
                        isChecked 
                          ? 'bg-[#EBF3EF] border-[#286B59] text-[#286B59] font-semibold' 
                          : 'bg-white border-[#DCE2DD] text-[#5C6660] hover:bg-[#F6F8F6]'
                      }`}
                    >
                      {city} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Modes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#F0F3F1]">
              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1.5">
                  Preferred Work Modes
                </label>
                <div className="flex gap-2">
                  {WORK_MODES.map(mode => {
                    const isChecked = preferredWorkModes.includes(mode);
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => toggleWorkMode(mode)}
                        className={`px-3 py-1 text-xs rounded border transition ${
                          isChecked 
                            ? 'bg-[#EBF3EF] border-[#286B59] text-[#286B59] font-semibold' 
                            : 'bg-white border-[#DCE2DD] text-[#5C6660]'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1.5">
                  Preferred Employment Types
                </label>
                <div className="flex gap-2">
                  {EMP_TYPES.map(type => {
                    const isChecked = preferredEmpTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleEmpType(type)}
                        className={`px-3 py-1 text-xs rounded border transition ${
                          isChecked 
                            ? 'bg-[#EBF3EF] border-[#286B59] text-[#286B59] font-semibold' 
                            : 'bg-white border-[#DCE2DD] text-[#5C6660]'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            {onNavigateToFindJobs && (
              <button
                type="button"
                onClick={onNavigateToFindJobs}
                className="px-4 py-2 border border-[#DCE2DD] bg-white text-[#404D45] text-xs font-semibold rounded hover:bg-[#F6F8F6] transition"
              >
                Back to Find Jobs
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#286B59] hover:bg-[#1E5345] text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Career Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

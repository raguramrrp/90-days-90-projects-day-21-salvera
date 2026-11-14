import React, { useState } from 'react';
import { Settings as SettingsIcon, User, RefreshCw, CheckCircle2, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [profileName, setProfileName] = useState('Ragu Ram P');
  const [targetRole, setTargetRole] = useState('AI & Data Science Engineer');
  const [preferredCity, setPreferredCity] = useState('Bengaluru');
  const [currency, setCurrency] = useState('INR');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="border-b border-[#E2E2D9] pb-4">
          <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Application & Profile Settings</h1>
          <p className="text-xs text-[#707B75] mt-0.5">
            Configure local demonstration persona, reporting currency, and privacy preferences.
          </p>
        </div>

      <div className="bg-white border border-[#E3E7E3] rounded-lg p-6 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="flex items-center space-x-2 border-b border-[#F0F3F1] pb-3 text-sm font-bold text-[#202723]">
            <User className="w-4 h-4 text-[#286B59]" />
            <span>Local User Persona</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Target Professional Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Preferred Location</label>
              <select
                value={preferredCity}
                onChange={(e) => setPreferredCity(e.target.value)}
                className="w-full p-2 border border-[#CCD4CF] rounded bg-white outline-none"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Coimbatore">Coimbatore</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Default Base Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-[#CCD4CF] rounded bg-white outline-none"
              >
                <option value="INR">Indian Rupee (INR - ₹)</option>
                <option value="USD">US Dollar (USD - $)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F0F3F1] flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-[#286B59] hover:bg-[#1E5345] text-white font-semibold rounded text-xs transition shadow-xs"
            >
              Save Profile Settings
            </button>
            {saved && (
              <span className="text-xs text-[#286B59] flex items-center space-x-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Preferences saved!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="bg-[#FAFBF9] border border-[#CCD4CF] rounded-lg p-5 text-xs text-[#4F5953] space-y-2">
        <div className="flex items-center space-x-2 font-bold text-[#202723]">
          <Shield className="w-4 h-4 text-[#286B59]" />
          <span>Local Privacy & Offline Persistence</span>
        </div>
        <p className="leading-relaxed">
          SALVERA runs entirely within your local execution environment with PostgreSQL / SQLite storage. No personal data, entered offers, or career profiles are dispatched to external cloud servers or commercial trackers.
        </p>
      </div>
    </div>
  </div>
  );
};

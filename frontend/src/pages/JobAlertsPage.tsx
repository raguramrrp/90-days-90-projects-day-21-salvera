import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  MapPin, 
  Check, 
  Clock, 
  Trash2, 
  Briefcase, 
  IndianRupee, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { api, JobAlertItem, JobNotificationItem } from '../services/api';

export const JobAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<JobAlertItem[]>([]);
  const [notifications, setNotifications] = useState<JobNotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New alert form state
  const [alertTitle, setAlertTitle] = useState<string>('');
  const [roleKeywords, setRoleKeywords] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Chennai');
  const [minSalaryLpa, setMinSalaryLpa] = useState<number>(6.0);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const CITIES = ['All India', 'Chennai', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Coimbatore'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, notifsRes] = await Promise.all([
        api.getJobAlerts(),
        api.getNotifications()
      ]);
      setAlerts(alertsRes || []);
      setNotifications(notifsRes || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim()) return;
    setSaving(true);

    try {
      await api.createJobAlert({
        alert_title: alertTitle.trim(),
        role_keywords: roleKeywords.trim() || undefined,
        city: selectedCity !== 'All India' ? selectedCity : undefined,
        min_salary: minSalaryLpa * 100000,
      });

      setSuccessMsg('Job alert created and active!');
      setAlertTitle('');
      setRoleKeywords('');
      setShowCreateModal(false);
      fetchData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      console.error('Error creating job alert:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E2D9] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#F3EFE6] text-[#172B2A] border border-[#E2E2D9] uppercase tracking-wider">
                India Job Alerts
              </span>
              <span className="text-xs text-[#707B75]">Automated Opportunity Monitoring</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172B2A] mt-1">
              Active Job Alerts & Notification Feed
            </h1>
            <p className="text-xs sm:text-sm text-[#707B75] mt-0.5">
              Set automated notifications for new Indian tech openings matching your target roles, skills, and city hubs.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded-md shadow-xs transition flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-[#D5B66D]" />
            <span>Create New Alert</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {successMsg && (
          <div className="p-3 bg-[#EBF3EF] border border-[#286B59] text-[#286B59] text-xs font-semibold rounded-md flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#286B59]" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Alerts List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-bold text-[#6B756F] uppercase tracking-wider">
              Active Alert Rules ({alerts.length})
            </h2>

            {loading ? (
              <div className="text-xs text-[#6B756F]">Loading alert criteria...</div>
            ) : alerts.length === 0 ? (
              <div className="bg-white rounded-md border border-[#E3E7E3] p-8 text-center">
                <Bell className="w-8 h-8 text-[#98A39B] mx-auto mb-2 opacity-60" />
                <h3 className="text-sm font-semibold text-[#202723]">No active job alerts</h3>
                <p className="text-xs text-[#6B756F] mt-1">
                  Create a job alert to automatically track matching tech roles across Indian cities.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-3 px-3 py-1.5 bg-[#286B59] text-white text-xs font-semibold rounded hover:bg-[#1E5345]"
                >
                  Create Your First Alert
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map(a => (
                  <div key={a.id} className="bg-white rounded-md border border-[#E3E7E3] p-4 shadow-xs flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#286B59]"></span>
                        <h3 className="text-sm font-bold text-[#1E2521]">{a.alert_title}</h3>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#EBF3EF] text-[#286B59] font-semibold">
                          ACTIVE
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#525E56] mt-2">
                        {a.role_keywords && (
                          <span className="flex items-center space-x-1">
                            <Briefcase className="w-3 h-3 text-[#286B59]" />
                            <span>Role: {a.role_keywords}</span>
                          </span>
                        )}
                        {a.city && (
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-[#286B59]" />
                            <span>City: {a.city}</span>
                          </span>
                        )}
                        {a.min_salary && (
                          <span className="flex items-center space-x-1">
                            <IndianRupee className="w-3 h-3 text-[#286B59]" />
                            <span>Min: ₹{(a.min_salary / 100000).toFixed(1)} LPA</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-xs font-bold text-[#6B756F] uppercase tracking-wider">
              Recent Opportunity Alerts ({notifications.length})
            </h2>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-md border border-[#E3E7E3] p-6 text-center text-xs text-[#6B756F]">
                No recent alert triggers recorded.
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.map(n => (
                  <div key={n.id} className="bg-white rounded-md border border-[#E3E7E3] p-3 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#202723]">{n.title}</h4>
                      <span className="text-[10px] text-[#8C9890]">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#525E56] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialog */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#DCE2DD] max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-2">
              <h3 className="text-sm font-bold text-[#1E2521]">Create Indian Job Alert</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#8C9890] hover:text-[#202723]">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  value={alertTitle}
                  onChange={(e) => setAlertTitle(e.target.value)}
                  placeholder="e.g. Chennai Data Analyst Openings"
                  className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#404D45] mb-1">
                  Target Role Keywords
                </label>
                <input
                  type="text"
                  value={roleKeywords}
                  onChange={(e) => setRoleKeywords(e.target.value)}
                  placeholder="e.g. Data Analyst, Python Developer"
                  className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#404D45] mb-1">
                    City (India)
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  >
                    {CITIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#404D45] mb-1">
                    Min Salary (LPA)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={minSalaryLpa}
                    onChange={(e) => setMinSalaryLpa(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-[#F6F8F6] border border-[#DCE2DD] rounded text-xs text-[#202723] focus:bg-white focus:border-[#286B59] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-[#DCE2DD] text-xs font-medium rounded hover:bg-[#F6F8F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#286B59] hover:bg-[#1E5345] text-white text-xs font-semibold rounded shadow-xs disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Save Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { 
  Eye, Plus, Trash2, TrendingUp, TrendingDown, Bell, CheckCircle2, 
  Briefcase, Sparkles, MapPin, AlertCircle 
} from 'lucide-react';
import { api, WatchlistItem } from '../services/api';

export const MarketWatchPage: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Add Item form state
  const [itemType, setItemType] = useState('role');
  const [itemName, setItemName] = useState('Machine Learning Engineer');

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const res = await api.getWatchlists();
      setWatchlist(res);
    } catch (err) {
      console.error('Failed to load watchlist', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    try {
      await api.addWatchlist({
        item_type: itemType,
        item_name: itemName.trim(),
      });
      setShowAddModal(false);
      setItemName('');
      fetchWatchlist();
    } catch (err) {
      console.error('Failed to add to watchlist', err);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      await api.removeWatchlist(id);
      fetchWatchlist();
    } catch (err) {
      console.error('Failed to remove from watchlist', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2D9] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Market Watch & Compensation Tracking</h1>
            <p className="text-xs text-[#707B75] mt-0.5">
              Monitor target roles, essential skills, and technology hubs against baseline survey snapshots.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#172B2A] hover:bg-[#254240] text-white rounded-md text-xs font-semibold transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#D5B66D]" />
            <span>Follow Item</span>
          </button>
        </div>

      {/* Watchlist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {watchlist.map((item) => {
          const isUp = (item.salary_change_pct || 0) >= 0;
          return (
            <div key={item.id} className="bg-white border border-[#D5E0D8] rounded-lg p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#286B59] bg-[#EBF3EF] px-2 py-0.5 rounded">
                    {item.item_type}
                  </span>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-[#8E9991] hover:text-[#B64E49] text-xs p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-[#202723] mt-2">{item.item_name}</h3>

                <div className="mt-3 py-3 border-y border-[#F0F3F1] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B756F]">Current Market Median:</span>
                    <span className="font-extrabold text-sm text-[#202723]">
                      {item.current_median_salary ? `₹${(item.current_median_salary / 100000).toFixed(1)} LPA` : 'Calculating...'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B756F]">Baseline Snapshot:</span>
                    <span className="text-[#4F5953]">
                      {item.baseline_median_salary ? `₹${(item.baseline_median_salary / 100000).toFixed(1)} LPA` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B756F]">Active Sample Volume:</span>
                    <span className="font-semibold text-[#202723]">{item.current_sample_count || 0} observations</span>
                  </div>
                </div>

                {item.salary_change_pct !== undefined && item.salary_change_pct !== null && (
                  <div className={`mt-3 p-2 rounded text-xs flex items-center justify-between ${
                    isUp ? 'bg-[#EAF5EF] text-[#286B59]' : 'bg-[#FAF0F0] text-[#B64E49]'
                  }`}>
                    <span className="font-medium flex items-center space-x-1">
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>Snapshot Differential:</span>
                    </span>
                    <span className="font-bold">{isUp ? `+${item.salary_change_pct}%` : `${item.salary_change_pct}%`}</span>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-[#6B756F] border-t border-[#F0F3F1] pt-2 flex justify-between">
                <span>Tracking since: {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Active'}</span>
                <span className="text-[#286B59] font-medium">Active Alert</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-App System Activity & Notification Feed */}
      <div className="bg-white border border-[#E3E7E3] rounded-lg p-5 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 border-b border-[#F0F3F1] pb-3">
          <Bell className="w-4 h-4 text-[#286B59]" />
          <h2 className="text-sm font-bold text-[#202723]">Verified Platform Events & Snapshot Log</h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#FAFBF9] border border-[#E8ECE9] rounded flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#286B59] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#202723]">SALVERA Benchmark Corpus 2024-2025 Initialized</div>
              <div className="text-[#6B756F] text-[11px] mt-0.5">
                Ingested 2,250 multi-factor tech compensation records across 7 Indian technology hubs.
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#FAFBF9] border border-[#E8ECE9] rounded flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#286B59] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-[#202723]">Salary Regressor v1.0.0 Deployed</div>
              <div className="text-[#6B756F] text-[11px] mt-0.5">
                Gradient Boosting Regressor achieved R² = 85.5% on held-out test records with multi-hot skill encoding.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleAddItem} className="bg-white rounded-lg border border-[#E3E7E3] shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E3E7E3] pb-3">
              <h2 className="text-sm font-bold text-[#202723]">Add to Market Watchlist</h2>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[#8E9991] hover:text-[#202723] text-lg font-bold">
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Tracked Category</label>
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full p-2 border border-[#CCD4CF] rounded bg-white outline-none"
                >
                  <option value="role">Job Role</option>
                  <option value="skill">Technical Skill</option>
                  <option value="location">City / Location</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Scientist, PyTorch, Bengaluru"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-2 border border-[#CCD4CF] rounded outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E3E7E3] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-[#F6F7F5] text-[#202723] text-xs font-medium rounded border border-[#CCD4CF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#286B59] hover:bg-[#1E5345] text-white text-xs font-semibold rounded shadow-xs"
              >
                Follow Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </div>
  );
};

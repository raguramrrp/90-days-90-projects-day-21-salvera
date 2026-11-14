import React, { useState, useEffect } from 'react';
import { 
  MapPin, Download, CheckSquare, Square, Building2, TrendingUp, DollarSign, ArrowRight 
} from 'lucide-react';
import { api, LocationOverview } from '../services/api';

export const LocationIntelligencePage: React.FC = () => {
  const [locations, setLocations] = useState<LocationOverview[]>([]);
  const [selectedCities, setSelectedCities] = useState<string[]>(['Bengaluru', 'Chennai', 'Hyderabad']);
  const [comparisonResults, setComparisonResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const res = await api.getLocations();
      setLocations(res);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchComparison = async () => {
    if (selectedCities.length === 0) return;
    try {
      const res = await api.compareLocations(selectedCities);
      setComparisonResults(res);
    } catch (err) {
      console.error('Failed to compare cities', err);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [selectedCities]);

  const toggleCitySelection = (city: string) => {
    if (selectedCities.includes(city)) {
      if (selectedCities.length > 1) {
        setSelectedCities(selectedCities.filter(c => c !== city));
      }
    } else {
      if (selectedCities.length < 4) {
        setSelectedCities([...selectedCities, city]);
      }
    }
  };

  const handleExportCsv = () => {
    window.open('/api/locations/export-csv', '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Title & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E2D9] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Location Intelligence & City Differentials</h1>
            <p className="text-xs text-[#707B75] mt-0.5">
              Compare compensation premiums, cost-of-living indices, and hiring density across major Indian tech clusters.
            </p>
          </div>
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#172B2A] rounded-md text-xs font-medium transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-[#B66B45]" />
            <span>Export Locations CSV</span>
          </button>
        </div>

      {/* City Comparison Studio */}
      <div className="bg-white border border-[#E3E7E3] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0F3F1] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#202723]">Cross-City Compensation & COL Comparison</h2>
            <p className="text-[11px] text-[#6B756F]">Select up to 4 cities to evaluate salary differentials against cost-of-living benchmarks.</p>
          </div>
          <span className="text-xs font-semibold text-[#286B59] bg-[#EBF3EF] px-2.5 py-1 rounded">
            {selectedCities.length} Cities Selected
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {comparisonResults.map((c) => (
            <div key={c.city} className="p-4 rounded border border-[#D5E0D8] bg-[#FAFBF9] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#286B59] bg-white px-2 py-0.5 rounded border border-[#DEE7E2]">
                  {c.tier}
                </span>
                <span className="text-xs text-[#6B756F]">{c.state}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-[#202723]">{c.city}</h3>
                <div className="text-lg font-extrabold text-[#286B59] mt-0.5">
                  ₹{(c.median_salary / 100000).toFixed(1)} LPA
                </div>
                <div className="text-[10px] text-[#6B756F]">Median Normalized Tech Compensation</div>
              </div>

              <div className="space-y-1.5 text-[11px] border-t border-[#E8ECE9] pt-2">
                <div className="flex justify-between">
                  <span className="text-[#6B756F]">COL Benchmark Index:</span>
                  <span className="font-semibold text-[#202723]">{c.col_index} (Baseline 100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B756F]">Middle 50% Spread:</span>
                  <span className="font-semibold text-[#202723]">₹{(c.p25_salary / 100000).toFixed(1)} - {(c.p75_salary / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B756F]">Avg Experience:</span>
                  <span className="font-semibold text-[#202723]">{c.avg_experience} yrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B756F]">Sample Size:</span>
                  <span className="font-semibold text-[#202723]">{c.record_count} records</span>
                </div>
              </div>

              <div className="border-t border-[#E8ECE9] pt-2 text-[10px]">
                <strong className="text-[#6B756F] block mb-1">Top Hiring Roles:</strong>
                <div className="flex flex-wrap gap-1">
                  {c.top_roles.map((r: any) => (
                    <span key={r.role} className="bg-white px-1.5 py-0.5 rounded border border-[#CCD4CF] text-[#202723]">
                      {r.role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Directory Cards */}
      <div>
        <h2 className="text-sm font-bold text-[#202723] mb-3">Indian Technology Hubs Directory</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {locations.map((loc) => {
            const isSelected = selectedCities.includes(loc.city);
            return (
              <div 
                key={loc.id} 
                className={`bg-white rounded-md border p-4 shadow-xs transition flex flex-col justify-between ${
                  isSelected ? 'border-[#286B59] bg-[#FAFBF9]' : 'border-[#E3E7E3] hover:border-[#CCD4CF]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[#286B59] bg-[#EBF3EF] px-2 py-0.5 rounded">
                      {loc.tier}
                    </span>
                    <button
                      onClick={() => toggleCitySelection(loc.city)}
                      className="text-xs flex items-center space-x-1 text-[#286B59] hover:text-[#1E5345]"
                    >
                      {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-[#8E9991]" />}
                      <span className="text-[10px]">{isSelected ? 'Comparing' : 'Compare'}</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-[#202723] mt-2">{loc.city}</h3>
                  <div className="text-[11px] text-[#6B756F]">{loc.state}, India</div>

                  <div className="mt-3 py-2 border-y border-[#F0F3F1] space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#6B756F]">Median Base:</span>
                      <span className="font-bold text-[#202723]">₹{(loc.median_salary / 100000).toFixed(1)} LPA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756F]">COL Relative:</span>
                      <span className="font-semibold text-[#4F5953]">{loc.col_index}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6B756F]">Benchmark Volume:</span>
                      <span className="text-[#202723]">{loc.record_count} records</span>
                    </div>
                  </div>

                  <div className="mt-2.5">
                    <span className="text-[10px] font-semibold text-[#6B756F] uppercase">Dominant Skills</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {loc.top_skills.slice(0, 4).map((s, idx) => (
                        <span key={idx} className="bg-[#F0F4F2] text-[#286B59] px-1.5 py-0.5 rounded text-[10px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-[#F0F3F1] text-[11px] text-[#6B756F]">
                  Top: {loc.top_roles.slice(0, 2).join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  );
};

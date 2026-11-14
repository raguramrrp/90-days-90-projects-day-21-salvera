import React, { useState, useEffect } from 'react';
import { 
  Database, ShieldCheck, AlertCircle, Upload, CheckCircle2, 
  FileSpreadsheet, ArrowRight, Activity 
} from 'lucide-react';
import { api, DatasetItem, DatasetQuality } from '../services/api';

export const DataInsightsPage: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [quality, setQuality] = useState<DatasetQuality | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSynthetic, setIsSynthetic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dsRes, qRes] = await Promise.all([
        api.getDatasets(),
        api.getDatasetQuality(),
      ]);
      setDatasets(dsRes);
      setQuality(qRes);
    } catch (err) {
      console.error('Failed to load dataset insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadResult(null);
      const res = await api.uploadDatasetCsv(selectedFile, isSynthetic);
      setUploadResult(res);
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      console.error('Failed to upload CSV', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white pb-12">
      <div className="w-full space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Title & Header */}
        <div className="border-b border-[#E2E2D9] pb-4">
          <h1 className="text-xl font-bold text-[#172B2A] tracking-tight">Data Integrity, Quality & Provenance Centre</h1>
          <p className="text-xs text-[#707B75] mt-0.5">
            Audited dataset hygiene metrics, schema normalization checks, and transparent data provenance records.
          </p>
        </div>

      {/* Synthetic Disclosure Deep-Dive Banner */}
      <div className="bg-[#FAFBF9] border border-[#CCD4CF] rounded-lg p-5 shadow-xs space-y-2">
        <div className="flex items-center space-x-2 text-[#286B59] font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Mandatory Data Transparency & Calibration Protocol</span>
        </div>
        <p className="text-xs text-[#4F5953] leading-relaxed">
          SALVERA enforces strict separation between <strong>Observed market surveys</strong>, <strong>Statistical associations</strong>, <strong>Machine learning predictions</strong>, and <strong>User-entered compensation</strong>. 
          When external paid survey feeds are not mounted, the system utilizes a high-fidelity synthetic benchmark corpus ({quality?.total_records.toLocaleString()} records) calibrated across Indian tech hubs with explicit <code>is_synthetic = true</code> attribution.
        </p>
      </div>

      {/* Data Quality Metrics Grid */}
      {quality && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#202723] uppercase tracking-wider">
            Automated Data Hygiene & Quality Audit
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-[#E3E7E3] p-4 rounded-md shadow-xs">
              <div className="text-[10px] text-[#6B756F]">Composite Quality Score</div>
              <div className="text-2xl font-extrabold text-[#286B59] mt-1">{quality.overall_quality_score}/100</div>
              <div className="text-[10px] text-[#397A5D] font-medium mt-0.5">High Fidelity</div>
            </div>

            <div className="bg-white border border-[#E3E7E3] p-4 rounded-md shadow-xs">
              <div className="text-[10px] text-[#6B756F]">Total Validated Records</div>
              <div className="text-2xl font-bold text-[#202723] mt-1">{quality.total_records.toLocaleString()}</div>
              <div className="text-[10px] text-[#6B756F] mt-0.5">Clean Rows</div>
            </div>

            <div className="bg-white border border-[#E3E7E3] p-4 rounded-md shadow-xs">
              <div className="text-[10px] text-[#6B756F]">Currency Consistency</div>
              <div className="text-2xl font-bold text-[#202723] mt-1">{quality.currency_consistency_pct}%</div>
              <div className="text-[10px] text-[#6B756F] mt-0.5">Annual INR Base</div>
            </div>

            <div className="bg-white border border-[#E3E7E3] p-4 rounded-md shadow-xs">
              <div className="text-[10px] text-[#6B756F]">Field Completeness</div>
              <div className="text-2xl font-bold text-[#202723] mt-1">{(100 - quality.missing_fields_pct).toFixed(1)}%</div>
              <div className="text-[10px] text-[#6B756F] mt-0.5">&lt;0.5% Null Rates</div>
            </div>

            <div className="bg-white border border-[#E3E7E3] p-4 rounded-md shadow-xs">
              <div className="text-[10px] text-[#6B756F]">Duplicate Rows</div>
              <div className="text-2xl font-bold text-[#202723] mt-1">{quality.duplicate_rows_count}</div>
              <div className="text-[10px] text-[#397A5D] font-medium mt-0.5">Deduplicated</div>
            </div>

            <div className="bg-white border border-[#E3E7E3] p-4 rounded-md shadow-xs">
              <div className="text-[10px] text-[#6B756F]">Statistical Outliers (IQR)</div>
              <div className="text-2xl font-bold text-[#202723] mt-1">{quality.outlier_salary_count}</div>
              <div className="text-[10px] text-[#B9853C] font-medium mt-0.5">Reviewed Bounds</div>
            </div>
          </div>
        </div>
      )}

      {/* Dataset Provenance Table */}
      <div className="bg-white rounded-lg border border-[#E3E7E3] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E3E7E3] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-[#286B59]" />
            <h3 className="text-xs font-bold text-[#202723] tracking-tight">Active Datasets & Source Provenance</h3>
          </div>
          <span className="text-xs text-[#6B756F]">{datasets.length} Active Stores</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF9] text-[#4F5953] border-b border-[#E3E7E3] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Source Provider</th>
                <th className="py-2.5 px-3">Licence</th>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Record Count</th>
                <th className="py-2.5 px-3">Classification</th>
                <th className="py-2.5 px-3 text-right">Quality Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F3F1]">
              {datasets.map((d) => (
                <tr key={d.id} className="hover:bg-[#FAFBF9] transition">
                  <td className="py-2.5 px-3 font-semibold text-[#202723]">{d.dataset_name}</td>
                  <td className="py-2.5 px-3 text-[#4F5953]">{d.source_name}</td>
                  <td className="py-2.5 px-3 text-[#6B756F]">{d.licence}</td>
                  <td className="py-2.5 px-3">{d.collection_period}</td>
                  <td className="py-2.5 px-3 font-bold text-[#202723]">{d.record_count.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      d.is_synthetic ? 'bg-[#FAF5EB] text-[#B9853C] border border-[#ECD9BA]' : 'bg-[#EAF5EF] text-[#286B59]'
                    }`}>
                      {d.is_synthetic ? 'SYNTHETIC BENCHMARK' : 'OBSERVED MARKET'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#286B59]">{d.quality_score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSV Dataset Upload Tool */}
      <div className="bg-white border border-[#E3E7E3] rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-[#F0F3F1] pb-3">
          <Upload className="w-4 h-4 text-[#286B59]" />
          <h2 className="text-sm font-bold text-[#202723]">Ingest New Salary CSV Dataset</h2>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs max-w-xl">
          <div>
            <label className="block text-[11px] text-[#6B756F] font-semibold mb-1">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-[#CCD4CF] rounded bg-white text-[#202723] outline-none"
            />
            <p className="text-[10px] text-[#8E9991] mt-1">
              Expected headers: job_title, city, experience_years, skills, normalized_annual_salary, industry.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isSynth"
              checked={isSynthetic}
              onChange={(e) => setIsSynthetic(e.target.checked)}
              className="accent-[#286B59]"
            />
            <label htmlFor="isSynth" className="text-[11px] text-[#4F5953]">
              Mark as synthetic / internal test dataset
            </label>
          </div>

          <button
            type="submit"
            disabled={uploading || !selectedFile}
            className="px-4 py-2 bg-[#286B59] hover:bg-[#1E5345] text-white font-semibold rounded text-xs transition disabled:opacity-40 shadow-xs"
          >
            {uploading ? 'Validating & Ingesting...' : 'Upload & Validate CSV'}
          </button>
        </form>

        {uploadResult && (
          <div className="p-3 bg-[#EAF5EF] border border-[#C8DFD2] rounded text-xs text-[#286B59] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Successfully ingested {uploadResult.imported_rows} records into dataset ID {uploadResult.dataset_id}!</span>
          </div>
        )}
      </div>
    </div>
  </div>
  );
};

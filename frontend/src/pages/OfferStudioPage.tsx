import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  Cell 
} from 'recharts';
import { 
  Calculator, 
  Plus, 
  Download, 
  Trash2, 
  Edit2, 
  FileText, 
  Building2, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  IndianRupee, 
  Sliders, 
  HelpCircle, 
  Layers,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { api, JobOffer, OfferComparison } from '../services/api';

export const OfferStudioPage: React.FC = () => {
  const [comparison, setComparison] = useState<OfferComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<number | null>(null);

  // Selected offer for deep-dive waterfall
  const [waterfallOfferId, setWaterfallOfferId] = useState<number | null>(null);

  // Metric filter for secondary comparison
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'fixed' | 'takeHome' | 'disposable'>('all');

  // Inline expense simulator adjustments per offer
  const [expenseOverrides, setExpenseOverrides] = useState<Record<number, { rent: number; commute: number; other: number }>>({});
  const [isSimulatingExpenses, setIsSimulatingExpenses] = useState(false);

  // Form state
  const [form, setForm] = useState({
    offer_name: '',
    company_name: '',
    role_title: '',
    location_name: 'Bengaluru',
    work_mode: 'Hybrid',
    fixed_salary: 1600000,
    variable_salary: 200000,
    joining_bonus: 100000,
    annual_benefits: 80000,
    monthly_deductions: 28000,
    monthly_rent: 22000,
    monthly_commute: 3500,
    other_monthly_expenses: 12000,
  });

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await api.getOffers();
      setComparison(res);
      if (res && res.offers.length > 0 && !waterfallOfferId) {
        setWaterfallOfferId(res.offers[0].id);
      }
    } catch (err) {
      console.error('Failed to load offers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenAdd = () => {
    setEditingOfferId(null);
    const nextNum = comparison ? comparison.offers.length + 1 : 1;
    setForm({
      offer_name: `Offer ${nextNum}`,
      company_name: '',
      role_title: 'Software Engineer',
      location_name: 'Bengaluru',
      work_mode: 'Hybrid',
      fixed_salary: 1600000,
      variable_salary: 200000,
      joining_bonus: 100000,
      annual_benefits: 80000,
      monthly_deductions: 28000,
      monthly_rent: 22000,
      monthly_commute: 3500,
      other_monthly_expenses: 12000,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (offer: JobOffer) => {
    setEditingOfferId(offer.id);
    setForm({
      offer_name: offer.offer_name,
      company_name: offer.company_name,
      role_title: offer.role_title,
      location_name: offer.location_name,
      work_mode: offer.work_mode,
      fixed_salary: offer.fixed_salary,
      variable_salary: offer.variable_salary,
      joining_bonus: offer.joining_bonus,
      annual_benefits: offer.annual_benefits,
      monthly_deductions: offer.monthly_deductions,
      monthly_rent: offer.monthly_rent,
      monthly_commute: offer.monthly_commute,
      other_monthly_expenses: offer.other_monthly_expenses,
    });
    setShowModal(true);
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOfferId) {
        await api.updateOffer(editingOfferId, form);
      } else {
        await api.addOffer(form, comparison?.id);
      }
      setShowModal(false);
      fetchOffers();
    } catch (err) {
      console.error('Failed to save offer', err);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (confirm('Are you sure you want to remove this offer from your financial comparison?')) {
      await api.deleteOffer(id);
      fetchOffers();
    }
  };

  const handleExportPdf = () => {
    window.open('/api/offers/export-pdf', '_blank');
  };

  const handleExportCsv = () => {
    window.open('/api/offers/export-csv', '_blank');
  };

  const offers = comparison?.offers || [];

  // Helper calculations for dynamic summary metrics
  const highestFixedOffer = offers.length > 0
    ? [...offers].sort((a, b) => b.fixed_salary - a.fixed_salary)[0]
    : null;

  const highestTakeHomeOffer = offers.length > 0
    ? [...offers].sort((a, b) => b.financials.estimated_monthly_take_home - a.financials.estimated_monthly_take_home)[0]
    : null;

  const bestDisposableOffer = offers.length > 0
    ? [...offers].sort((a, b) => b.financials.estimated_monthly_disposable - a.financials.estimated_monthly_disposable)[0]
    : null;

  // Selected offer for detailed waterfall
  const currentWaterfallOffer = offers.find(o => o.id === waterfallOfferId) || offers[0] || null;

  // Build Waterfall Stages for the Selected Offer
  const buildWaterfallData = (offer: JobOffer) => {
    const f = offer.financials;
    const rent = (expenseOverrides[offer.id]?.rent ?? offer.monthly_rent) * 12;
    const commute = (expenseOverrides[offer.id]?.commute ?? offer.monthly_commute) * 12;
    const other = (expenseOverrides[offer.id]?.other ?? offer.other_monthly_expenses) * 12;
    const annualExpenses = rent + commute + other;
    const annualTakeHome = f.estimated_monthly_take_home * 12;
    const annualDisposable = Math.max(0, annualTakeHome - annualExpenses);

    return [
      {
        stage: 'Stated CTC',
        label: 'Headline CTC',
        amount: f.total_stated_ctc,
        amountLpa: (f.total_stated_ctc / 100000).toFixed(2),
        type: 'total',
        color: '#172B2A',
        annotation: 'Nominal employer package (includes one-time bonus & perks)'
      },
      {
        stage: 'Fixed Base',
        label: 'Guaranteed Base',
        amount: offer.fixed_salary,
        amountLpa: (offer.fixed_salary / 100000).toFixed(2),
        type: 'cash',
        color: '#648C7A',
        annotation: 'Primary recurring monthly foundation'
      },
      {
        stage: 'Variable Pay',
        label: 'Performance Bonus',
        amount: offer.variable_salary,
        amountLpa: (offer.variable_salary / 100000).toFixed(2),
        type: 'conditional',
        color: '#D5B66D',
        annotation: 'Target annual bonus contingent on company/individual ratings'
      },
      {
        stage: 'Joining Bonus',
        label: 'Year-1 Bonus',
        amount: offer.joining_bonus,
        amountLpa: (offer.joining_bonus / 100000).toFixed(2),
        type: 'onetime',
        color: '#707B75',
        annotation: 'One-time initial signing incentive (does not recur in Year 2)'
      },
      {
        stage: 'Taxes & Deduct.',
        label: 'Est. Deductions',
        amount: -f.estimated_annual_deductions,
        amountLpa: `-${(f.estimated_annual_deductions / 100000).toFixed(2)}`,
        type: 'subtraction',
        color: '#B85B52',
        annotation: 'Annual income tax withholdings, professional tax & provident fund'
      },
      {
        stage: 'Annual Take-Home',
        label: 'Net Take-Home Cash',
        amount: annualTakeHome,
        amountLpa: (annualTakeHome / 100000).toFixed(2),
        type: 'subtotal',
        color: '#172B2A',
        annotation: 'Actual liquid net bank deposit per year'
      },
      {
        stage: 'Living Costs',
        label: 'Living Expenses',
        amount: -annualExpenses,
        amountLpa: `-${(annualExpenses / 100000).toFixed(2)}`,
        type: 'subtraction',
        color: '#C28A4A',
        annotation: `Annualized rent, commute & living essentials in ${offer.location_name}`
      },
      {
        stage: 'Disposable Cash',
        label: 'Net Annual Surplus',
        amount: annualDisposable,
        amountLpa: (annualDisposable / 100000).toFixed(2),
        type: 'surplus',
        color: '#B66B45',
        annotation: 'True unencumbered surplus for investments, savings, or wealth creation'
      }
    ];
  };

  // Secondary Comparison Chart Data (Restrained distinct colors per offer)
  const OFFER_COLORS = ['#172B2A', '#648C7A', '#B66B45', '#D5B66D'];

  const comparativeChartData = [
    {
      metric: 'Fixed Base Pay',
      ...offers.reduce((acc, o, i) => {
        acc[o.company_name || o.offer_name] = o.fixed_salary / 100000;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      metric: 'Recurring Gross',
      ...offers.reduce((acc, o, i) => {
        acc[o.company_name || o.offer_name] = o.financials.recurring_gross_annual / 100000;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      metric: 'Annual Take-Home',
      ...offers.reduce((acc, o, i) => {
        acc[o.company_name || o.offer_name] = (o.financials.estimated_monthly_take_home * 12) / 100000;
        return acc;
      }, {} as Record<string, number>)
    },
    {
      metric: 'Disposable Surplus',
      ...offers.reduce((acc, o, i) => {
        acc[o.company_name || o.offer_name] = (o.financials.estimated_monthly_disposable * 12) / 100000;
        return acc;
      }, {} as Record<string, number>)
    }
  ];

  const filteredComparativeData = selectedMetric === 'all'
    ? comparativeChartData
    : selectedMetric === 'fixed'
      ? comparativeChartData.filter(d => d.metric === 'Fixed Base Pay')
      : selectedMetric === 'takeHome'
        ? comparativeChartData.filter(d => d.metric === 'Annual Take-Home')
        : comparativeChartData.filter(d => d.metric === 'Disposable Surplus');

  return (
    <div className="min-h-screen bg-[#F3EFE6] text-[#202B29] selection:bg-[#B66B45] selection:text-white">
      {/* Editorial Financial Header */}
      <div className="bg-white border-b border-[#E2E2D9] px-4 sm:px-6 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded bg-[#F3EFE6] text-[#B66B45] border border-[#E2E2D9] uppercase">
                Financial Intelligence
              </span>
              <span className="text-xs text-[#707B75]">
                Cost-to-Company Deconstruction
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172B2A] mt-1">
              Offer Comparison Studio
            </h1>
            <p className="text-xs sm:text-sm text-[#707B75] mt-0.5">
              Understand what an offer is really worth — beyond headline CTC. Deconstruct guaranteed base, taxes, and geographic living expenses.
            </p>
          </div>

          {/* Compact Actions Area */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportPdf}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#202B29] rounded-md text-xs font-medium transition shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-[#B66B45]" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E2E2D9] hover:bg-[#F3EFE6] text-[#202B29] rounded-md text-xs font-medium transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[#707B75]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#172B2A] hover:bg-[#254240] text-white rounded-md text-xs font-semibold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[#D5B66D]" />
              <span>Add Offer</span>
            </button>
          </div>
        </div>

        {/* Section B: Horizontal Financial Summary Strip */}
        {offers.length > 0 && (
          <div className="max-w-7xl mx-auto mt-5 pt-4 border-t border-[#E2E2D9]/60">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#F3EFE6]/60 p-3 rounded-md border border-[#E2E2D9]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#707B75]">
                  Offers Evaluated
                </div>
                <div className="text-xl font-extrabold text-[#172B2A] mt-0.5 tabular-nums">
                  {offers.length} <span className="text-xs font-medium text-[#707B75]">Scenarios</span>
                </div>
                <div className="text-[10px] text-[#707B75] mt-0.5">
                  Side-by-side cash comparison
                </div>
              </div>

              <div className="bg-[#F3EFE6]/60 p-3 rounded-md border border-[#E2E2D9]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#707B75]">
                  Highest Guaranteed Base
                </div>
                <div className="text-xl font-extrabold text-[#172B2A] mt-0.5 tabular-nums">
                  ₹{highestFixedOffer ? (highestFixedOffer.fixed_salary / 100000).toFixed(1) : 0} <span className="text-xs font-medium text-[#707B75]">LPA</span>
                </div>
                <div className="text-[10px] text-[#648C7A] font-semibold mt-0.5 truncate">
                  {highestFixedOffer?.company_name || highestFixedOffer?.offer_name}
                </div>
              </div>

              <div className="bg-[#F3EFE6]/60 p-3 rounded-md border border-[#E2E2D9]">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#707B75]">
                  Highest Monthly Take-Home
                </div>
                <div className="text-xl font-extrabold text-[#172B2A] mt-0.5 tabular-nums">
                  ₹{highestTakeHomeOffer ? Math.round(highestTakeHomeOffer.financials.estimated_monthly_take_home).toLocaleString() : 0} <span className="text-xs font-medium text-[#707B75]">/mo</span>
                </div>
                <div className="text-[10px] text-[#707B75] font-semibold mt-0.5 truncate">
                  {highestTakeHomeOffer?.company_name || highestTakeHomeOffer?.offer_name}
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border-2 border-[#B66B45] shadow-xs">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#B66B45] flex items-center justify-between">
                  <span>Best Net Disposable Cash</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#F3EFE6] text-[#B66B45] font-bold">TOP CHOICE</span>
                </div>
                <div className="text-xl font-extrabold text-[#B66B45] mt-0.5 tabular-nums">
                  ₹{bestDisposableOffer ? Math.round(bestDisposableOffer.financials.estimated_monthly_disposable).toLocaleString() : 0} <span className="text-xs font-medium text-[#707B75]">/mo</span>
                </div>
                <div className="text-[10px] text-[#202B29] font-bold mt-0.5 truncate">
                  {bestDisposableOffer?.company_name || bestDisposableOffer?.offer_name} • {bestDisposableOffer?.location_name}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Studio Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#707B75]">Loading financial models...</div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E2E2D9] p-10 text-center shadow-xs">
            <Calculator className="w-10 h-10 text-[#707B75] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-[#172B2A]">No offers added to evaluation</h3>
            <p className="text-xs text-[#707B75] mt-1 max-w-md mx-auto">
              Add job offers with their base salary, variable bonus, joining bonus, and city living expenses to inspect real take-home cash.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-[#172B2A] text-white text-xs font-semibold rounded hover:bg-[#254240] transition"
            >
              Add First Offer
            </button>
          </div>
        ) : (
          <>
            {/* Section 6: Primary Chart — Compensation Waterfall */}
            <div className="bg-white border border-[#E2E2D9] rounded-lg p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2D9]/60 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#648C7A] bg-[#F3EFE6] px-2 py-0.5 rounded border border-[#E2E2D9]">
                      Stage-by-Stage Flow
                    </span>
                    <h2 className="text-base font-bold text-[#172B2A]">
                      Where Your Compensation Goes
                    </h2>
                  </div>
                  <p className="text-xs text-[#707B75] mt-0.5">
                    Deconstruction of stated CTC into guaranteed cash, statutory deductions, living expenses, and net disposable surplus.
                  </p>
                </div>

                {/* Offer Selector for Waterfall */}
                <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-[#F3EFE6] p-1 rounded-md border border-[#E2E2D9]">
                  <span className="text-[11px] text-[#707B75] px-2 font-medium">Inspect:</span>
                  {offers.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => setWaterfallOfferId(o.id)}
                      className={`px-3 py-1 text-xs rounded transition font-medium ${
                        waterfallOfferId === o.id
                          ? 'bg-[#172B2A] text-white shadow-2xs font-semibold'
                          : 'text-[#202B29] hover:bg-white/80'
                      }`}
                    >
                      {o.company_name || o.offer_name}
                    </button>
                  ))}
                </div>
              </div>

              {currentWaterfallOffer && (
                <div className="mt-5 space-y-4">
                  {/* Context Header for Selected Offer */}
                  <div className="flex items-center justify-between bg-[#F3EFE6]/50 p-3 rounded border border-[#E2E2D9] text-xs">
                    <div>
                      <span className="font-bold text-[#172B2A]">{currentWaterfallOffer.company_name}</span>
                      <span className="text-[#707B75] mx-1">•</span>
                      <span className="text-[#707B75]">{currentWaterfallOffer.role_title} ({currentWaterfallOffer.location_name})</span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px]">
                      <span>Stated CTC: <strong className="font-mono text-[#172B2A]">₹{(currentWaterfallOffer.financials.total_stated_ctc / 100000).toFixed(2)} LPA</strong></span>
                      <span>Net Monthly Take-Home: <strong className="font-mono text-[#648C7A]">₹{Math.round(currentWaterfallOffer.financials.estimated_monthly_take_home).toLocaleString()}</strong></span>
                      <span>Annual Disposable: <strong className="font-mono text-[#B66B45]">₹{(currentWaterfallOffer.financials.estimated_monthly_disposable * 12 / 100000).toFixed(2)} LPA</strong></span>
                    </div>
                  </div>

                  {/* Horizontal Interactive Visual Waterfall Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {buildWaterfallData(currentWaterfallOffer).map((item, idx) => (
                      <div 
                        key={idx}
                        className={`p-3.5 rounded-md border flex flex-col justify-between transition ${
                          item.type === 'surplus'
                            ? 'bg-[#F3EFE6] border-[#B66B45] ring-1 ring-[#B66B45]/30'
                            : item.type === 'subtraction'
                              ? 'bg-white border-[#E2E2D9] hover:border-[#B85B52]/40'
                              : 'bg-white border-[#E2E2D9]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#707B75]">
                            <span>Stage {idx + 1}</span>
                            <span 
                              className="px-1.5 py-0.2 rounded font-semibold text-[9px]"
                              style={{ 
                                backgroundColor: item.color === '#B85B52' || item.color === '#C28A4A' ? '#FAF0F0' : '#F3EFE6',
                                color: item.color 
                              }}
                            >
                              {item.stage}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[#172B2A] mt-1">
                            {item.label}
                          </div>
                          <div 
                            className="text-lg font-extrabold mt-1.5 tabular-nums font-mono"
                            style={{ color: item.color }}
                          >
                            ₹{item.amountLpa} <span className="text-[10px] font-sans font-medium text-[#707B75]">LPA</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-[#707B75] mt-2 pt-2 border-t border-[#E2E2D9]/60 leading-snug">
                          {item.annotation}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Rule Admonition */}
                  <div className="p-3 bg-[#F3EFE6]/70 rounded border border-[#E2E2D9] flex items-start space-x-2.5 text-xs text-[#202B29]">
                    <ShieldCheck className="w-4 h-4 text-[#648C7A] shrink-0 mt-0.5" />
                    <div className="space-y-0.5 text-[11px] leading-relaxed">
                      <strong className="text-[#172B2A]">Financial Clarity Principle:</strong> Joining bonus (₹{(currentWaterfallOffer.joining_bonus / 100000).toFixed(1)}L) is a one-time disbursement that does not recur in Year 2. Stated employer CTC inflates headline value; your recurring guaranteed baseline is ₹{(currentWaterfallOffer.fixed_salary / 100000).toFixed(1)} LPA.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 7: Secondary Chart — Multi-Metric Comparison */}
            <div className="bg-white border border-[#E2E2D9] rounded-lg p-5 sm:p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2D9]/60 pb-4">
                <div>
                  <h2 className="text-base font-bold text-[#172B2A]">
                    Cross-Offer Financial Metrics
                  </h2>
                  <p className="text-xs text-[#707B75] mt-0.5">
                    Compare offers across base pay, recurring gross, net take-home, and disposable surplus.
                  </p>
                </div>

                {/* Metric Switcher */}
                <div className="flex items-center space-x-1 bg-[#F3EFE6] p-1 rounded-md border border-[#E2E2D9] text-xs">
                  <button
                    onClick={() => setSelectedMetric('all')}
                    className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                      selectedMetric === 'all' ? 'bg-[#172B2A] text-white font-semibold' : 'text-[#202B29] hover:bg-white'
                    }`}
                  >
                    All Metrics
                  </button>
                  <button
                    onClick={() => setSelectedMetric('fixed')}
                    className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                      selectedMetric === 'fixed' ? 'bg-[#172B2A] text-white font-semibold' : 'text-[#202B29] hover:bg-white'
                    }`}
                  >
                    Fixed Base
                  </button>
                  <button
                    onClick={() => setSelectedMetric('takeHome')}
                    className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                      selectedMetric === 'takeHome' ? 'bg-[#172B2A] text-white font-semibold' : 'text-[#202B29] hover:bg-white'
                    }`}
                  >
                    Take-Home
                  </button>
                  <button
                    onClick={() => setSelectedMetric('disposable')}
                    className={`px-2.5 py-1 rounded transition text-xs font-medium ${
                      selectedMetric === 'disposable' ? 'bg-[#172B2A] text-white font-semibold' : 'text-[#202B29] hover:bg-white'
                    }`}
                  >
                    Disposable
                  </button>
                </div>
              </div>

              <div className="h-72 w-full mt-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredComparativeData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E2D9" vertical={false} />
                    <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#172B2A', fontWeight: 500 }} />
                    <YAxis unit="L" tick={{ fontSize: 10, fill: '#707B75' }} />
                    <Tooltip 
                      formatter={(val: any) => [`₹${val} LPA`, '']}
                      contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E2D9', borderRadius: '6px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    {offers.map((offer, index) => (
                      <Bar 
                        key={offer.id} 
                        dataKey={offer.company_name || offer.offer_name} 
                        fill={OFFER_COLORS[index % OFFER_COLORS.length]}
                        radius={[3, 3, 0, 0]}
                        maxBarSize={48}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Section 8: Monthly Cash-Flow Analysis */}
            <div className="bg-white border border-[#E2E2D9] rounded-lg p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E2D9]/60 pb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B66B45] bg-[#F3EFE6] px-2 py-0.5 rounded border border-[#E2E2D9]">
                      Cash-Flow Reality
                    </span>
                    <h2 className="text-base font-bold text-[#172B2A]">
                      Your Monthly Financial Reality
                    </h2>
                  </div>
                  <p className="text-xs text-[#707B75] mt-0.5">
                    Realistic monthly liquid cash deposits versus actual rent, commute, and living obligations.
                  </p>
                </div>

                <button
                  onClick={() => setIsSimulatingExpenses(!isSimulatingExpenses)}
                  className={`px-3 py-1.5 text-xs rounded border transition flex items-center space-x-1.5 font-medium ${
                    isSimulatingExpenses 
                      ? 'bg-[#172B2A] text-white border-[#172B2A]' 
                      : 'bg-white border-[#E2E2D9] text-[#202B29] hover:bg-[#F3EFE6]'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#B66B45]" />
                  <span>{isSimulatingExpenses ? 'Close Expense Simulator' : 'Adjust Living Expenses'}</span>
                </button>
              </div>

              {/* Monthly Structured Breakdown Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E2D9] text-[#707B75] font-semibold text-[11px] uppercase tracking-wider bg-[#F3EFE6]/50">
                      <th className="py-2.5 px-3">Monthly Metric</th>
                      {offers.map(o => (
                        <th key={o.id} className="py-2.5 px-3 font-bold text-[#172B2A]">
                          {o.company_name || o.offer_name} <span className="font-normal text-[10px] text-[#707B75]">({o.location_name})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E2D9]/60 text-xs">
                    <tr>
                      <td className="py-2 px-3 text-[#202B29] font-medium">Monthly Gross Equivalent</td>
                      {offers.map(o => (
                        <td key={o.id} className="py-2 px-3 tabular-nums font-mono text-[#202B29]">
                          ₹{Math.round(o.financials.monthly_gross_equivalent).toLocaleString()}
                        </td>
                      ))}
                    </tr>

                    <tr className="text-[#B85B52]">
                      <td className="py-2 px-3 font-medium">Estimated Monthly Deductions (Tax+PF)</td>
                      {offers.map(o => (
                        <td key={o.id} className="py-2 px-3 tabular-nums font-mono">
                          -₹{Math.round(o.monthly_deductions).toLocaleString()}
                        </td>
                      ))}
                    </tr>

                    <tr className="bg-[#F3EFE6]/40 font-semibold text-[#172B2A]">
                      <td className="py-2.5 px-3">Net Monthly Take-Home (Cash Deposit)</td>
                      {offers.map(o => (
                        <td key={o.id} className="py-2.5 px-3 tabular-nums font-mono font-bold text-[#648C7A]">
                          ₹{Math.round(o.financials.estimated_monthly_take_home).toLocaleString()}
                        </td>
                      ))}
                    </tr>

                    <tr className="text-[#707B75]">
                      <td className="py-2 px-3 font-medium">Monthly Rent Obligation</td>
                      {offers.map(o => {
                        const rentVal = expenseOverrides[o.id]?.rent ?? o.monthly_rent;
                        return (
                          <td key={o.id} className="py-2 px-3 tabular-nums font-mono">
                            {isSimulatingExpenses ? (
                              <input
                                type="number"
                                step="500"
                                value={rentVal}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setExpenseOverrides(prev => ({
                                    ...prev,
                                    [o.id]: {
                                      rent: val,
                                      commute: prev[o.id]?.commute ?? o.monthly_commute,
                                      other: prev[o.id]?.other ?? o.other_monthly_expenses,
                                    }
                                  }));
                                }}
                                className="w-24 p-1 text-xs border border-[#E2E2D9] rounded bg-white"
                              />
                            ) : (
                              `-₹${rentVal.toLocaleString()}`
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="text-[#707B75]">
                      <td className="py-2 px-3 font-medium">Monthly Commute & Transport</td>
                      {offers.map(o => {
                        const comVal = expenseOverrides[o.id]?.commute ?? o.monthly_commute;
                        return (
                          <td key={o.id} className="py-2 px-3 tabular-nums font-mono">
                            {isSimulatingExpenses ? (
                              <input
                                type="number"
                                step="500"
                                value={comVal}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setExpenseOverrides(prev => ({
                                    ...prev,
                                    [o.id]: {
                                      rent: prev[o.id]?.rent ?? o.monthly_rent,
                                      commute: val,
                                      other: prev[o.id]?.other ?? o.other_monthly_expenses,
                                    }
                                  }));
                                }}
                                className="w-24 p-1 text-xs border border-[#E2E2D9] rounded bg-white"
                              />
                            ) : (
                              `-₹${comVal.toLocaleString()}`
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="text-[#707B75]">
                      <td className="py-2 px-3 font-medium">Other Food & Living Essentials</td>
                      {offers.map(o => {
                        const othVal = expenseOverrides[o.id]?.other ?? o.other_monthly_expenses;
                        return (
                          <td key={o.id} className="py-2 px-3 tabular-nums font-mono">
                            {isSimulatingExpenses ? (
                              <input
                                type="number"
                                step="500"
                                value={othVal}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setExpenseOverrides(prev => ({
                                    ...prev,
                                    [o.id]: {
                                      rent: prev[o.id]?.rent ?? o.monthly_rent,
                                      commute: prev[o.id]?.commute ?? o.monthly_commute,
                                      other: val,
                                    }
                                  }));
                                }}
                                className="w-24 p-1 text-xs border border-[#E2E2D9] rounded bg-white"
                              />
                            ) : (
                              `-₹${othVal.toLocaleString()}`
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    <tr className="bg-[#F3EFE6] font-extrabold border-t-2 border-[#172B2A]">
                      <td className="py-3 px-3 text-[#172B2A]">Remaining Monthly Disposable Cash</td>
                      {offers.map(o => {
                        const rent = expenseOverrides[o.id]?.rent ?? o.monthly_rent;
                        const commute = expenseOverrides[o.id]?.commute ?? o.monthly_commute;
                        const other = expenseOverrides[o.id]?.other ?? o.other_monthly_expenses;
                        const totalExp = rent + commute + other;
                        const disposable = o.financials.estimated_monthly_take_home - totalExp;

                        return (
                          <td key={o.id} className="py-3 px-3 tabular-nums font-mono text-base font-bold text-[#B66B45]">
                            ₹{Math.round(disposable).toLocaleString()}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 9: Offer Detail Panels */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#707B75]">
                Individual Offer Deconstruction Panels ({offers.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {offers.map((offer) => {
                  const f = offer.financials;
                  const isTopChoice = bestDisposableOffer && bestDisposableOffer.id === offer.id;

                  return (
                    <div 
                      key={offer.id} 
                      className={`bg-white rounded-lg p-5 border shadow-xs flex flex-col justify-between transition ${
                        isTopChoice 
                          ? 'border-2 border-[#B66B45] ring-2 ring-[#B66B45]/15' 
                          : 'border-[#E2E2D9] hover:border-[#707B75]'
                      }`}
                    >
                      <div>
                        {/* Header & Badges */}
                        <div className="flex items-start justify-between border-b border-[#E2E2D9]/60 pb-3">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#172B2A] bg-[#F3EFE6] px-2 py-0.5 rounded border border-[#E2E2D9]">
                                {offer.work_mode}
                              </span>
                              {isTopChoice && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#B66B45] bg-[#FAF0F0] px-1.5 py-0.5 rounded border border-[#B66B45]/30">
                                  Highest Surplus
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-[#172B2A] mt-1.5">
                              {offer.company_name || offer.offer_name}
                            </h3>
                            <div className="text-xs text-[#707B75] flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-[#B66B45]" />
                              <span>{offer.role_title} • {offer.location_name}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => handleOpenEdit(offer)} 
                              title="Edit Offer"
                              className="p-1 hover:bg-[#F3EFE6] rounded text-[#707B75]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteOffer(offer.id)} 
                              title="Delete Offer"
                              className="p-1 hover:bg-[#FAF0F0] rounded text-[#B85B52]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* CTC vs Monthly Gross */}
                        <div className="py-3 border-b border-[#E2E2D9]/60 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-[#707B75] uppercase font-semibold">Total Stated CTC</span>
                            <div className="text-lg font-bold text-[#172B2A] tabular-nums font-mono">
                              ₹{(f.total_stated_ctc / 100000).toFixed(2)} LPA
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-[#707B75] uppercase font-semibold">Take-Home /mo</span>
                            <div className="text-sm font-bold text-[#648C7A] tabular-nums font-mono">
                              ₹{Math.round(f.estimated_monthly_take_home).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Compensation Line Items */}
                        <div className="py-3 space-y-1.5 text-xs border-b border-[#E2E2D9]/60">
                          <div className="flex justify-between">
                            <span className="text-[#707B75]">Fixed Base (Annual):</span>
                            <span className="font-semibold text-[#172B2A] font-mono">₹{offer.fixed_salary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#707B75]">Variable Target Pay:</span>
                            <span className="font-semibold text-[#172B2A] font-mono">₹{offer.variable_salary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#707B75]">Joining Cash (One-Time):</span>
                            <span className="font-semibold text-[#172B2A] font-mono">₹{offer.joining_bonus.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Net Disposable Highlight */}
                        <div className="py-3 bg-[#F3EFE6]/60 p-3 rounded border border-[#E2E2D9] mt-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-[#202B29]">Net Monthly Disposable:</span>
                            <span className="text-base font-extrabold text-[#B66B45] font-mono">
                              ₹{Math.round(f.estimated_monthly_disposable).toLocaleString()}
                            </span>
                          </div>
                          <div className="text-[10px] text-[#707B75] mt-1 flex justify-between">
                            <span>Annual Savings Capacity:</span>
                            <span className="font-semibold text-[#172B2A]">₹{Math.round(f.estimated_monthly_disposable * 12).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action */}
                      <button
                        onClick={() => setWaterfallOfferId(offer.id)}
                        className="mt-4 pt-2.5 border-t border-[#E2E2D9]/60 text-xs text-[#B66B45] font-semibold hover:underline flex items-center justify-between"
                      >
                        <span>View Step-by-Step Waterfall</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Section 10: Refined Multi-Section Add/Edit Offer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form 
            onSubmit={handleSaveOffer} 
            className="bg-white rounded-lg border border-[#E2E2D9] shadow-2xl w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E2E2D9] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#172B2A]">
                  {editingOfferId ? 'Edit Job Offer Parameters' : 'Add New Offer for Financial Deconstruction'}
                </h2>
                <p className="text-xs text-[#707B75] mt-0.5">
                  Input headline compensation and localized expense assumptions.
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowModal(false)} 
                className="text-[#707B75] hover:text-[#172B2A] text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Section A: Job Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1">
                Section A: Job & Location Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ZetaScale Tech"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">Offer Label</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Offer A"
                    value={form.offer_name}
                    onChange={(e) => setForm({ ...form, offer_name: e.target.value })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">Target Job Role</label>
                  <input
                    type="text"
                    required
                    value={form.role_title}
                    onChange={(e) => setForm({ ...form, role_title: e.target.value })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">Location (Indian Tech Hub)</label>
                  <select
                    value={form.location_name}
                    onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-white focus:border-[#172B2A] outline-hidden"
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
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">Work Arrangement</label>
                  <select
                    value={form.work_mode}
                    onChange={(e) => setForm({ ...form, work_mode: e.target.value })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-white focus:border-[#172B2A] outline-hidden"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section B: Compensation Structure */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1">
                Section B: Compensation Architecture (Annual INR)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Fixed Base Salary (Annual Guaranteed)
                  </label>
                  <input
                    type="number"
                    required
                    value={form.fixed_salary}
                    onChange={(e) => setForm({ ...form, fixed_salary: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Target Variable Bonus (Performance Pay)
                  </label>
                  <input
                    type="number"
                    value={form.variable_salary}
                    onChange={(e) => setForm({ ...form, variable_salary: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    One-Time Joining Bonus (Non-Recurring)
                  </label>
                  <input
                    type="number"
                    value={form.joining_bonus}
                    onChange={(e) => setForm({ ...form, joining_bonus: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Annual Benefits / Medical Perks
                  </label>
                  <input
                    type="number"
                    value={form.annual_benefits}
                    onChange={(e) => setForm({ ...form, annual_benefits: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section C & D: Deductions & Living Expenses */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#172B2A] border-b border-[#E2E2D9]/60 pb-1">
                Section C & D: Monthly Deductions & Living Expenses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Monthly Deductions (Tax + PF)
                  </label>
                  <input
                    type="number"
                    value={form.monthly_deductions}
                    onChange={(e) => setForm({ ...form, monthly_deductions: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Monthly Rent in Target City
                  </label>
                  <input
                    type="number"
                    value={form.monthly_rent}
                    onChange={(e) => setForm({ ...form, monthly_rent: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Monthly Commute & Transport
                  </label>
                  <input
                    type="number"
                    value={form.monthly_commute}
                    onChange={(e) => setForm({ ...form, monthly_commute: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#707B75] font-medium mb-1">
                    Other Essentials (Food, Utilities)
                  </label>
                  <input
                    type="number"
                    value={form.other_monthly_expenses}
                    onChange={(e) => setForm({ ...form, other_monthly_expenses: Number(e.target.value) })}
                    className="w-full p-2 border border-[#E2E2D9] rounded bg-[#F3EFE6]/40 focus:bg-white focus:border-[#172B2A] outline-hidden font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#E2E2D9] flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white text-[#202B29] text-xs font-medium rounded border border-[#E2E2D9] hover:bg-[#F3EFE6]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#172B2A] hover:bg-[#254240] text-white text-xs font-semibold rounded shadow-xs"
              >
                Save Offer Details
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

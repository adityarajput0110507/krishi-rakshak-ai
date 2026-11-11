import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Download, 
  Filter, 
  Layers, 
  Calendar, 
  Activity,
  FileText,
  Search,
  Building2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<any | null>(null);
  const [stateReports, setStateReports] = useState<any[]>([]);
  const [districtReports, setDistrictReports] = useState<any[]>([]);
  const [cropStats, setCropStats] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [verificationStats, setVerificationStats] = useState<any[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getAnalyticsSummary(),
      api.getAnalyticsStateReports(),
      api.getAnalyticsCropDiseaseStats(),
      api.getAnalyticsMonthlyTrends(),
      api.getAnalyticsVerificationStats(),
      api.getStates()
    ]).then(([sum, statesData, cropsData, trendsData, verifData, stateList]) => {
      setSummary(sum);
      setStateReports(statesData);
      setCropStats(cropsData);
      setMonthlyTrends(trendsData);
      setVerificationStats(verifData);
      setStates(stateList);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    api.getAnalyticsDistrictReports(selectedState || undefined)
      .then((data) => setDistrictReports(data))
      .catch(console.error);
  }, [selectedState]);

  const COLORS = ['#245C3A', '#D69A36', '#6C9468', '#C65349', '#4F46E5', '#0891B2'];

  const exportCSV = () => {
    if (!stateReports.length) return;
    const headers = "State,TotalReports,DiseasedCases,VerifiedCases,DistrictsCovered\n";
    const rows = stateReports.map((s) => 
      `"${s.state}",${s.total_reports},${s.diseased_cases},${s.verified_cases},${s.districts_covered}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CropGuard_All_India_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#748077]">Loading All-India Agricultural Analytics Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E3E9E1] pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#245C3A] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>National Agricultural Surveillance Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#26332B] mb-2">
            Agricultural Health Analytics Dashboard
          </h1>
          <p className="text-sm text-[#748077] max-w-2xl">
            Statistical epidemiological monitoring generated directly from authenticated field diagnostics and agronomist verification reports across Indian agricultural zones.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-emerald-50 border border-[#245C3A] text-[#245C3A] text-xs font-bold rounded-lg transition-colors shadow-sm self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="agri-card p-5 border-l-4 border-l-[#245C3A]">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>Total Field Reports</span>
            <FileText className="w-4 h-4 text-[#245C3A]" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {summary?.total_reports?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-[#748077] mt-1">Submitted by Farmers</div>
        </div>

        <div className="agri-card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>Verified Pathology Cases</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {summary?.verified_reports?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-emerald-800 font-semibold mt-1">
            {summary?.verification_rate}% Expert Validation Rate
          </div>
        </div>

        <div className="agri-card p-5 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>Diseased Incidences</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {summary?.diseased_cases?.toLocaleString() || 0}
          </div>
          <div className="text-[11px] text-[#748077] mt-1">Active Treatments Recommended</div>
        </div>

        <div className="agri-card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>Geographic Reach</span>
            <MapPin className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {summary?.states_monitored || 0} States / {summary?.districts_monitored || 0} Dists
          </div>
          <div className="text-[11px] text-[#748077] mt-1">All-India Coverage</div>
        </div>
      </div>

      {/* Main Charts Grid: State-wise Bar & Monthly Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* State-Wise Reports Bar Chart */}
        <div className="lg:col-span-7 agri-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-[#245C3A]" />
                <span>State-Wise Crop Health Reports</span>
              </h3>
              <p className="text-xs text-[#748077]">Diagnostic submissions grouped by State</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateReports} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E1" />
                <XAxis 
                  dataKey="state" 
                  stroke="#748077" 
                  fontSize={11} 
                  angle={-25} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis stroke="#748077" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E9E1', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                <Bar dataKey="total_reports" name="Total Reports" fill="#245C3A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diseased_cases" name="Diseased" fill="#C65349" radius={[4, 4, 0, 0]} />
                <Bar dataKey="verified_cases" name="Expert Verified" fill="#6C9468" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Incidence Trend Line Chart */}
        <div className="lg:col-span-5 agri-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#245C3A]" />
                <span>Monthly Surveillance Trend</span>
              </h3>
              <p className="text-xs text-[#748077]">Seasonal disease trajectory (Past 6 Months)</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E1" />
                <XAxis dataKey="month" stroke="#748077" fontSize={11} />
                <YAxis stroke="#748077" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E9E1', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="diseased_cases" 
                  name="Diseased Cases" 
                  stroke="#C65349" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total_reports" 
                  name="Total Scans" 
                  stroke="#245C3A" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District-Level Reporting Table with State Filter */}
      <div className="agri-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#245C3A]" />
              <span>District-Wise Disease Surveillance Breakdown</span>
            </h3>
            <p className="text-xs text-[#748077]">
              Epidemiological reports aggregated from village-level farmer scans
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-[#748077] whitespace-nowrap">
              Filter State:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded-md text-xs font-medium text-[#26332B] focus:outline-none focus:border-[#245C3A]"
            >
              <option value="">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7F2] border-b border-[#E3E9E1] text-[#748077] uppercase text-[11px] font-semibold">
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Total Submissions</th>
                <th className="py-2.5 px-3">Confirmed Diseased</th>
                <th className="py-2.5 px-3">Verified by KVK/SAU</th>
                <th className="py-2.5 px-3 text-right">Epidemiological Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E9E1]">
              {districtReports.map((dist, idx) => (
                <tr key={idx} className="hover:bg-[#F5F7F2]/60">
                  <td className="py-3 px-3 font-bold text-[#26332B] flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#245C3A]" />
                    <span>{dist.district}</span>
                  </td>
                  <td className="py-3 px-3 text-[#748077] font-medium">{dist.state}</td>
                  <td className="py-3 px-3 font-semibold">{dist.total_reports}</td>
                  <td className="py-3 px-3 font-semibold text-rose-700">{dist.diseased_cases}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-800">{dist.verified_cases}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dist.risk_level === 'High' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                      'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {dist.risk_level} Risk
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop-Wise Pathological Conditions Table */}
      <div className="agri-card p-6 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#245C3A]" />
            <span>Crop-Wise Pathology & Pest Infestation Statistics</span>
          </h3>
          <p className="text-xs text-[#748077]">
            Frequency of diagnosed diseases across crops based on authentic database records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7F2] border-b border-[#E3E9E1] text-[#748077] uppercase text-[11px] font-semibold">
                <th className="py-2.5 px-3">Crop Variety</th>
                <th className="py-2.5 px-3">Diagnosed Condition / Pest</th>
                <th className="py-2.5 px-3">Reported Scans</th>
                <th className="py-2.5 px-3 text-right">Severe Cases</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E9E1]">
              {cropStats.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F5F7F2]/60">
                  <td className="py-3 px-3 font-bold text-[#26332B]">{item.crop}</td>
                  <td className="py-3 px-3 font-medium text-[#26332B]">{item.condition}</td>
                  <td className="py-3 px-3 font-semibold">{item.incidence_count}</td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-700">{item.severe_cases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


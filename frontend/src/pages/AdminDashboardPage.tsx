import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Download, 
  BarChart3,
  Calendar,
  Activity,
  ShieldCheck
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

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getAdminDashboard()
      .then((data) => {
        setDashboard(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const COLORS = ['#245C3A', '#D69A36', '#6C9468', '#C65349'];

  const exportCSV = () => {
    const list = dashboard?.recent_reports || [];
    if (!list.length) return;
    const headers = "ReportCode,District,Taluka,Village,Crop,Condition,Severity,Status,Date\n";
    const rows = list.map((h: any) => 
      `"${h.report_code}","${h.district}","${h.taluka}","${h.village}","${h.crop}","${h.condition}","${h.severity}","${h.verification_status}","${h.created_at}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CropGuard_Surveillance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#748077]">Loading State Surveillance Command Center...</p>
      </div>
    );
  }

  const d = dashboard;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#245C3A] uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>State Agricultural Surveillance Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#26332B] mb-1">
            {t.admin.title}
          </h1>
          <p className="text-sm text-[#748077]">
            {t.admin.subtitle}
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-emerald-50 border border-[#245C3A] text-[#245C3A] text-xs font-bold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>{t.admin.exportData}</span>
        </button>
      </div>

      {/* Aggregate KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="agri-card p-5 border-l-4 border-l-[#245C3A]">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>{t.admin.totalFarmers}</span>
            <Users className="w-4 h-4 text-[#245C3A]" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {d?.total_registered_farmers.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#748077] mt-1">Verified Aadhaar / Landholdings</div>
        </div>

        <div className="agri-card p-5 border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>{t.admin.totalReports}</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {d?.total_crop_reports.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#748077] mt-1">AI Diagnostic Submissions</div>
        </div>

        <div className="agri-card p-5 border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>{t.admin.verifiedCases}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#26332B]">
            {d?.verified_disease_cases.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-800 font-medium mt-1">
            {d?.expert_verification_rate}% Expert Verification Rate
          </div>
        </div>

        <div className="agri-card p-5 border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-[#748077] mb-2 text-xs font-semibold">
            <span>{t.admin.pestOutbreaks}</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {d?.suspected_pest_infestations.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-800/80 font-medium mt-1">Active Infestation Clusters</div>
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Disease Incidence Trend */}
        <div className="lg:col-span-7 agri-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-[#245C3A]" />
                <span>{t.admin.diseaseTrends}</span>
              </h3>
              <p className="text-xs text-[#748077]">Weekly confirmed vs healthy crop trends</p>
            </div>
            <span className="text-[11px] text-[#748077] bg-[#F5F7F2] px-2 py-0.5 rounded font-mono">
              Past 6 Weeks
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d?.weekly_trends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E1" />
                <XAxis dataKey="week" stroke="#748077" fontSize={11} />
                <YAxis stroke="#748077" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E9E1', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
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
                  dataKey="healthy_cases" 
                  name="Healthy Crops" 
                  stroke="#245C3A" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Crop Breakdown Chart */}
        <div className="lg:col-span-5 agri-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-[#245C3A]" />
                <span>{t.admin.cropDistribution}</span>
              </h3>
              <p className="text-xs text-[#748077]">Total scans by crop variety</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d?.crop_distribution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E9E1" />
                <XAxis dataKey="crop" stroke="#748077" fontSize={11} />
                <YAxis stroke="#748077" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E9E1', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="diseased_count" name="Diseased" fill="#C65349" radius={[4, 4, 0, 0]} />
                <Bar dataKey="healthy_count" name="Healthy" fill="#245C3A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District-Level Reporting Table */}
      <div className="agri-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#26332B]">
              Top Reporting Districts & Vulnerability Index
            </h3>
            <p className="text-xs text-[#748077]">
              Aggregated from field observations across agricultural commissionerate divisions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F5F7F2] border-b border-[#E3E9E1] text-[#748077] font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">Total Reports</th>
                <th className="py-2.5 px-3">Confirmed Cases</th>
                <th className="py-2.5 px-3">Suspected / Pending</th>
                <th className="py-2.5 px-3">Primary Threat Detected</th>
                <th className="py-2.5 px-3 text-right">Epidemiological Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E3E9E1]">
              {d?.district_statistics?.map((dist: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#F5F7F2]/60">
                  <td className="py-3 px-3 font-bold text-[#26332B] flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#245C3A]" />
                    <span>{dist.district}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold">{dist.total_reports}</td>
                  <td className="py-3 px-3 font-semibold text-rose-700">{dist.confirmed_cases}</td>
                  <td className="py-3 px-3 font-semibold text-amber-700">{dist.suspected_cases}</td>
                  <td className="py-3 px-3 font-medium text-[#26332B]">{dist.primary_threat}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dist.risk_level === 'Critical' ? 'bg-red-100 text-red-900' :
                      dist.risk_level === 'High' ? 'bg-rose-100 text-rose-900' :
                      dist.risk_level === 'Moderate' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {dist.risk_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


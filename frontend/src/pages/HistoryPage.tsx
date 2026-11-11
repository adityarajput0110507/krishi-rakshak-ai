import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  Search, 
  Filter, 
  Eye, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  FileText, 
  UserCheck, 
  Clock, 
  Calendar,
  MessageSquare
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [loadingModal, setLoadingModal] = useState<boolean>(false);

  useEffect(() => {
    fetchHistory();
  }, [selectedCrop, selectedStatus]);

  const fetchHistory = () => {
    setLoading(true);
    api.getHistory(selectedCrop, selectedStatus, searchTerm)
      .then((data) => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const openReportModal = async (id: number) => {
    setLoadingModal(true);
    try {
      const data = await api.getReportDetail(id);
      setActiveReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Official Government Header */}
      <div className="bg-white border border-slate-300 border-l-4 border-l-[#0F2942] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <FileText className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>फसल जांच रिकॉर्ड • Crop Health Records Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] mb-1">
            {t.history.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-2xl leading-relaxed">
            {t.history.subtitle}
          </p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="agri-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#748077] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded-md focus:outline-none focus:border-[#245C3A]"
          />
        </form>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="text-[#748077] font-semibold">Crop:</span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="p-1.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded text-xs font-medium"
            >
              <option value="all">All Crops</option>
              <option value="cotton">Cotton</option>
              <option value="soybean">Soybean</option>
              <option value="rice">Rice</option>
              <option value="maize">Maize</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-[#748077] font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-1.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending Review</option>
              <option value="corrected">Corrected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="agri-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#748077]">
            <div className="w-6 h-6 border-2 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading health history...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#748077]">
            {t.history.noReports}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F7F2] border-b border-[#E3E9E1] text-[#748077] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">{t.history.reportId}</th>
                  <th className="py-3 px-4">{t.history.crop}</th>
                  <th className="py-3 px-4">{t.history.condition}</th>
                  <th className="py-3 px-4">{t.history.location}</th>
                  <th className="py-3 px-4">{t.history.severity}</th>
                  <th className="py-3 px-4">{t.history.status}</th>
                  <th className="py-3 px-4">{t.history.date}</th>
                  <th className="py-3 px-4 text-right">{t.history.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E9E1]">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F5F7F2]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#245C3A]">
                      {r.report_code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#26332B]">
                      {r.crop}
                    </td>
                    <td className="py-3 px-4">
                      <span className={r.is_healthy ? "text-emerald-700 font-medium" : "text-rose-700 font-medium"}>
                        {r.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#748077]">
                      {r.village}, {r.district}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.severity === 'healthy' ? 'bg-emerald-100 text-emerald-800' :
                        r.severity === 'mild' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                        r.verification_status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                        r.verification_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.verification_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#748077]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openReportModal(r.id)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-emerald-50 border border-[#E3E9E1] hover:border-[#245C3A] text-[#245C3A] text-xs font-semibold rounded transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E3E9E1] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E9E1]">
              <div>
                <span className="text-xs font-mono text-[#245C3A] font-bold">
                  {activeReport.report_code}
                </span>
                <h3 className="text-lg font-bold text-[#26332B]">
                  {activeReport.condition_detected}
                </h3>
                <div className="text-xs text-[#748077]">
                  {activeReport.village}, {activeReport.taluka}, {activeReport.district} • {new Date(activeReport.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 rounded-full text-gray-500 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Specimen Photograph */}
            {activeReport.image_url && (
              <div className="rounded-lg overflow-hidden border border-[#E3E9E1] max-h-56 bg-black flex items-center justify-center">
                <img
                  src={activeReport.image_url}
                  alt="Specimen"
                  className="max-h-56 object-contain"
                />
              </div>
            )}

            {/* AI Diagnostics Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-[#F5F7F2] border border-[#E3E9E1]">
                <div className="text-[#748077]">Crop</div>
                <div className="font-bold text-[#26332B]">{activeReport.crop}</div>
              </div>
              <div className="p-2.5 rounded bg-[#F5F7F2] border border-[#E3E9E1]">
                <div className="text-[#748077]">Confidence</div>
                <div className="font-bold text-[#245C3A]">{Math.round(activeReport.confidence * 100)}%</div>
              </div>
              <div className="p-2.5 rounded bg-[#F5F7F2] border border-[#E3E9E1]">
                <div className="text-[#748077]">Severity</div>
                <div className="font-bold capitalize text-[#26332B]">{activeReport.severity}</div>
              </div>
            </div>

            {/* Expert Verification Section */}
            {activeReport.expert_verification ? (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span>Verified by Agronomist: {activeReport.expert_verification.expert_name}</span>
                </div>
                <div className="text-emerald-950 leading-relaxed">
                  <strong>Agronomist Notes: </strong>
                  {activeReport.expert_verification.expert_notes}
                </div>
                {activeReport.expert_verification.prescribed_treatment && (
                  <div className="text-emerald-950 leading-relaxed pt-1 border-t border-emerald-200/60">
                    <strong>Prescribed Treatment: </strong>
                    {activeReport.expert_verification.prescribed_treatment}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                Pending verification by KVK agricultural extension scientist.
              </div>
            )}

            {/* Standard Cultural & Chemical Guidance */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-[#26332B] uppercase tracking-wider text-[11px]">
                Standard Operating Treatment
              </h4>
              <p className="p-2.5 bg-[#F5F7F2] rounded border border-[#E3E9E1] text-[#26332B]">
                <strong>Cultural Management: </strong>{activeReport.cultural_control}
              </p>
              <p className="p-2.5 bg-[#F5F7F2] rounded border border-[#E3E9E1] text-[#26332B]">
                <strong>Chemical Treatment: </strong>{activeReport.chemical_control}
              </p>
            </div>

            {/* Follow-up observations list */}
            {activeReport.follow_up_observations?.length > 0 && (
              <div className="space-y-2 text-xs pt-2 border-t border-[#E3E9E1]">
                <h4 className="font-bold text-[#26332B] uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#245C3A]" />
                  <span>Farmer Follow-Up History</span>
                </h4>
                {activeReport.follow_up_observations.map((fu: any) => (
                  <div key={fu.id} className="p-2 bg-[#F5F7F2] rounded border border-[#E3E9E1] text-xs">
                    <div className="flex justify-between font-semibold text-[#748077] text-[10px] mb-1">
                      <span>Status: <span className="capitalize text-emerald-800">{fu.recovery_status}</span></span>
                      <span>{new Date(fu.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[#26332B]">{fu.observation_text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-[#E3E9E1]">
              <button
                onClick={() => setActiveReport(null)}
                className="px-4 py-2 bg-[#245C3A] text-white text-xs font-semibold rounded hover:bg-[#173D2A] transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Eye, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck2,
  Clock,
  Filter,
  Save,
  MessageSquare
} from 'lucide-react';

export const ExpertPortalPage: React.FC = () => {
  const { t } = useLanguage();
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  // Verification Form State
  const [verificationStatus, setVerificationStatus] = useState<string>('verified');
  const [verifiedCondition, setVerifiedCondition] = useState<string>('');
  const [verifiedSeverity, setVerifiedSeverity] = useState<string>('moderate');
  const [expertNotes, setExpertNotes] = useState<string>('');
  const [prescribedTreatment, setPrescribedTreatment] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, [selectedCrop]);

  const fetchPending = () => {
    setLoading(true);
    api.getPendingReports(selectedCrop === 'all' ? undefined : selectedCrop)
      .then((data) => {
        setPendingReports(data);
        if (data.length > 0 && !selectedReport) {
          selectReport(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const selectReport = (r: any) => {
    setSelectedReport(r);
    setVerifiedCondition(r.condition_detected);
    setVerifiedSeverity(r.severity);
    setVerificationStatus('verified');
    setExpertNotes('');
    setPrescribedTreatment(r.chemical_control || '');
    setSuccessMsg(null);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    setSuccessMsg(null);

    try {
      await api.verifyReport(selectedReport.id, {
        verified_condition: verifiedCondition,
        status: verificationStatus,
        verified_severity: verifiedSeverity,
        expert_notes: expertNotes || 'Diagnosis verified by KVK Senior Agronomist based on foliar pathology morphology.',
        prescribed_treatment: prescribedTreatment
      });

      setSuccessMsg(t.expert.verifiedSuccess);
      // Remove verified item from queue
      setPendingReports(prev => prev.filter(p => p.id !== selectedReport.id));
      setSelectedReport(null);
      fetchPending();
    } catch (err: any) {
      alert('Verification submission error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#245C3A] uppercase tracking-wider mb-1">
          <UserCheck className="w-4 h-4" />
          <span>Agricultural Scientist & KVK Verification Desk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#26332B] mb-2">
          {t.expert.title}
        </h1>
        <p className="text-sm text-[#748077] max-w-2xl leading-relaxed">
          {t.expert.subtitle}
        </p>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Queue List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="agri-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-[#245C3A]" />
                <span>{t.expert.pendingQueue} ({pendingReports.length})</span>
              </h3>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="text-xs p-1 bg-[#F5F7F2] border border-[#E3E9E1] rounded"
              >
                <option value="all">All Crops</option>
                <option value="cotton">Cotton</option>
                <option value="soybean">Soybean</option>
                <option value="rice">Rice</option>
                <option value="maize">Maize</option>
              </select>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-[#748077]">
                Loading pending queue...
              </div>
            ) : pendingReports.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-800 bg-emerald-50 rounded">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                All pending field reports have been verified!
              </div>
            ) : (
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {pendingReports.map((r) => {
                  const isSelected = selectedReport?.id === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => selectReport(r)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-xs ${
                        isSelected
                          ? 'border-[#245C3A] bg-emerald-50/70 shadow-sm'
                          : 'border-[#E3E9E1] hover:border-[#6C9468] bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-bold text-[11px] text-[#245C3A] mb-1">
                        <span>{r.report_code}</span>
                        <span className="capitalize px-1.5 py-0.2 rounded bg-white text-[#26332B] border">
                          {r.crop}
                        </span>
                      </div>
                      <div className="font-semibold text-[#26332B] truncate mb-1">
                        {r.condition_detected}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#748077]">
                        <span>{r.village}, {r.district}</span>
                        <span>{Math.round(r.confidence * 100)}% AI Conf.</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Specimen Inspection & Clinical Verification Form */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="agri-card p-6 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E9E1] gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-[#245C3A]">
                    {selectedReport.report_code}
                  </span>
                  <h3 className="text-xl font-bold text-[#26332B]">
                    {selectedReport.condition_detected}
                  </h3>
                  <div className="text-xs text-[#748077]">
                    Farm: {selectedReport.village}, {selectedReport.taluka}, {selectedReport.district} • Crop: {selectedReport.crop}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-bold text-[#245C3A]">
                    AI Confidence: {Math.round(selectedReport.confidence * 100)}%
                  </div>
                  <div className="text-[11px] text-[#748077]">
                    Initial Severity: <span className="capitalize font-semibold">{selectedReport.severity}</span>
                  </div>
                </div>
              </div>

              {/* Specimen Image Inspection */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#748077] flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.expert.inspectImage}</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-[#E3E9E1] bg-black max-h-64 flex items-center justify-center">
                  <img
                    src={selectedReport.image_url}
                    alt="High-resolution specimen inspection"
                    className="max-h-64 object-contain"
                  />
                </div>
              </div>

              {/* Observed AI Symptoms */}
              <div className="p-3 bg-[#F5F7F2] rounded border border-[#E3E9E1] text-xs space-y-1">
                <div className="font-bold text-[#26332B]">AI Pathology Notes & Symptoms:</div>
                <div className="text-[#748077] leading-relaxed">{selectedReport.symptoms}</div>
              </div>

              {/* Verification Form */}
              <form onSubmit={handleVerificationSubmit} className="space-y-4 pt-2 border-t border-[#E3E9E1]">
                <h4 className="font-bold text-sm text-[#26332B]">
                  Agronomist Diagnosis & Clinical Recommendation
                </h4>

                {/* Status selector buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationStatus('verified')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                      verificationStatus === 'verified'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-[#E3E9E1] text-[#748077] hover:border-gray-400'
                    }`}
                  >
                    Confirm AI Diagnosis
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationStatus('corrected')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                      verificationStatus === 'corrected'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-[#E3E9E1] text-[#748077] hover:border-gray-400'
                    }`}
                  >
                    Correct Diagnosis
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationStatus('rejected')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-colors ${
                      verificationStatus === 'rejected'
                        ? 'border-red-600 bg-red-50 text-red-900 font-bold'
                        : 'border-[#E3E9E1] text-[#748077] hover:border-gray-400'
                    }`}
                  >
                    Inconclusive / Reject
                  </button>
                </div>

                {/* Corrected Condition input (if status is corrected) */}
                {verificationStatus === 'corrected' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#26332B] mb-1">
                      Correct Pathological Classification:
                    </label>
                    <input
                      type="text"
                      value={verifiedCondition}
                      onChange={(e) => setVerifiedCondition(e.target.value)}
                      placeholder="e.g. Cotton Leaf Curl Virus (Begomovirus)"
                      className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                      required
                    />
                  </div>
                )}

                {/* Severity adjustment */}
                <div>
                  <label className="block text-xs font-semibold text-[#26332B] mb-1">
                    Calibrated Severity Level:
                  </label>
                  <select
                    value={verifiedSeverity}
                    onChange={(e) => setVerifiedSeverity(e.target.value)}
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  >
                    <option value="healthy">Healthy (No foliar necrosis)</option>
                    <option value="mild">Mild (&lt; 15% foliar damage)</option>
                    <option value="moderate">Moderate (15% - 40% damage)</option>
                    <option value="severe">Severe (&gt; 40% damage / lodging risk)</option>
                  </select>
                </div>

                {/* Expert Clinical Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#26332B] mb-1">
                    Expert Agronomic Notes & Observations:
                  </label>
                  <textarea
                    value={expertNotes}
                    onChange={(e) => setExpertNotes(e.target.value)}
                    placeholder="Enter professional field diagnostic observations, pathogen morphology notes, or cultural corrections for the farmer..."
                    rows={3}
                    className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                    required
                  ></textarea>
                </div>

                {/* Prescribed Treatment */}
                <div>
                  <label className="block text-xs font-semibold text-[#26332B] mb-1">
                    Prescribed Chemical / Biological Formulation & Dosage:
                  </label>
                  <textarea
                    value={prescribedTreatment}
                    onChange={(e) => setPrescribedTreatment(e.target.value)}
                    placeholder="e.g. Spray Copper Oxychloride 50% WP @ 2.5 g/L mixed with Streptocycline @ 100 mg/L in 200 liters water/acre. Pre-Harvest Interval (PHI): 15 days."
                    rows={2}
                    className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  ></textarea>
                </div>

                {successMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="py-2.5 px-5 bg-[#245C3A] hover:bg-[#173D2A] text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Submitting Verification...' : t.expert.saveVerification}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="agri-card p-12 text-center flex flex-col items-center justify-center h-full min-h-[460px]">
              <FileCheck2 className="w-12 h-12 text-[#6C9468] mb-3" />
              <h3 className="font-semibold text-base text-[#26332B] mb-1">
                Select a Report from the Pending Queue
              </h3>
              <p className="text-xs text-[#748077] max-w-sm">
                Examine high-resolution crop photos, confirm or correct AI model diagnoses, and deliver certified agricultural recommendations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


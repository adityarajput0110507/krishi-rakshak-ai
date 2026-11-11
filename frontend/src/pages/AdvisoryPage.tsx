import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  BookOpen, 
  Search, 
  ShieldCheck, 
  Leaf, 
  PhoneCall, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import { SprayCalculator } from '../components/SprayCalculator';

export const AdvisoryPage: React.FC = () => {
  const { t } = useLanguage();
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchAdvisories();
  }, [selectedCrop]);

  const fetchAdvisories = () => {
    setLoading(true);
    api.getAdvisories(selectedCrop, searchTerm)
      .then((data) => {
        setAdvisories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAdvisories();
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Official Government Header */}
      <div className="bg-white border border-slate-300 border-l-4 border-l-[#14532D] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>कृषि विज्ञान केंद्र (KVK) एवं ICAR प्रमाणित सलाह</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] mb-1">
            {t.advisory.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-2xl leading-relaxed">
            {t.advisory.subtitle}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="self-start md:self-auto px-4 py-2.5 bg-[#FF9933] hover:bg-amber-500 text-[#0F2942] font-extrabold text-xs rounded-lg shadow-sm flex items-center space-x-2 shrink-0 border border-amber-500"
        >
          <PhoneCall className="w-4 h-4" />
          <span>किसान हेल्पलाइन: 1800-180-1551</span>
        </a>
      </div>

      {/* Spray Dose Calculator */}
      <SprayCalculator />

      {/* Search and Crop Selector */}
      <div className="agri-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 text-[#748077] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.advisory.searchCrops}
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded-md focus:outline-none focus:border-[#245C3A]"
          />
        </form>

        <div className="flex items-center space-x-2">
          {['all', 'cotton', 'soybean', 'rice', 'maize'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCrop(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                selectedCrop === c
                  ? 'bg-[#245C3A] text-white shadow-sm font-semibold'
                  : 'bg-white border border-[#E3E9E1] text-[#26332B] hover:border-[#6C9468]'
              }`}
            >
              {c === 'all' ? 'All Crops' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Advisory Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#748077]">
          <div className="w-6 h-6 border-2 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading standard operating procedures...
        </div>
      ) : advisories.length === 0 ? (
        <div className="agri-card p-12 text-center text-xs text-[#748077]">
          No matching advisory records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {advisories.map((a) => (
            <div key={a.id} className="agri-card p-6 flex flex-col justify-between space-y-4">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-[#173D2A]">
                    {a.crop}
                  </span>
                  <span className="text-[11px] text-[#748077] italic">
                    {a.authority_source}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#26332B] mb-1">
                  {a.disease_or_pest}
                </h3>
                <p className="text-xs text-[#748077] mb-4">
                  {a.description}
                </p>

                {/* Symptoms */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#748077] mb-1">
                    Symptoms
                  </div>
                  <p className="text-xs text-[#26332B] bg-[#F5F7F2] p-2.5 rounded border border-[#E3E9E1] leading-relaxed">
                    {a.symptoms}
                  </p>
                </div>

                {/* Cultural Practices */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-1">
                    Cultural & Preventative Management
                  </div>
                  <p className="text-xs text-[#26332B] bg-emerald-50/40 p-2.5 rounded border border-emerald-100 leading-relaxed">
                    {a.cultural_control}
                  </p>
                </div>

                {/* Biological Control */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-900 mb-1">
                    Biological Control & Bio-Agents
                  </div>
                  <p className="text-xs text-[#26332B] bg-teal-50/40 p-2.5 rounded border border-teal-100 leading-relaxed">
                    {a.biological_control}
                  </p>
                </div>

                {/* Approved Chemical Treatment with PHI */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                    Approved Chemical Interventions
                  </div>
                  <div className="text-xs text-[#26332B] bg-amber-50/40 p-2.5 rounded border border-amber-200/80 leading-relaxed space-y-1.5">
                    <div>{a.chemical_control}</div>
                    <div className="text-[11px] text-amber-900 font-semibold pt-1 border-t border-amber-200/60">
                      Safety & Waiting Period (PHI): {a.safety_guidelines}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Officer Section */}
              <div className="pt-3 border-t border-[#E3E9E1] text-xs text-blue-900 bg-blue-50/50 p-3 rounded border border-blue-200">
                <div className="font-bold flex items-center space-x-1.5 mb-0.5">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                  <span>{t.advisory.whenToContactOfficer}:</span>
                </div>
                <div className="leading-relaxed">{a.when_to_contact_officer}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


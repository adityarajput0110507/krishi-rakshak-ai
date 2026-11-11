import React, { useEffect, useState } from 'react';
import {
  Landmark,
  IndianRupee,
  Calculator,
  ExternalLink,
  PhoneCall,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { SprayCalculator } from '../components/SprayCalculator';

export const SchemesMandiPage: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'schemes' | 'mandi' | 'calculator'>('schemes');
  const [schemes, setSchemes] = useState<any[]>([]);
  const [mandiRates, setMandiRates] = useState<any[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [mandiSearch, setMandiSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getSchemesAndMandi()
      .then((res) => {
        setSchemes(res.schemes || []);
        setMandiRates(res.mandi_rates || []);
        setDisclaimer(res.disclaimer || '');
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const filteredRates = mandiRates.filter(
    (r) =>
      r.crop.toLowerCase().includes(mandiSearch.toLowerCase()) ||
      r.mandi.toLowerCase().includes(mandiSearch.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Official Header Card */}
      <div className="bg-white border border-slate-300 border-l-4 border-l-[#FF9933] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <Landmark className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>किसान कल्याण एवं बाजार पोर्टल • Govt Schemes &amp; Mandi Rates</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942]">
            {language === 'hi'
              ? 'सरकारी योजनाएं, मंडी भाव व दवाई कैलकुलेटर'
              : language === 'mr'
              ? 'शासकीय योजना, बाजारभाव व फवारणी कॅल्क्युलेटर'
              : 'Government Schemes, Mandi MSP & Spray Calculator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
            {language === 'hi'
              ? 'PM-KISAN, फसल बीमा, महाडीबीटी अनुदान की जानकारी, ताज़ा मंडी भाव और खेत के लिए सही दवाई मात्रा जानें।'
              : language === 'mr'
              ? 'PM-KISAN, पीक विमा, महाडीबीटी अनुदान माहिती, बाजारभाव आणि अचूक औषध प्रमाण पहा.'
              : 'Explore farmer welfare schemes, official MSP & Mandi rates, and calculate spray quantities.'}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="self-start md:self-auto px-4 py-2.5 bg-[#14532D] hover:bg-[#0f3f22] text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center space-x-2 shrink-0"
        >
          <PhoneCall className="w-4 h-4 text-[#FF9933]" />
          <span>हेल्पलाइन: 1800-180-1551</span>
        </a>
      </div>

      {/* Simple Tab Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('schemes')}
          className={`p-3.5 rounded-xl border-2 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'schemes'
              ? 'bg-[#0F2942] text-white border-[#0F2942] shadow'
              : 'bg-white text-[#0F2942] border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Landmark className="w-5 h-5 text-[#FF9933]" />
          <span>सरकारी योजनाएं (Schemes)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mandi')}
          className={`p-3.5 rounded-xl border-2 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'mandi'
              ? 'bg-[#14532D] text-white border-[#14532D] shadow'
              : 'bg-white text-[#14532D] border-slate-300 hover:bg-green-50'
          }`}
        >
          <IndianRupee className="w-5 h-5 text-amber-400" />
          <span>मंडी भाव व MSP (Market)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calculator')}
          className={`p-3.5 rounded-xl border-2 font-extrabold text-sm flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'calculator'
              ? 'bg-[#D97706] text-white border-[#D97706] shadow'
              : 'bg-white text-amber-900 border-slate-300 hover:bg-amber-50'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span>दवाई कैलकुलेटर (Calculator)</span>
        </button>
      </div>

      {/* Tab 1: Govt Schemes */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {loading ? (
            <div className="col-span-2 p-8 text-center text-sm font-bold text-slate-600">
              सरकारी योजनाएं लोड हो रही हैं...
            </div>
          ) : (
            schemes.map((s) => (
              <div key={s.id} className="govt-card p-5 border-t-4 border-t-[#14532D] flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                      {s.category}
                    </span>
                    <span className="text-[11px] font-bold text-[#14532D] flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Scheme</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0F2942]">{s.name}</h3>

                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-950 font-bold leading-relaxed">
                    💰 लाभ: {s.benefit}
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <div>
                      <strong className="text-[#0F2942]">पात्रता (Eligibility):</strong> {s.eligibility}
                    </div>
                    <div>
                      <strong className="text-[#0F2942]">आवेदन कैसे करें:</strong> {s.how_to_apply}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-600">
                    हेल्पलाइन: <span className="text-[#0F2942]">{s.helpline}</span>
                  </div>
                  <a
                    href={s.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-[#0F2942] hover:bg-[#14532D] text-white text-xs font-extrabold rounded-lg transition-colors"
                  >
                    <span>आधिकारिक पोर्टल खोलें</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Mandi Bhav & MSP */}
      {activeTab === 'mandi' && (
        <div className="govt-card p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#0F2942]">
                प्रमुख मंडी भाव व सरकारी न्यूनतम समर्थन मूल्य (MSP 2025-26)
              </h3>
              <p className="text-xs text-slate-600">{disclaimer}</p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={mandiSearch}
                onChange={(e) => setMandiSearch(e.target.value)}
                placeholder="फसल या मंडी खोजें (उदा. प्याज, नाशिक)..."
                className="w-full pl-9 pr-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-[#14532D]"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0F2942] text-white">
                <tr>
                  <th className="p-3 font-bold">फसल (Crop)</th>
                  <th className="p-3 font-bold">सरकारी MSP</th>
                  <th className="p-3 font-bold">प्रमुख मंडी (APMC Hub)</th>
                  <th className="p-3 font-bold">ताज़ा मंडी भाव</th>
                  <th className="p-3 font-bold">रुझान (Trend)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredRates.map((row, idx) => (
                  <tr key={idx} className="hover:bg-green-50/60">
                    <td className="p-3 font-extrabold text-[#0F2942]">{row.crop}</td>
                    <td className="p-3 font-semibold text-slate-700">{row.msp}</td>
                    <td className="p-3 text-slate-600">{row.mandi}</td>
                    <td className="p-3 font-extrabold text-[#14532D] text-sm">{row.modal_price}</td>
                    <td className="p-3">
                      {row.trend === 'up' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-green-100 text-green-900 font-bold text-[11px]">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>तेजी (Up)</span>
                        </span>
                      ) : row.trend === 'down' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[11px]">
                          <TrendingDown className="w-3.5 h-3.5" />
                          <span>मंदी (Down)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[11px]">
                          <Minus className="w-3.5 h-3.5" />
                          <span>स्थिर (Stable)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-950 font-semibold flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#14532D]" />
              <span>सटीक दैनिक बोली के लिए राष्ट्रीय कृषि बाजार (e-NAM) आधिकारिक पोर्टल देखें:</span>
            </span>
            <a
              href="https://www.enam.gov.in"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-[#14532D] text-white rounded font-bold hover:bg-[#0f3f22]"
            >
              e-NAM पोर्टल खोलें &rarr;
            </a>
          </div>
        </div>
      )}

      {/* Tab 3: Standalone Spray Calculator */}
      {activeTab === 'calculator' && (
        <SprayCalculator />
      )}
    </div>
  );
};


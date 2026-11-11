import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  ArrowLeft, 
  Sprout, 
  Cpu, 
  Droplets, 
  Thermometer, 
  Layers, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Bug, 
  CheckCircle2, 
  Info,
  BookOpen,
  Upload,
  ExternalLink
} from 'lucide-react';

export const CropDetailPage: React.FC = () => {
  const { cropId } = useParams<{ cropId: string }>();
  const { t } = useLanguage();
  const [crop, setCrop] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'cultivation' | 'diseases' | 'pests' | 'ai'>('cultivation');

  useEffect(() => {
    if (!cropId) return;
    setLoading(true);
    api.getCropDetail(cropId)
      .then((data) => {
        setCrop(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [cropId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-[#748077]">Loading official crop profile...</p>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="container mx-auto px-4 py-16 text-center space-y-4">
        <Info className="w-12 h-12 text-[#748077] mx-auto opacity-50" />
        <h2 className="text-xl font-bold text-[#26332B]">Crop Record Not Found</h2>
        <p className="text-xs text-[#748077]">The requested crop does not exist in the National Agricultural Repository.</p>
        <Link
          to="/crops"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-[#245C3A] text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Crop Catalogue</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      {/* Back Link */}
      <Link
        to="/crops"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#245C3A] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Indian Crop Catalogue</span>
      </Link>

      {/* Hero Header Card */}
      <div className="agri-card p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#F5F7F2] text-[#245C3A] border border-[#E3E9E1]">
                {crop.category_name}
              </span>
              {crop.is_ai_supported ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center space-x-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                  <span>AI Pathology Model Supported</span>
                </span>
              ) : (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
                  Agronomic Reference Guide
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#26332B]">
              {crop.name}
            </h1>

            {crop.scientific_name && (
              <p className="text-sm italic font-medium text-[#748077]">
                Botanical Classification: {crop.scientific_name}
              </p>
            )}

            {/* Local Names Badges */}
            {crop.local_names && crop.local_names.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {crop.local_names.map((ln: any, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-[#173D2A] border border-emerald-200 font-medium"
                  >
                    <strong>{ln.language_name}:</strong> {ln.local_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* AI Quick Action */}
          {crop.is_ai_supported ? (
            <Link
              to={`/detect?crop=${crop.slug}`}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#245C3A] hover:bg-[#173D2A] text-white text-xs font-bold rounded-lg shadow-sm transition-colors self-start"
            >
              <Upload className="w-4 h-4" />
              <span>Diagnose Leaf Photo with AI</span>
            </Link>
          ) : (
            <div className="px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 max-w-xs">
              <div className="font-bold flex items-center space-x-1 mb-1">
                <Info className="w-3.5 h-3.5 text-amber-700" />
                <span>AI Diagnosis Status</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                AI visual diagnosis is currently under training for {crop.name}. Complete agronomic & IPM guidance is provided below.
              </p>
            </div>
          )}
        </div>

        {crop.description && (
          <p className="text-sm text-[#26332B] leading-relaxed pt-2 border-t border-[#E3E9E1]">
            {crop.description}
          </p>
        )}
      </div>

      {/* Key Agronomic Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="agri-card p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#245C3A] flex items-center justify-center shrink-0">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#748077]">Temperature</div>
            <div className="text-sm font-bold text-[#26332B]">
              {crop.temp_min && crop.temp_max ? `${crop.temp_min}°C - ${crop.temp_max}°C` : "Information not available"}
            </div>
          </div>
        </div>

        <div className="agri-card p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#748077]">Water Need</div>
            <div className="text-sm font-bold text-[#26332B]">
              {crop.water_requirement_mm || "Information not available"}
            </div>
          </div>
        </div>

        <div className="agri-card p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#748077]">Sowing Period</div>
            <div className="text-xs font-bold text-[#26332B] truncate max-w-[150px]">
              {crop.sowing_period || "Information not available"}
            </div>
          </div>
        </div>

        <div className="agri-card p-4 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#748077]">Harvesting</div>
            <div className="text-xs font-bold text-[#26332B] truncate max-w-[150px]">
              {crop.harvesting_period || "Information not available"}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#E3E9E1] space-x-2">
        <button
          onClick={() => setActiveTab('cultivation')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'cultivation'
              ? 'border-[#245C3A] text-[#245C3A]'
              : 'border-transparent text-[#748077] hover:text-[#26332B]'
          }`}
        >
          Cultivation & Soil Guide
        </button>
        <button
          onClick={() => setActiveTab('diseases')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'diseases'
              ? 'border-[#245C3A] text-[#245C3A]'
              : 'border-transparent text-[#748077] hover:text-[#26332B]'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-700" />
          <span>Diseases & Management ({crop.diseases?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('pests')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'pests'
              ? 'border-[#245C3A] text-[#245C3A]'
              : 'border-transparent text-[#748077] hover:text-[#26332B]'
          }`}
        >
          <Bug className="w-4 h-4 text-amber-700" />
          <span>Pest Management ({crop.pests?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 px-4 text-xs font-bold transition-colors border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'ai'
              ? 'border-[#245C3A] text-[#245C3A]'
              : 'border-transparent text-[#748077] hover:text-[#26332B]'
          }`}
        >
          <Cpu className="w-4 h-4 text-blue-700" />
          <span>AI Model Architecture</span>
        </button>
      </div>

      {/* Tab 1: Cultivation & Soil */}
      {activeTab === 'cultivation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Soil & Environment */}
            <div className="agri-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#245C3A]" />
                <span>Suitable Soil Conditions</span>
              </h3>
              <p className="text-xs text-[#26332B] leading-relaxed">
                {crop.suitable_soil || "Information not available"}
              </p>

              <div className="pt-3 border-t border-[#E3E9E1] space-y-2 text-xs">
                <div>
                  <span className="text-[#748077] font-semibold block text-[10px] uppercase">Major Cultivation Belts</span>
                  <p className="text-[#26332B] font-medium mt-0.5">{crop.major_regions || "Information not available"}</p>
                </div>
              </div>
            </div>

            {/* Cultivated States */}
            <div className="agri-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#245C3A]" />
                <span>Cultivated Indian States & Zones</span>
              </h3>
              
              {crop.regions && crop.regions.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {crop.regions.map((reg: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded bg-[#F5F7F2] border border-[#E3E9E1] text-xs">
                      <div className="font-bold text-[#26332B] flex items-center justify-between">
                        <span>{reg.state_name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-[#245C3A] font-semibold">
                          {reg.prominence}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#748077] mt-0.5 truncate">
                        {reg.agro_climatic_zone}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#748077]">Information not available</p>
              )}
            </div>
          </div>

          {/* Cultivation Guidelines Package of Practices */}
          {crop.guidelines && crop.guidelines.length > 0 && (
            <div className="agri-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#245C3A]" />
                <span>Standard Operating Procedures & Cultivation Practices</span>
              </h3>
              <div className="space-y-3">
                {crop.guidelines.map((g: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-lg bg-[#F5F7F2] border border-[#E3E9E1] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#26332B]">{g.topic}</span>
                      <span className="text-[10px] text-[#748077]">{g.source_organization}</span>
                    </div>
                    <p className="text-xs text-[#26332B] leading-relaxed">
                      {g.guideline_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Diseases & IPM */}
      {activeTab === 'diseases' && (
        <div className="space-y-6">
          {crop.diseases && crop.diseases.length > 0 ? (
            <div className="space-y-5">
              {crop.diseases.map((dis: any) => (
                <div key={dis.id} className="agri-card p-6 space-y-4 border-l-4 border-l-rose-600">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-900">
                          {dis.pathogen_type} Pathogen
                        </span>
                        <span className="text-[10px] font-semibold text-[#748077]">
                          Severity Potential: {dis.severity_potential}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#26332B] mt-1">
                        {dis.name}
                      </h4>
                      {dis.scientific_name && (
                        <p className="text-xs italic text-[#748077]">
                          {dis.scientific_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-3 rounded bg-[#F5F7F2] border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-[#26332B] block text-[11px]">Observed Foliar Symptoms:</span>
                      <p className="text-[#26332B] leading-relaxed">{dis.symptoms}</p>
                    </div>

                    <div className="p-3 rounded bg-[#F5F7F2] border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-[#26332B] block text-[11px]">Environmental Risk Factors:</span>
                      <p className="text-[#748077] leading-relaxed">{dis.environmental_risk_factors || "Information not available"}</p>
                    </div>
                  </div>

                  {/* Prevention & IPM */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded bg-white border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-emerald-800 text-[11px] block">Preventive Measures:</span>
                      <p className="text-[#26332B] text-[11px] leading-relaxed">{dis.prevention_methods || "Information not available"}</p>
                    </div>
                    <div className="p-3 rounded bg-white border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-blue-800 text-[11px] block">Biological Control:</span>
                      <p className="text-[#26332B] text-[11px] leading-relaxed">{dis.biological_management || "Information not available"}</p>
                    </div>
                    <div className="p-3 rounded bg-white border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-amber-800 text-[11px] block">IPM & Chemical Protocol:</span>
                      <p className="text-[#26332B] text-[11px] leading-relaxed">{dis.ipm_recommendations || "Information not available"}</p>
                    </div>
                  </div>

                  {dis.expert_treatment_reference && (
                    <div className="text-[11px] text-[#748077] flex items-center space-x-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Certified Reference: {dis.expert_treatment_reference}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="agri-card p-10 text-center space-y-2">
              <Info className="w-8 h-8 text-[#748077] mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-[#26332B]">No Specific Disease Outbreaks Documented</h4>
              <p className="text-xs text-[#748077]">Standard regional phytosanitary practices apply to {crop.name}.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Pests & IPM */}
      {activeTab === 'pests' && (
        <div className="space-y-6">
          {crop.pests && crop.pests.length > 0 ? (
            <div className="space-y-5">
              {crop.pests.map((pest: any) => (
                <div key={pest.id} className="agri-card p-6 space-y-4 border-l-4 border-l-amber-600">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {pest.pest_type}
                        </span>
                        <span className="text-[10px] font-semibold text-[#748077]">
                          Infestation Season: {pest.infestation_season || "Kharif / Warm & Humid"}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#26332B] mt-1">
                        {pest.name}
                      </h4>
                      {pest.scientific_name && (
                        <p className="text-xs italic text-[#748077]">
                          {pest.scientific_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="p-3 rounded bg-[#F5F7F2] border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-[#26332B] block text-[11px]">Damage Symptoms:</span>
                      <p className="text-[#26332B] leading-relaxed">{pest.symptoms}</p>
                    </div>

                    <div className="p-3 rounded bg-[#F5F7F2] border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-amber-900 block text-[11px]">Economic Threshold Level (ETL):</span>
                      <p className="text-[#26332B] font-semibold leading-relaxed">{pest.economic_threshold_level || "Information not available"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded bg-white border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-emerald-800 text-[11px] block">Prevention:</span>
                      <p className="text-[#26332B] text-[11px] leading-relaxed">{pest.prevention_methods || "Information not available"}</p>
                    </div>
                    <div className="p-3 rounded bg-white border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-blue-800 text-[11px] block">Bio-Control / Predators:</span>
                      <p className="text-[#26332B] text-[11px] leading-relaxed">{pest.biological_management || "Information not available"}</p>
                    </div>
                    <div className="p-3 rounded bg-white border border-[#E3E9E1] space-y-1">
                      <span className="font-bold text-amber-800 text-[11px] block">IPM / Chemical Sprays:</span>
                      <p className="text-[#26332B] text-[11px] leading-relaxed">{pest.ipm_recommendations || "Information not available"}</p>
                    </div>
                  </div>

                  {pest.expert_treatment_reference && (
                    <div className="text-[11px] text-[#748077] flex items-center space-x-1.5 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Certified Reference: {pest.expert_treatment_reference}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="agri-card p-10 text-center space-y-2">
              <Info className="w-8 h-8 text-[#748077] mx-auto opacity-50" />
              <h4 className="text-sm font-bold text-[#26332B]">No Major Pest Infestations Catalogued</h4>
              <p className="text-xs text-[#748077]">Refer to local Krishi Vigyan Kendra advisories for seasonal pests.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: AI Model Architecture & Support Status */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="agri-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-[#26332B] flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-[#245C3A]" />
              <span>Deep Learning Diagnostic Capability</span>
            </h3>

            {crop.is_ai_supported ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sm text-[#245C3A]">
                    <CheckCircle2 className="w-4 h-4 text-[#245C3A]" />
                    <span>Active Production AI Support for {crop.name}</span>
                  </div>
                  <p className="leading-relaxed">
                    Visual leaf photographs of {crop.name} are classified by our mobile-optimized deep neural network trained on multi-spectral foliar datasets verified by ICAR-CICR / MPKV agronomists.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F5F7F2] border-b border-[#E3E9E1] text-[#748077] uppercase text-[10px]">
                        <th className="py-2.5 px-3">Class Label</th>
                        <th className="py-2.5 px-3">Pathological Condition</th>
                        <th className="py-2.5 px-3">Precision</th>
                        <th className="py-2.5 px-3">Recall</th>
                        <th className="py-2.5 px-3">F1-Score</th>
                        <th className="py-2.5 px-3 text-right">Dataset Samples</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E3E9E1]">
                      {crop.supported_classes?.map((sc: any) => (
                        <tr key={sc.id} className="hover:bg-[#F5F7F2]/50">
                          <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#245C3A]">{sc.class_label}</td>
                          <td className="py-2.5 px-3 font-medium text-[#26332B]">{sc.disease_name}</td>
                          <td className="py-2.5 px-3">{(sc.precision_score * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3">{(sc.recall_score * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 font-semibold text-emerald-800">{(sc.f1_score * 100).toFixed(1)}%</td>
                          <td className="py-2.5 px-3 text-right">{sc.sample_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/detect?crop=${crop.slug}`}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#245C3A] text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Proceed to Disease Diagnostics</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-[#F5F7F2] border border-[#E3E9E1] space-y-3">
                <div className="flex items-center space-x-2 font-bold text-sm text-[#26332B]">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>AI Image Diagnosis Currently Unavailable</span>
                </div>
                <p className="text-xs text-[#748077] leading-relaxed">
                  In accordance with SIH26131 accuracy standards, CropGuard AI does not fabricate predictions for crop varieties where field-validated training datasets are not yet incorporated.
                </p>
                <div className="p-3 bg-white rounded border border-[#E3E9E1] text-xs text-[#26332B] space-y-1">
                  <span className="font-bold text-[11px] block">Model Expansion Roadmap:</span>
                  <p className="text-[11px] text-[#748077]">
                    Certified pathology image collection drives are ongoing for {crop.name} in collaboration with State Agricultural Universities. You may explore the complete Agronomic & IPM Guide above.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


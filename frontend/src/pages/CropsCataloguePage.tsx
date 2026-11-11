import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  Search, 
  Filter, 
  Sprout, 
  Cpu, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Info,
  BookOpen,
  Wheat,
  Layers
} from 'lucide-react';

export const CropsCataloguePage: React.FC = () => {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiOnly, setAiOnly] = useState<boolean>(false);

  useEffect(() => {
    // Load categories & states
    Promise.all([
      api.getCropCategories(),
      api.getStates()
    ]).then(([cats, stateList]) => {
      setCategories(cats);
      setStates(stateList);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    api.getCrops({
      category: selectedCategory || undefined,
      state: selectedState || undefined,
      season: selectedSeason || undefined,
      search: searchQuery || undefined,
      ai_supported: aiOnly ? true : undefined
    }).then((data) => {
      setCrops(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [selectedCategory, selectedState, selectedSeason, searchQuery, aiOnly]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Official Government Portal Header Card */}
      <div className="bg-white border border-slate-300 border-l-4 border-l-[#14532D] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <Sprout className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>राष्ट्रीय कृषि फसल भंडार • National Crop Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] mb-1">
            सभी 92 भारतीय फसलें देखें (Explore Indian Crops)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-2xl">
            भारत के सभी 28 राज्यों और 8 केंद्र शासित प्रदेशों की 92 फसलों की खेती, रोग एवं कीट उपचार जानकारी।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-green-100 text-[#14532D] font-extrabold border border-green-300">
            {crops.length} फसलें उपलब्ध
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-[#0F2942] text-white font-extrabold flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>सभी 92 फसलों पर AI जांच</span>
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="agri-card p-5 space-y-4">
        {/* Search Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#748077]" />
            <input
              type="text"
              placeholder="Search by crop name (e.g. Wheat, Rice, Bajra, Cotton, Mango, Turmeric)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded-lg text-sm text-[#26332B] placeholder-[#748077] focus:outline-none focus:border-[#245C3A] focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAiOnly(!aiOnly)}
              className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors border ${
                aiOnly
                  ? 'bg-[#245C3A] text-white border-[#245C3A]'
                  : 'bg-[#F5F7F2] text-[#26332B] border-[#E3E9E1] hover:bg-emerald-50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>AI Supported Only</span>
            </button>

            {(selectedCategory || selectedState || selectedSeason || searchQuery || aiOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedState('');
                  setSelectedSeason('');
                  setSearchQuery('');
                  setAiOnly(false);
                }}
                className="px-3.5 py-2.5 text-xs text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 font-medium transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#E3E9E1]">
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#748077] uppercase tracking-wider mb-1">
              Crop Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded-md text-xs font-medium text-[#26332B] focus:outline-none focus:border-[#245C3A]"
            >
              <option value="">All Categories (10 Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} ({c.crop_count} crops)
                </option>
              ))}
            </select>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#748077] uppercase tracking-wider mb-1">
              State / Union Territory
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded-md text-xs font-medium text-[#26332B] focus:outline-none focus:border-[#245C3A]"
            >
              <option value="">All Indian States & UTs (36)</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Season Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-[#748077] uppercase tracking-wider mb-1">
              Growing Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded-md text-xs font-medium text-[#26332B] focus:outline-none focus:border-[#245C3A]"
            >
              <option value="">All Seasons</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Zaid">Zaid / Summer</option>
              <option value="Perennial">Perennial / Annual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Quick Scroll */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedCategory === ''
              ? 'bg-[#245C3A] text-white shadow-sm'
              : 'bg-white border border-[#E3E9E1] text-[#748077] hover:border-[#6C9468]'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.slug
                ? 'bg-[#245C3A] text-white shadow-sm'
                : 'bg-white border border-[#E3E9E1] text-[#748077] hover:border-[#6C9468]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Crop Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#748077]">Filtering Indian crop catalogue...</p>
        </div>
      ) : crops.length === 0 ? (
        <div className="agri-card p-12 text-center space-y-3">
          <Info className="w-10 h-10 text-[#748077] mx-auto opacity-40" />
          <h3 className="font-bold text-base text-[#26332B]">No crops found</h3>
          <p className="text-xs text-[#748077] max-w-md mx-auto">
            No crops matched your selected filters. Try choosing a different state, category, or clearing the search query.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {crops.map((crop) => (
            <Link
              key={crop.id}
              to={`/crops/${crop.id}`}
              className="agri-card agri-card-hover p-5 flex flex-col justify-between group cursor-pointer block"
            >
              <div className="space-y-3">
                {/* Top Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F5F7F2] text-[#748077] border border-[#E3E9E1]">
                    {crop.category_name}
                  </span>

                  {crop.is_ai_supported ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                      <Cpu className="w-3 h-3 text-emerald-700" />
                      <span>AI Model Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      Crop Guide
                    </span>
                  )}
                </div>

                {/* Crop Name & Scientific Name */}
                <div>
                  <h3 className="text-lg font-bold text-[#26332B] group-hover:text-[#245C3A] transition-colors">
                    {crop.name}
                  </h3>
                  {crop.scientific_name && (
                    <p className="text-xs italic text-[#748077]">
                      {crop.scientific_name}
                    </p>
                  )}
                </div>

                {/* Local Names (Hindi / Marathi) */}
                {crop.local_names && crop.local_names.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {crop.local_names.map((ln: any, idx: number) => (
                      <span key={idx} className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-[#245C3A] border border-emerald-200/60 font-medium">
                        {ln.language_name}: {ln.local_name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Key Cultivation Parameters */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] border-t border-[#E3E9E1]">
                  <div>
                    <span className="text-[#748077] block text-[10px] uppercase font-semibold">Sowing Period</span>
                    <span className="font-medium text-[#26332B] truncate block">{crop.sowing_period || "Information not available"}</span>
                  </div>
                  <div>
                    <span className="text-[#748077] block text-[10px] uppercase font-semibold">Harvesting</span>
                    <span className="font-medium text-[#26332B] truncate block">{crop.harvesting_period || "Information not available"}</span>
                  </div>
                </div>

                {/* Cultivated States */}
                {crop.cultivated_states && crop.cultivated_states.length > 0 && (
                  <div className="pt-2 text-xs">
                    <span className="text-[10px] text-[#748077] uppercase font-semibold block mb-1">
                      Major States:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {crop.cultivated_states.slice(0, 4).map((st: string, idx: number) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px]">
                          {st}
                        </span>
                      ))}
                      {crop.cultivated_states.length > 4 && (
                        <span className="px-1.5 py-0.5 rounded bg-stone-100 text-[#748077] text-[10px]">
                          +{crop.cultivated_states.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Action */}
              <div className="pt-4 mt-3 border-t border-[#E3E9E1] flex items-center justify-between text-xs font-semibold text-[#245C3A]">
                <span>View Full Cultivation Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  AlertTriangle, 
  CloudSun, 
  Thermometer, 
  Droplets, 
  Wind, 
  MapPin, 
  Sprout, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Calendar
} from 'lucide-react';

export const RiskSurveillancePage: React.FC = () => {
  const { t } = useLanguage();

  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [selectedCrop, setSelectedCrop] = useState<string>('cotton');
  const [growthStage, setGrowthStage] = useState<string>('Vegetative');

  // Sliders
  const [temperature, setTemperature] = useState<number>(28.5);
  const [humidity, setHumidity] = useState<number>(76.0);
  const [rainfall, setRainfall] = useState<number>(2.0);

  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [riskResult, setRiskResult] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const panIndiaHubs = [
      "Indore", "Bhopal", "Ludhiana", "Amritsar", "Karnal",
      "Lucknow", "Varanasi", "Jaipur", "Patna", "Rajkot",
      "Surat", "Guntur", "Bengaluru", "Coimbatore"
    ];
    api.getDistricts()
      .then(d => {
        const merged = Array.from(new Set([...(Array.isArray(d) ? d : []), ...panIndiaHubs]));
        setDistricts(merged);
      })
      .catch(() => {
        setDistricts([
          "Nashik", "Pune", "Amravati", "Yavatmal", "Chhatrapati Sambhajinagar", 
          "Kolhapur", "Jalgaon", "Satara", "Nanded", "Solapur", "Akola", "Wardha",
          ...panIndiaHubs
        ]);
      });
  }, []);

  // Update weather when district changes
  useEffect(() => {
    if (!selectedDistrict) return;
    api.getWeather(selectedDistrict)
      .then((w) => {
        setWeatherData(w);
        setTemperature(w.temperature);
        setHumidity(w.relative_humidity);
        setRainfall(w.precipitation_mm);
      })
      .catch(console.error);
  }, [selectedDistrict]);

  // Recalculate risk on parameter change
  useEffect(() => {
    runRiskPrediction();
  }, [selectedDistrict, selectedCrop, growthStage, temperature, humidity, rainfall]);

  const runRiskPrediction = () => {
    setLoading(true);
    api.predictRisk({
      crop_name: selectedCrop,
      district: selectedDistrict,
      growth_stage: growthStage,
      temperature: temperature,
      relative_humidity: humidity,
      rainfall_mm: rainfall
    })
      .then(res => {
        setRiskResult(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const isCritical = riskResult?.risk_level === 'Critical';
  const isHigh = riskResult?.risk_level === 'High';
  const isModerate = riskResult?.risk_level === 'Moderate';

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      {/* Official Government Header Card */}
      <div className="bg-white border border-slate-300 border-l-4 border-l-[#0F2942] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <CloudSun className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>लाइव मौसम एवं रोग खतरा पूर्वानुमान • Open-Meteo 7-Day Sync</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F2942] mb-1">
            {t.risk.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-2xl leading-relaxed">
            {t.risk.subtitle}
          </p>
        </div>
        <div className="text-xs font-bold bg-green-50 border border-green-300 text-[#14532D] px-3.5 py-2 rounded-lg shrink-0">
          {weatherData?.is_live ? '🟢 Live Weather Connected' : '🟡 Regional Weather Norm'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="agri-card p-6 space-y-5">
            <h2 className="font-extrabold text-base text-[#0F2942] flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#14532D]" />
              <span>जिला व फसल चुनें (Select Region &amp; Crop)</span>
            </h2>

            {/* District select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                अपना जिला / केंद्र चुनें (District / Hub)
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-bold focus:outline-none focus:border-[#14532D]"
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Crop Select */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                फसल चुनें (Select Crop)
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded font-bold focus:outline-none focus:border-[#14532D]"
              >
                <option value="cotton">Cotton (कपास)</option>
                <option value="soybean">Soybean (सोयाबीन)</option>
                <option value="rice">Rice / Paddy (धान / चावल)</option>
                <option value="maize">Maize (मक्का)</option>
                <option value="wheat">Wheat (गेहूं)</option>
                <option value="tomato">Tomato (टमाटर)</option>
                <option value="potato">Potato (आलू)</option>
                <option value="onion">Onion (प्याज)</option>
                <option value="sugarcane">Sugarcane (गन्ना)</option>
              </select>
            </div>

            {/* Growth stage */}
            <div>
              <label className="block text-xs font-semibold text-[#748077] mb-1.5 uppercase tracking-wider">
                Crop Phenological Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded font-medium focus:outline-none focus:border-[#245C3A]"
              >
                <option value="Germination">Germination & Seedling (उगवण अवस्था)</option>
                <option value="Vegetative">Vegetative Canopy (शाकीय वाढ अवस्था)</option>
                <option value="Flowering">Flowering & Squaring (फुलोरा अवस्था)</option>
                <option value="Boll/Grain formation">Boll / Pod / Grain Filling (बोंड / शेंग भरणे)</option>
                <option value="Maturity">Maturity & Ripening (पक्वता अवस्था)</option>
              </select>
            </div>

            {/* Sliders for environmental calibration */}
            <div className="pt-4 border-t border-[#E3E9E1] space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#26332B]">
                <span>Meteorological Conditions</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Live Synoptic Sync
                </span>
              </div>

              {/* Temperature */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#748077]">Temperature:</span>
                  <span className="font-bold text-[#26332B]">{temperature}°C</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="45"
                  step="0.5"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-[#245C3A] cursor-pointer"
                />
              </div>

              {/* Relative Humidity */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#748077]">Relative Humidity:</span>
                  <span className="font-bold text-[#26332B]">{humidity}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={humidity}
                  onChange={(e) => setHumidity(parseFloat(e.target.value))}
                  className="w-full accent-[#245C3A] cursor-pointer"
                />
              </div>

              {/* Rainfall */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#748077]">Recent Precipitation:</span>
                  <span className="font-bold text-[#26332B]">{rainfall} mm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="0.5"
                  value={rainfall}
                  onChange={(e) => setRainfall(parseFloat(e.target.value))}
                  className="w-full accent-[#245C3A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {riskResult && (
            <div className={`agri-card p-6 border-t-4 ${
              isCritical ? 'border-t-red-600 bg-red-50/20' :
              isHigh ? 'border-t-rose-600 bg-rose-50/20' :
              isModerate ? 'border-t-amber-500 bg-amber-50/20' : 'border-t-emerald-600 bg-emerald-50/20'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E3E9E1]">
                <div>
                  <div className="text-xs font-semibold text-[#748077] uppercase tracking-wider mb-0.5">
                    {riskResult.district} District • {riskResult.crop_name}
                  </div>
                  <h3 className="text-xl font-bold text-[#26332B]">
                    {riskResult.target_pathogen}
                  </h3>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto ${
                  isCritical ? 'bg-red-100 text-red-900 border border-red-300' :
                  isHigh ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                  isModerate ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {riskResult.risk_level} Risk ({Math.round(riskResult.risk_probability * 100)}% Probability)
                </div>
              </div>

              {/* Progress gauge */}
              <div className="mt-4 mb-6">
                <div className="flex justify-between text-xs text-[#748077] mb-1">
                  <span>Outbreak Likelihood Score</span>
                  <span className="font-bold">{Math.round(riskResult.risk_probability * 100)} / 100</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${riskResult.risk_probability * 100}%` }}
                    className={`h-full transition-all duration-500 ${
                      isCritical ? 'bg-red-600' :
                      isHigh ? 'bg-rose-600' :
                      isModerate ? 'bg-amber-500' : 'bg-emerald-600'
                    }`}
                  ></div>
                </div>
              </div>

              {/* Advisory Card */}
              <div className="p-4 bg-white rounded-lg border border-[#E3E9E1] mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-[#245C3A] mb-1.5 flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Regional Agricultural Advisory Alert</span>
                </div>
                <p className="text-xs text-[#26332B] leading-relaxed">
                  {riskResult.advisory_recommendation}
                </p>
              </div>

              {/* Contributing meteorological drivers */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#748077]">
                  Contributing Epidemiological Factors:
                </h4>
                <div className="space-y-1.5">
                  {riskResult.contributing_factors?.map((f: string, i: number) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-[#26332B] bg-[#F5F7F2] p-2.5 rounded border border-[#E3E9E1]">
                      <span className="text-[#245C3A] font-bold shrink-0 mt-0.5">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 7-Day District Forecast & Spray Advisory */}
          {weatherData?.forecast && (
            <div className="agri-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <h3 className="font-extrabold text-sm text-[#0F2942] flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#14532D]" />
                  <span>{weatherData.forecast.length}-दिन का लाइव मौसम व स्प्रे सलाह ({selectedDistrict})</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-600">Open-Meteo Forecast</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {weatherData.forecast.map((day: any, idx: number) => {
                  const rainy = Number(day.precipitation_sum || 0) >= 2.0;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-center text-xs ${
                        rainy ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      <div className="font-extrabold text-[#0F2942] mb-1">
                        {day.date.split('-').slice(1).join('/')}
                      </div>
                      <div className="text-[10px] text-slate-600 mb-1 capitalize truncate" title={day.condition}>
                        {day.condition}
                      </div>
                      <div className="font-extrabold text-[#14532D]">
                        {day.temp_max}° / {day.temp_min}°
                      </div>
                      <div className="text-[10px] text-sky-700 font-bold mt-1">
                        {day.precipitation_sum} mm बारिश
                      </div>
                      <div
                        className={`mt-1.5 text-[9px] font-extrabold py-0.5 px-1 rounded ${
                          rainy ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'
                        }`}
                      >
                        {rainy ? 'स्प्रे न करें' : 'स्प्रे सही'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


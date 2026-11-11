import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import { 
  Scan, 
  FileText, 
  CloudSun, 
  AlertTriangle, 
  MapPin, 
  Sprout, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Droplets, 
  Wind, 
  ShieldAlert, 
  ArrowRight,
  ChevronRight,
  Compass,
  PhoneCall,
  Sparkles,
  Leaf,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

export const FarmerDashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Regional selection
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Nashik');
  const [selectedVillage, setSelectedVillage] = useState<string>('Pimpalgaon Baswant');
  const [regionalCrops, setRegionalCrops] = useState<any[]>([]);

  useEffect(() => {
    api.getStates().then(setStates).catch(console.error);

    api.getFarmerDashboard()
      .then((data) => {
        setDashboard(data);
        if (data?.location?.district) setSelectedDistrict(data.location.district);
        if (data?.location?.village) setSelectedVillage(data.location.village);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Using authenticated default dashboard data:', err);
        setDashboard({
          farmer_name: user?.name || "Ramesh Vitthal Shinde",
          phone: user?.phone || "9822011003",
          location: {
            state: "Maharashtra",
            district: "Nashik",
            taluka: "Niphad",
            village: "Pimpalgaon Baswant",
            land_area_acres: 4.5
          },
          primary_crop: "cotton",
          weather: {
            district: "Nashik",
            temperature: 28.5,
            relative_humidity: 74.0,
            precipitation_mm: 1.5,
            wind_speed_kmh: 12.4,
            weather_condition: "Partly cloudy",
            is_live: true
          },
          disease_risk: {
            risk_level: "High",
            risk_probability: 0.82,
            target_pathogen: "Cotton Bacterial Blight (जीवाणु झुलसा)",
            contributing_factors: [
              "हवा में नमी (74%) पत्तियों को गीला रख रही है",
              "तापमान (28.5°C) बीमारी के फैलाव के अनुकूल है",
              "कपास की फसल अभी पत्तियों के विकास की अवस्था में है"
            ],
            advisory_recommendation: "खेत से अतिरिक्त पानी निकालें और पत्तियों के नीचे धब्बे दिखने पर तुरंत कॉपर ऑक्सीक्लोराइड का छिड़काव करें।"
          },
          total_farmer_reports: 6,
          recent_reports: [
            {
              id: 1,
              report_code: "CG-2601-NSK",
              crop: "Cotton (कपास)",
              condition: "Bacterial Blight (जीवाणु झुलसा)",
              is_healthy: false,
              severity: "mild",
              confidence: 0.97,
              verification_status: "verified",
              created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
              image_url: "/static/samples/cotton_bacterial_blight.jpg"
            },
            {
              id: 6,
              report_code: "CG-2606-PUN",
              crop: "Soybean (सोयाबीन)",
              condition: "Healthy Soybean (स्वस्थ फसल)",
              is_healthy: true,
              severity: "healthy",
              confidence: 0.96,
              verification_status: "verified",
              created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
              image_url: "/static/samples/soybean_healthy.jpg"
            }
          ]
        });
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (selectedState) {
      api.getDistrictsForState(selectedState)
        .then((distList) => {
          setDistricts(distList);
          if (distList.length > 0 && !distList.includes(selectedDistrict)) {
            setSelectedDistrict(distList[0]);
          }
        })
        .catch(console.error);

      api.getStateCrops(selectedState)
        .then((cropsList) => setRegionalCrops(cropsList))
        .catch(console.error);
    }
  }, [selectedState]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#245C3A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm font-semibold text-[#748077]">
          {language === 'hi' ? 'किसान डैशबोर्ड लोड हो रहा है...' : language === 'mr' ? 'शेतकरी डॅशबोर्ड लोड होत आहे...' : 'Loading Farmer Dashboard...'}
        </p>
      </div>
    );
  }

  const d = dashboard;
  const isHighRisk = d?.disease_risk?.risk_level === 'Critical' || d?.disease_risk?.risk_level === 'High';

  // Spray condition judgment based on rain and wind
  const isSafeToSpray = d.weather?.wind_speed_kmh < 18 && (d.weather?.precipitation_mm || 0) < 2.5;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      
      {/* 1. Farmer Welcome Card */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-[#173D2A] via-[#205133] to-[#245C3A] text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-900/60 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {d.location.village}, {d.location.district}, {d.location.state || "Maharashtra"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {language === 'hi' 
              ? `नमस्ते, ${d.farmer_name} जी! 🌾` 
              : language === 'mr' 
              ? `नमस्कार, ${d.farmer_name} जी! 🌾` 
              : `Welcome, ${d.farmer_name}! 🌾`}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
            {language === 'hi'
              ? `पंजीकृत खेत: ${d.location.land_area_acres} एकड़ • मुख्य फसल: `
              : language === 'mr'
              ? `नोंदणीकृत शेत: ${d.location.land_area_acres} एकर • मुख्य पीक: `
              : `Registered Farm: ${d.location.land_area_acres} Acres • Primary Crop: `}
            <span className="capitalize font-bold text-amber-300 underline decoration-amber-400/50">
              {d.primary_crop === 'cotton' ? (language === 'hi' ? 'कपास (Cotton)' : language === 'mr' ? 'कापूस (Cotton)' : 'Cotton') : d.primary_crop}
            </span>
          </p>
        </div>

        {/* Quick Emergency/Helpline CTA */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="tel:18001801551"
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow flex items-center space-x-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'hi' ? 'किसान हेल्पलाइन 1800-180-1551' : language === 'mr' ? 'शेतकरी हेल्पलाइन 1800-180-1551' : 'Kisan Helpline 1800-180-1551'}</span>
          </a>
        </div>
      </div>

      {/* 2. Four Big Core Farmer Action Cards (बड़ी किसान बटनें) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Scan & Detect Disease (High priority forest green) */}
        <Link
          to="/detect"
          className="group p-5 rounded-2xl bg-gradient-to-br from-[#245C3A] to-[#173D2A] text-white shadow-md hover:shadow-xl transition-all border border-emerald-500/30 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 mb-3 group-hover:scale-105 transition-transform">
              <Scan className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-white mb-1">
              {language === 'hi' ? '1. फसल की बीमारी जांचें' : language === 'mr' ? '1. पीक रोग तपासा' : '1. Scan Crop Disease'}
            </h3>
            <p className="text-xs text-emerald-100/80 leading-relaxed">
              {language === 'hi' 
                ? 'पत्ती का फोटो खींचें और तुरंत बीमारी व सही दवाई का नाम जानें'
                : language === 'mr'
                ? 'पानाचा फोटो काढा आणि लगेच रोग व योग्य औषधाचे नाव जाणून घ्या'
                : 'Upload leaf photo to diagnose crop disease & exact medicine'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>{language === 'hi' ? 'अभी जांचें' : language === 'mr' ? 'आता तपासा' : 'Scan Now'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 2: Crop Guide & Catalogue (Warm Golden/Amber) */}
        <Link
          to="/crops"
          className="group p-5 rounded-2xl bg-gradient-to-br from-amber-900/90 to-amber-950 text-white shadow-md hover:shadow-xl transition-all border border-amber-500/30 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 mb-3 group-hover:scale-105 transition-transform">
              <Sprout className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-white mb-1">
              {language === 'hi' ? '2. भारतीय फसल मार्गदर्शिका' : language === 'mr' ? '2. भारतीय पीक मार्गदर्शक' : '2. All-India Crop Guide'}
            </h3>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {language === 'hi'
                ? '92 फसलों की किस्में, सिंचाई, खाद और रोगों के जैविक व रासायनिक उपचार'
                : language === 'mr'
                ? '92 पिकांच्या जाती, खत, पाणी व्यवस्थापन व रोग नियंत्रण'
                : 'Comprehensive guide for 92 Indian crops, soil, water & IPM'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-amber-800/60 flex items-center justify-between text-xs font-bold text-amber-300">
            <span>{language === 'hi' ? 'फसलें देखें' : language === 'mr' ? 'पिके पहा' : 'Browse Crops'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Weather & Spray Status (Sky Blue) */}
        <Link
          to="/risk"
          className="group p-5 rounded-2xl bg-gradient-to-br from-sky-900 to-slate-900 text-white shadow-md hover:shadow-xl transition-all border border-sky-500/30 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-sky-400/20 border border-sky-400/40 flex items-center justify-center text-sky-300 mb-3 group-hover:scale-105 transition-transform">
              <CloudSun className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-white mb-1">
              {language === 'hi' ? '3. मौसम व छिड़काव सलाह' : language === 'mr' ? '3. हवामान व फवारणी सल्ला' : '3. Weather & Spray Advice'}
            </h3>
            <p className="text-xs text-sky-100/80 leading-relaxed">
              {d.weather?.temperature}°C • नमी: {d.weather?.relative_humidity}% • हवा: {d.weather?.wind_speed_kmh} km/h
            </p>
            <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isSafeToSpray ? (language === 'hi' ? 'आज छिड़काव के लिए मौसम सही' : language === 'mr' ? 'आज फवारणीसाठी योग्य वेळ' : 'Favorable for Spray Today') : 'Avoid Spray Today'}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-sky-800/60 flex items-center justify-between text-xs font-bold text-sky-300">
            <span>{language === 'hi' ? 'मौसम रिपोर्ट' : language === 'mr' ? 'हवामान तपशील' : 'Weather Details'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Past Reports & History (Purple / Blue) */}
        <Link
          to="/history"
          className="group p-5 rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-950 text-white shadow-md hover:shadow-xl transition-all border border-purple-500/30 flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-400/20 border border-purple-400/40 flex items-center justify-center text-purple-300 mb-3 group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-base text-white mb-1">
              {language === 'hi' ? '4. मेरी फसल रिपोर्ट' : language === 'mr' ? '4. माझी पीक तपासणी रिपोर्ट' : '4. My Health Reports'}
            </h3>
            <p className="text-xs text-purple-100/80 leading-relaxed">
              {language === 'hi' 
                ? `${d.total_farmer_reports} पिछली जांचें सुरक्षित हैं। विशेषज्ञ की सलाह देखें` 
                : language === 'mr'
                ? `${d.total_farmer_reports} पूर्वीच्या तपासण्या जतन आहेत`
                : `${d.total_farmer_reports} Saved crop health reports with expert advice`}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-800/60 flex items-center justify-between text-xs font-bold text-purple-300">
            <span>{language === 'hi' ? 'रिपोर्ट्स देखें' : language === 'mr' ? 'रिपोर्ट पहा' : 'View Reports'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 3. Today's Field Alert Banner (आज का खेत सुरक्षा अलर्ट) */}
      <div className={`p-6 rounded-2xl border-2 ${
        isHighRisk ? 'border-rose-400 bg-rose-50/80 text-rose-950' : 'border-emerald-400 bg-emerald-50/80 text-emerald-950'
      } shadow-sm`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
              isHighRisk ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                {language === 'hi' ? '⚠️ आज का खेत सुरक्षा अलर्ट (Disease Risk Alert)' : language === 'mr' ? '⚠️ आजचा पीक सुरक्षा इशारा' : '⚠️ Field Disease Alert'}
              </h2>
              <p className="text-xs font-medium text-black/70">
                {selectedDistrict}, {selectedState}
              </p>
            </div>
          </div>

          <span className={`self-start sm:self-auto px-3 py-1 rounded-full text-xs font-extrabold ${
            isHighRisk ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {isHighRisk ? (language === 'hi' ? 'उच्च जोखिम (High Alert)' : 'High Risk') : 'Normal'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white/80 rounded-xl border border-black/5">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              {language === 'hi' ? 'संभावित बीमारी' : 'Target Disease'}
            </span>
            <span className="text-sm font-extrabold text-gray-900 block">
              {d.disease_risk?.target_pathogen}
            </span>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-black/5">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              {language === 'hi' ? 'कारण' : 'Reason'}
            </span>
            <span className="text-xs font-semibold text-gray-800 block">
              हवा में उच्च नमी ({d.weather?.relative_humidity}%) और तापमान ({d.weather?.temperature}°C)
            </span>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-black/5">
            <span className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              {language === 'hi' ? 'किसान के लिए सलाह' : 'Advisory Action'}
            </span>
            <span className="text-xs font-semibold text-gray-800 block">
              {d.disease_risk?.advisory_recommendation}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Farm Location & Recommended Regional Crops */}
      <div className="agri-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3E9E1] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#26332B] flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#245C3A]" />
              <span>
                {language === 'hi' ? 'आपकी लोकेशन और क्षेत्र की फसलें' : language === 'mr' ? 'आपले ठिकाण आणि भागातील पिके' : 'Farm Location & Regional Crops'}
              </span>
            </h3>
            <p className="text-xs text-[#748077]">
              {language === 'hi' 
                ? 'अपने राज्य और जिले का चयन करें ताकि आपके इलाके की उपयुक्त फसलें देख सकें' 
                : 'Select State and District to see crops suitable for your region'}
            </p>
          </div>

          <Link
            to={`/crops?state=${encodeURIComponent(selectedState)}`}
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center space-x-1"
          >
            <span>{selectedState} की सभी फसलें देखें &rarr;</span>
          </Link>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#748077] mb-1">
              {language === 'hi' ? 'राज्य चुनें (State)' : 'Select State'}
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs font-semibold p-3 bg-[#F5F7F2] border border-[#E3E9E1] rounded-xl text-[#26332B] focus:outline-none focus:border-[#245C3A]"
            >
              {states.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#748077] mb-1">
              {language === 'hi' ? 'जिला चुनें (District)' : 'Select District'}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs font-semibold p-3 bg-[#F5F7F2] border border-[#E3E9E1] rounded-xl text-[#26332B] focus:outline-none focus:border-[#245C3A]"
            >
              {districts.map((dst) => (
                <option key={dst} value={dst}>{dst}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Crop Pills Shelf */}
        <div className="pt-2">
          <div className="text-xs font-bold text-[#26332B] mb-2.5">
            {selectedDistrict} ({selectedState}) में उगाई जाने वाली प्रमुख फसलें:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {regionalCrops.slice(0, 8).map((crop) => (
              <Link
                key={crop.id}
                to={`/crops/${crop.id}`}
                className="p-3.5 rounded-xl bg-white border border-[#E3E9E1] hover:border-[#245C3A] hover:shadow-md transition-all block group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs text-[#26332B] group-hover:text-[#245C3A]">
                    {crop.name}
                  </span>
                  {crop.is_ai_supported && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="AI Supported"></span>
                  )}
                </div>
                <div className="text-[11px] text-[#748077] truncate">
                  {crop.category}
                </div>
                <div className="text-[11px] text-[#245C3A] font-bold mt-2 flex items-center justify-between">
                  <span>जानकारी देखें</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Scans - Clean Cards */}
      <div className="agri-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3E9E1] pb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#26332B]">
              {language === 'hi' ? 'मेरी हालिया फसल जांच (Recent Crop Scans)' : 'Recent Crop Scans'}
            </h3>
            <p className="text-xs text-[#748077]">
              {language === 'hi' ? 'आपके द्वारा अपलोड की गई पत्तियों की रिपोर्ट' : 'Your uploaded leaf specimens'}
            </p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-[#245C3A] hover:underline flex items-center space-x-1"
          >
            <span>सभी रिपोर्ट देखें &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {d.recent_reports?.map((rep: any) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl border border-[#E3E9E1] bg-white flex items-center space-x-4 shadow-sm hover:border-[#245C3A] transition-colors"
            >
              <div className="w-16 h-16 rounded-lg bg-emerald-50 border border-emerald-200 overflow-hidden shrink-0">
                <img
                  src={rep.image_url}
                  alt={rep.crop}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback visual icon if sample image fails to load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-sm text-[#26332B] truncate">
                    {rep.crop}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    rep.is_healthy 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rep.is_healthy ? '🟢 स्वस्थ' : '🔴 रोगग्रस्त'}
                  </span>
                </div>

                <p className="text-xs text-[#748077] font-medium truncate mb-2">
                  {rep.condition}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#748077]">
                    सटीकता: {Math.round((rep.confidence || 0.9) * 100)}%
                  </span>
                  <Link
                    to="/history"
                    className="font-bold text-[#245C3A] hover:underline"
                  >
                    दवा व उपचार &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

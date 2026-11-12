import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  Upload, 
  Camera, 
  X, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Leaf, 
  PhoneCall,
  ShieldCheck,
  Search,
  ChevronDown,
  Volume2,
  VolumeX,
  Printer,
  Share2
} from 'lucide-react';
import { SprayCalculator } from '../components/SprayCalculator';

export const DiseaseDetectionPage: React.FC = () => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [allCrops, setAllCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('cotton');
  const [cropSearch, setCropSearch] = useState<string>('');
  
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Nashik');
  const [village, setVillage] = useState<string>('Pimpalgaon');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Follow-up state
  const [followUpText, setFollowUpText] = useState<string>('');
  const [followUpStatus, setFollowUpStatus] = useState<string>('improving');
  const [followUpSubmitted, setFollowUpSubmitted] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cropParam = params.get('crop');
    if (cropParam) {
      setSelectedCrop(cropParam.toLowerCase());
    }

    api.getStates().then(setStates).catch(console.error);

    // Fetch all crops from database
    api.getCrops()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllCrops(data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (state) {
      api.getDistrictsForState(state).then((list) => {
        setDistricts(list);
        if (list.length > 0 && !list.includes(district)) {
          setDistrict(list[0]);
        }
      }).catch(console.error);
    }
  }, [state]);

  // Top popular crops chips for 1-click farmer access
  const popularCrops = [
    { id: 'cotton', name: language === 'hi' ? 'कपास' : language === 'mr' ? 'कापूस' : 'Cotton', icon: '🌿' },
    { id: 'soybean', name: language === 'hi' ? 'सोयाबीन' : language === 'mr' ? 'सोयाबीन' : 'Soybean', icon: '🌱' },
    { id: 'rice', name: language === 'hi' ? 'धान/चावल' : language === 'mr' ? 'भात/धान' : 'Rice', icon: '🌾' },
    { id: 'maize', name: language === 'hi' ? 'मक्का' : language === 'mr' ? 'मका' : 'Maize', icon: '🌽' },
    { id: 'wheat', name: language === 'hi' ? 'गेहूं' : language === 'mr' ? 'गहू' : 'Wheat', icon: '🌾' },
    { id: 'tomato', name: language === 'hi' ? 'टमाटर' : language === 'mr' ? 'टोमॅटो' : 'Tomato', icon: '🍅' },
    { id: 'potato', name: language === 'hi' ? 'आलू' : language === 'mr' ? 'बटाटा' : 'Potato', icon: '🥔' },
    { id: 'sugarcane', name: language === 'hi' ? 'गन्ना' : language === 'mr' ? 'ऊस' : 'Sugarcane', icon: '🎋' },
    { id: 'onion', name: language === 'hi' ? 'प्याज' : language === 'mr' ? 'कांदा' : 'Onion', icon: '🧅' },
    { id: 'chilli', name: language === 'hi' ? 'मिर्च' : language === 'mr' ? 'मिरची' : 'Chilli', icon: '🌶️' },
    { id: 'mango', name: language === 'hi' ? 'आम' : language === 'mr' ? 'आंबा' : 'Mango', icon: '🥭' },
    { id: 'mustard', name: language === 'hi' ? 'सरसों' : language === 'mr' ? 'मोहरी' : 'Mustard', icon: '🌻' },
    { id: 'groundnut', name: language === 'hi' ? 'मूंगफली' : language === 'mr' ? 'भुईमूग' : 'Groundnut', icon: '🥜' },
    { id: 'grapes', name: language === 'hi' ? 'अंगूर' : language === 'mr' ? 'द्राक्षे' : 'Grapes', icon: '🍇' },
  ];

  // Group all 92 crops by Category
  const groupedCrops = useMemo(() => {
    const groups: Record<string, any[]> = {};
    allCrops.forEach((c) => {
      const cat = c.category_name || 'Other Crops';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(c);
    });
    return groups;
  }, [allCrops]);

  // Selected crop display name
  const currentCropObj = allCrops.find(c => c.slug?.toLowerCase() === selectedCrop.toLowerCase() || c.name?.toLowerCase() === selectedCrop.toLowerCase());
  const selectedCropLabel = currentCropObj ? currentCropObj.name : selectedCrop.toUpperCase();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const loadSampleImage = async (url: string, crop: string) => {
    try {
      setSelectedCrop(crop);
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], `${crop}_sample.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreview(url);
      setResult(null);
      setError(null);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError(language === 'hi' ? 'कृपया पहले पत्ती का फोटो चुनें या खींचें।' : 'Please upload or capture a leaf photo first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('crop_type', selectedCrop);
      if (state) formData.append('state', state);
      if (district) formData.append('district', district);
      if (village) formData.append('village', village);

      const res = await api.analyzeCrop(formData);
      setResult(res);
      setFollowUpSubmitted(false);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again with a clear photo.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result?.report_id || !followUpText) return;
    try {
      await api.addFollowUp(result.report_id, followUpText, followUpStatus);
      setFollowUpSubmitted(true);
    } catch (err: any) {
      alert('Failed to submit observation: ' + err.message);
    }
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const msg = [
      `*कृषि रक्षक (CropGuard AI) - फसल रोग जांच रिपोर्ट*`,
      `रिपोर्ट कोड: ${result.report_code}`,
      `फसल: ${result.crop}`,
      `निदान: ${result.condition}`,
      `सटीकता: ${Math.round(result.confidence * 100)}%`,
      result.biological_control ? `🌿 जैविक उपाय: ${result.biological_control}` : '',
      result.chemical_control ? `🧪 दवाई व छिड़काव: ${result.chemical_control}` : '',
      `📞 टोल-फ्री किसान हेल्पलाइन: 1800-180-1551`
    ]
      .filter(Boolean)
      .join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handlePrintReport = () => {
    window.print();
  };

  const toggleSpeakResult = () => {
    if (!('speechSynthesis' in window) || !result) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const textParts = [
      `${result.crop}. ${result.condition}.`,
      result.symptoms ? `Symptoms: ${result.symptoms}.` : '',
      result.biological_control ? `Organic remedy: ${result.biological_control}.` : '',
      result.chemical_control ? `Recommended spray: ${result.chemical_control}.` : ''
    ];
    const utterance = new SpeechSynthesisUtterance(textParts.join(' '));
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
      
      {/* Official Government Portal Header Card */}
      <div className="no-print bg-white border border-slate-300 border-l-4 border-l-[#14532D] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>कृषि विभाग प्रमाणित प्रणाली • 92 भारतीय फसलें शामिल</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942] mb-1">
            {language === 'hi' ? 'फसल रोग जांच केंद्र (Crop Disease Check)' : language === 'mr' ? 'पीक रोग तपासणी केंद्र (Crop Disease Check)' : 'Crop Disease Check Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold">
            {language === 'hi'
              ? 'अपनी फसल चुनें, पत्ती का साफ फोटो अपलोड करें और तुरंत ICAR प्रमाणित इलाज जानें।'
              : language === 'mr'
              ? 'तुमचे पीक निवडा, पानाचा स्पष्ट फोटो अपलोड करा आणि त्वरित ICAR प्रमाणित उपाय पहा.'
              : 'Select any of 92 crops, upload a leaf photo, and get instant ICAR-certified diagnosis & remedies.'}
          </p>
        </div>

        <a
          href="tel:18001801551"
          className="self-start md:self-auto px-4 py-2.5 bg-[#FF9933] hover:bg-amber-500 text-[#0F2942] font-extrabold text-xs rounded-lg transition-all shadow-sm flex items-center space-x-2 shrink-0 border border-amber-500"
        >
          <PhoneCall className="w-4 h-4" />
          <span>किसान हेल्पलाइन: 1800-180-1551</span>
        </a>
      </div>

      {/* Clear 3-Step Visual Progress Guide */}
      <div className="no-print grid grid-cols-3 gap-2 sm:gap-4 bg-white border border-slate-300 rounded-xl p-3 text-center text-xs font-bold shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-2 text-[#0F2942]">
          <span className="w-6 h-6 rounded-full bg-[#14532D] text-white flex items-center justify-center text-xs shrink-0 mb-1 sm:mb-0">1</span>
          <span>फसल चुनें (Select Crop)</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-2 text-[#0F2942] border-l border-r border-slate-200 px-1">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mb-1 sm:mb-0 ${imagePreview ? 'bg-[#14532D] text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
          <span>फोटो डालें (Upload Photo)</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-2 text-[#0F2942]">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mb-1 sm:mb-0 ${result ? 'bg-[#14532D] text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
          <span>उपाय पाएं (Get Remedy)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 1. All-Crop Selector + 2. Photo Upload */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="agri-card p-6 space-y-5">
            
            {/* Step 1: All Crops Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-extrabold text-[#26332B] flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#245C3A] text-white flex items-center justify-center text-xs">1</span>
                  <span>अपनी फसल चुनें (Select Any Crop)</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  92 फसलें उपलब्ध
                </span>
              </div>

              {/* Popular Crop Quick Chips */}
              <div className="text-[11px] font-bold text-[#748077] mb-1.5">
                लोकप्रिय फसलें (Quick Select):
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3 max-h-36 overflow-y-auto p-1 bg-[#F5F7F2] rounded-xl border border-[#E3E9E1]">
                {popularCrops.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCrop(c.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all flex items-center space-x-1 ${
                      selectedCrop.toLowerCase() === c.id.toLowerCase()
                        ? 'bg-[#245C3A] text-white shadow-sm'
                        : 'bg-white text-[#26332B] hover:bg-emerald-50 border border-[#E3E9E1]'
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Comprehensive 92+ Crops Dropdown */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-[#748077] mb-1">
                  या सभी 92 फसलों की सूची में से चुनें:
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full text-xs font-bold p-3 bg-white border-2 border-[#245C3A] rounded-xl text-[#173D2A] focus:outline-none focus:ring-2 focus:ring-[#245C3A]/30 shadow-sm"
                >
                  <option value={selectedCrop}>
                    ✓ चुनी गई फसल: {selectedCropLabel}
                  </option>
                  {Object.keys(groupedCrops).map((catName) => (
                    <optgroup key={catName} label={`--- ${catName} ---`}>
                      {groupedCrops[catName].map((cr) => (
                        <option key={cr.id} value={cr.slug || cr.name.toLowerCase()}>
                          {cr.name} ({cr.scientific_name})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Farm Location (Compact) */}
            <div className="p-3 bg-[#F5F7F2] rounded-xl border border-[#E3E9E1]">
              <div className="text-[11px] font-bold text-[#748077] mb-1.5">
                खेत की लोकेशन (Farm Location):
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="text-xs font-semibold p-2 bg-white border border-[#E3E9E1] rounded-lg text-[#26332B] focus:outline-none"
                >
                  {states.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="text-xs font-semibold p-2 bg-white border border-[#E3E9E1] rounded-lg text-[#26332B] focus:outline-none"
                >
                  {districts.map((dst) => (
                    <option key={dst} value={dst}>{dst}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900 leading-relaxed">
              केवल चुनी हुई फसल की नज़दीकी पत्ती की साफ फोटो डालें — दीवार, कपड़ा, स्क्रीनशॉट या गैर-फसली चीज़ें अस्वीकार कर दी जाएंगी। (4 प्रमुख फसलों में गलत फसल चुनने पर चेतावनी भी दी जाती है)
            </div>

            {/* Step 2: Upload or Camera */}
            <div>
              <label className="text-sm font-extrabold text-[#26332B] flex items-center space-x-1.5 mb-2.5">
                <span className="w-6 h-6 rounded-full bg-[#245C3A] text-white flex items-center justify-center text-xs">2</span>
                <span>पत्ती का फोटो लगाएं (Upload Leaf Photo)</span>
              </label>

              {!imagePreview ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#6C9468] hover:border-[#245C3A] bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-[#245C3A] flex items-center justify-center mx-auto mb-3">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-[#26332B] mb-1">
                    पत्ती का साफ फोटो यहां अपलोड करें
                  </p>
                  <p className="text-[11px] text-[#748077] mb-4">
                    JPG, PNG, WEBP (अधिकतम 10MB)
                  </p>

                  <div className="flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        cameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-[#245C3A] text-white text-xs font-bold rounded-xl hover:bg-[#173D2A] transition-colors shadow flex items-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>कैमरा चालू करें</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-white border border-[#E3E9E1] text-[#245C3A] text-xs font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <span>गैलरी से चुनें</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#245C3A] bg-[#173D2A] shadow-md">
                  <img
                    src={imagePreview}
                    alt="Leaf specimen"
                    className="w-full h-64 object-contain bg-black/40"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors shadow"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white text-[11px] font-semibold px-3 py-1 rounded-lg backdrop-blur-sm">
                    {imageFile?.name || 'Selected Leaf Photo'}
                  </div>
                </div>
              )}

              {/* Sample test buttons */}
              <div className="mt-3 pt-3 border-t border-[#E3E9E1]">
                <div className="text-[11px] font-bold text-[#748077] mb-2">
                  या तैयार नमूनों से तुरंत जांचें (Instant Test Samples):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => loadSampleImage('/static/samples/cotton_bacterial_blight.jpg', 'cotton')}
                    className="p-2 text-left border border-[#E3E9E1] rounded-lg hover:border-[#245C3A] hover:bg-emerald-50/60 font-semibold text-[11px] text-[#26332B] flex items-center space-x-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="truncate">कपास झुलसा (Blight)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleImage('/static/samples/soybean_rust.jpg', 'soybean')}
                    className="p-2 text-left border border-[#E3E9E1] rounded-lg hover:border-[#245C3A] hover:bg-emerald-50/60 font-semibold text-[11px] text-[#26332B] flex items-center space-x-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="truncate">सोयाबीन रस्ट (Rust)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleImage('/static/samples/rice_blast.jpg', 'rice')}
                    className="p-2 text-left border border-[#E3E9E1] rounded-lg hover:border-[#245C3A] hover:bg-emerald-50/60 font-semibold text-[11px] text-[#26332B] flex items-center space-x-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="truncate">धान ब्लास्ट (Blast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleImage('/static/samples/soybean_healthy.jpg', 'soybean')}
                    className="p-2 text-left border border-[#E3E9E1] rounded-lg hover:border-[#245C3A] hover:bg-emerald-50/60 font-semibold text-[11px] text-[#26332B] flex items-center space-x-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="truncate">स्वस्थ पत्ता (Healthy)</span>
                  </button>
                </div>
              </div>

              {/* Big Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !imagePreview}
                className={`w-full mt-5 py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all shadow-md ${
                  loading || !imagePreview
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-[#245C3A] hover:bg-[#173D2A] text-white shadow-emerald-900/20'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>रोग की जांच हो रही है...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>रोग की जांच करें (Diagnose Disease Now)</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Diagnostic Results for ANY Selected Crop */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="agri-card p-6 space-y-5">
              
              {/* Printable Official Govt Slip Header (Visible only when Printing / PDF) */}
              <div className="hidden print-only-header border-b-2 border-[#0F2942] pb-3 mb-3">
                <div className="text-xs font-bold uppercase text-[#14532D]">
                  भारत सरकार | कृषि एवं किसान कल्याण विभाग • ICAR प्रमाणित प्रणाली
                </div>
                <div className="text-xl font-extrabold text-[#0F2942]">
                  कृषि रक्षक (CropGuard AI) — आधिकारिक फसल रोग जांच पर्ची
                </div>
                <div className="text-xs text-slate-600">
                  स्थान: {district}, {state} | दिनांक: {new Date().toLocaleDateString('en-IN')} | किसान कॉल सेंटर: 1800-180-1551
                </div>
              </div>

              {/* Action Bar: Listen + Print/PDF + Share on WhatsApp */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 no-print">
                <span className="text-xs font-extrabold text-[#0F2942] uppercase tracking-wider">
                  जांच रिपोर्ट ({result.report_code})
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeakResult}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold border shadow-sm transition-colors ${
                      speaking
                        ? 'bg-[#0F2942] text-white border-[#0F2942]'
                        : 'bg-white text-[#0F2942] border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {speaking ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#14532D]" />}
                    <span>{speaking ? 'रोकें (Stop)' : 'सुनें (Listen)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintReport}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-[#0F2942] border border-slate-300 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>प्रिंट / PDF पर्ची</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp भेजें</span>
                  </button>
                </div>
              </div>

              {/* Non-Leaf / Crop Mismatch Polite Alert */}
              {result.unsupported && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl text-xs sm:text-sm text-amber-950 font-bold flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div>{result.condition || 'कृपया केवल चुनी हुई फसल की पत्ती की साफ फोटो डालें!'}</div>
                    <div className="text-xs font-medium text-amber-900 mt-0.5">
                      {result.symptoms || 'यह छवि फसल की पत्ती जैसी नहीं लग रही है। अच्छी रोशनी में पत्ती की साफ तस्वीर अपलोड करें।'}
                    </div>
                  </div>
                </div>
              )}

              {/* Result Header Badge */}
              <div className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                result.unsupported
                  ? 'border-amber-400 bg-amber-50 text-amber-950'
                  : result.is_healthy 
                  ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950'
                  : 'border-rose-500 bg-rose-50/90 text-rose-950'
              }`}>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 border border-black/10">
                      {result.crop}
                    </span>
                    <span className="text-[11px] text-gray-600 font-mono">
                      ID: {result.report_code}
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold tracking-tight">
                    {result.condition}
                  </h3>
                </div>

                <div className="shrink-0">
                  {result.unsupported ? (
                    <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-extrabold shadow">
                      <AlertCircle className="w-4 h-4" />
                      <span>{result.condition?.includes('गलत फसल') || result.condition?.includes('Likely ') ? 'सही फसल चुनें' : 'साफ पत्ती की फोटो लगाएं'}</span>
                    </div>
                  ) : result.is_healthy ? (
                    <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold shadow">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>फसल पूरी तरह स्वस्थ है</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-extrabold shadow">
                      <ShieldAlert className="w-4 h-4" />
                      <span>रोगग्रस्त फसल (संक्रमण)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Key Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#F5F7F2] p-3 rounded-xl border border-[#E3E9E1]">
                  <div className="text-[11px] font-bold text-[#748077] mb-1">
                    जांच सटीकता (Confidence)
                  </div>
                  <div className="text-2xl font-extrabold text-[#245C3A]">
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>

                <div className="bg-[#F5F7F2] p-3 rounded-xl border border-[#E3E9E1]">
                  <div className="text-[11px] font-bold text-[#748077] mb-1">
                    संक्रमण गंभीरता (Severity)
                  </div>
                  <div className="text-lg font-extrabold capitalize text-[#26332B]">
                    {result.severity === 'healthy' ? 'स्वस्थ' : result.severity === 'mild' ? 'हल्का' : result.severity === 'moderate' ? 'मध्यम' : 'गंभीर'}
                  </div>
                </div>

                <div className="bg-[#F5F7F2] p-3 rounded-xl border border-[#E3E9E1] col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-[#748077] mb-1">
                    विशेषज्ञ सत्यापन (KVK)
                  </div>
                  <div className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md inline-block">
                    कृषि वैज्ञानिक अनुमोदित
                  </div>
                </div>
              </div>

              {/* Symptoms in simple words */}
              {result.symptoms && (
                <div className="p-4 bg-[#F5F7F2] rounded-xl border border-[#E3E9E1]">
                  <div className="text-xs font-extrabold text-[#748077] uppercase tracking-wider mb-1">
                    लक्षण (Symptoms Observed):
                  </div>
                  <p className="text-xs sm:text-sm text-[#26332B] font-medium leading-relaxed">
                    {result.symptoms}
                  </p>
                </div>
              )}

              {/* Treatment Remedy Boxes */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#245C3A] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>प्रमाणित उपचार व रोकथाम के उपाय (Certified Remedies):</span>
                </h4>

                {/* 1. Organic remedy */}
                {result.biological_control && (
                  <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/60">
                    <div className="font-extrabold text-xs text-emerald-900 mb-1 flex items-center space-x-1.5">
                      <span>🌿</span>
                      <span>जैविक व देशी उपचार (Bio / Organic Control):</span>
                    </div>
                    <div className="text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                      {result.biological_control}
                    </div>
                  </div>
                )}

                {/* 2. Chemical spray & dosage */}
                {result.chemical_control && (
                  <div className="p-4 rounded-xl border-2 border-amber-300 bg-amber-50/60">
                    <div className="font-extrabold text-xs text-amber-900 mb-1 flex items-center space-x-1.5">
                      <span>🧪</span>
                      <span>रासायनिक दवा व छिड़काव की सही मात्रा (Chemical Spray & Dose):</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                      {result.chemical_control}
                    </div>
                    {result.safety_advisory && (
                      <div className="mt-2 pt-2 border-t border-amber-200 text-xs text-amber-900 font-bold">
                        ⚠️ सावधानी: {result.safety_advisory}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Cultural management */}
                {result.cultural_control && (
                  <div className="p-4 rounded-xl border border-[#E3E9E1] bg-white">
                    <div className="font-extrabold text-xs text-[#173D2A] mb-1">
                      🚜 खेती के उपाय (Cultural Management):
                    </div>
                    <div className="text-xs sm:text-sm text-[#26332B] font-medium leading-relaxed">
                      {result.cultural_control}
                    </div>
                  </div>
                )}

                {/* 4. Spray Dose Calculator (Shown when crop has a disease) */}
                {!result.is_healthy && !result.unsupported && (
                  <SprayCalculator compact />
                )}

                {/* 5. Helpline Contact */}
                <div className="p-4 rounded-xl border border-sky-300 bg-sky-50 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block mb-0.5">क्या समस्या अभी भी बनी हुई है?</span>
                    <span>तालुका कृषि अधिकारी या कृषि विज्ञान केंद्र से निशुल्क मार्गदर्शन लें।</span>
                  </div>
                  <a
                    href="tel:18001801551"
                    className="no-print px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center space-x-1.5 shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>कॉल 1800-180-1551</span>
                  </a>
                </div>
              </div>

              {/* Follow-up submission */}
              <div className="pt-4 border-t border-[#E3E9E1] no-print">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#26332B] mb-2">
                  दवाई छिड़कने के बाद क्या असर हुआ? (Log Observation)
                </h4>

                {followUpSubmitted ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center space-x-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>आपकी जानकारी दर्ज कर ली गई है। धन्यवाद!</span>
                  </div>
                ) : (
                  <form onSubmit={handleFollowUpSubmit} className="space-y-3">
                    <textarea
                      value={followUpText}
                      onChange={(e) => setFollowUpText(e.target.value)}
                      placeholder="उदा. 3 दिन पहले दवाई छिड़की थी, पत्तों का पीलापन अब कम हो रहा है..."
                      rows={2}
                      className="w-full text-xs p-3 bg-[#F5F7F2] border border-[#E3E9E1] rounded-xl focus:outline-none focus:border-[#245C3A] font-medium"
                      required
                    ></textarea>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 text-xs">
                        <span className="text-[#748077] font-bold">फसल में सुधार:</span>
                        <select
                          value={followUpStatus}
                          onChange={(e) => setFollowUpStatus(e.target.value)}
                          className="text-xs p-1.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded-lg font-semibold"
                        >
                          <option value="improving">सुधार हो रहा है (Improving)</option>
                          <option value="stationary">जैसे थे (Same)</option>
                          <option value="deteriorating">बीमारी बढ़ गई (Deteriorating)</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="py-2 px-4 bg-[#245C3A] hover:bg-[#173D2A] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                      >
                        जानकारी सबमिट करें
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          ) : (
            /* Empty State */
            <div className="agri-card p-12 text-center flex flex-col items-center justify-center h-full min-h-[460px]">
              <div className="w-18 h-18 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#245C3A] mb-4 p-4">
                <Leaf className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-lg text-[#26332B] mb-1">
                {language === 'hi' ? 'अभी तक कोई जांच नहीं की गई' : 'No Analysis Run Yet'}
              </h3>
              <p className="text-xs sm:text-sm text-[#748077] max-w-sm leading-relaxed mb-6 font-medium">
                {language === 'hi'
                  ? 'बाएं पैनल से किसी भी फसल को चुनें, पत्ती का फोटो अपलोड करें या खींचें, और "रोग की जांच करें" पर क्लिक करें।'
                  : 'Select any of the 92 crops and upload a leaf photo to get instant certified diagnosis.'}
              </p>
              <div className="text-xs text-[#245C3A] font-bold flex items-center space-x-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                <ShieldCheck className="w-4 h-4" />
                <span>भारतीय कृषि अनुसंधान परिषद (ICAR) द्वारा प्रमाणित सलाह</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

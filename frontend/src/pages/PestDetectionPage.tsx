import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { api } from '../services/api';
import { 
  Bug, 
  Upload, 
  Camera, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Target, 
  Eye, 
  Info,
  ShieldAlert,
  ArrowRight,
  PhoneCall,
  ShieldCheck,
  Volume2,
  VolumeX,
  Printer,
  Share2
} from 'lucide-react';
import { SprayCalculator } from '../components/SprayCalculator';

interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  label: string;
  confidence: number;
}

export const PestDetectionPage: React.FC = () => {
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [allCrops, setAllCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('cotton');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState<boolean>(false);

  useEffect(() => {
    api.getCrops()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllCrops(data);
        }
      })
      .catch(console.error);
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Quick Chips for Popular Indian Crops
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
    { id: 'brinjal', name: language === 'hi' ? 'बैंगन' : language === 'mr' ? 'वांगी' : 'Brinjal', icon: '🍆' },
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

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const loadSamplePest = async (sampleCrop: string) => {
    setSelectedCrop(sampleCrop);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const sampleUrl = sampleCrop === 'cotton' 
        ? '/static/samples/cotton_bacterial_blight.jpg' 
        : '/static/samples/maize_common_rust.jpg';
      const response = await fetch(sampleUrl);
      const blob = await response.blob();
      const file = new File([blob], `${sampleCrop}_pest_specimen.jpg`, { type: 'image/jpeg' });
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } catch (err: any) {
      setError('Failed to load sample image.');
    } finally {
      setLoading(false);
    }
  };

  const handleDetect = async () => {
    if (!imageFile) {
      setError(language === 'hi' ? 'कृपया पहले कीट या ट्रैप का फोटो अपलोड करें।' : 'Please select or upload a pest/trap photograph.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('crop_hint', selectedCrop);

    try {
      const res = await api.detectPests(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Error executing spatial pest detection.');
    } finally {
      setLoading(false);
    }
  };

  const handleShareWhatsAppPest = () => {
    if (!result) return;
    const msg = [
      `*कृषि रक्षक (CropGuard AI) - कीट पहचान रिपोर्ट*`,
      `फसल: ${result.crop_affected}`,
      `कीट: ${result.pest_category}`,
      `गिनती: ${result.total_count} कीट`,
      result.biological_recommendation ? `🌿 जैविक उपाय: ${result.biological_recommendation}` : '',
      result.chemical_recommendation ? `🧪 कीटनाशक दवा: ${result.chemical_recommendation}` : '',
      `📞 टोल-फ्री किसान हेल्पलाइन: 1800-180-1551`
    ]
      .filter(Boolean)
      .join('\n');
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const handlePrintPest = () => {
    window.print();
  };

  const toggleSpeakPest = () => {
    if (!('speechSynthesis' in window) || !result) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const textParts = [
      `${result.crop_affected || ''}. ${result.pest_category || ''}.`,
      typeof result.total_count === 'number' ? `Detected ${result.total_count} pests.` : '',
      result.biological_recommendation ? `Organic remedy: ${result.biological_recommendation}.` : '',
      result.chemical_recommendation ? `Spray advice: ${result.chemical_recommendation}.` : ''
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
      <div className="no-print bg-white border border-slate-300 border-l-4 border-l-[#D97706] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#0F2942] text-white text-[11px] font-bold px-3 py-1 rounded mb-2">
            <Bug className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>कृषि विभाग कीट जांच सेवा • 92 भारतीय फसलें शामिल</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942] mb-1">
            {language === 'hi' ? 'कीट पहचान व नियंत्रण (Pest Identification)' : language === 'mr' ? 'कीड ओळख व नियंत्रण केंद्र (Pest Identification)' : 'Pest Detection & Control Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-semibold">
            {language === 'hi'
              ? 'कीट या ट्रैप का फोटो लगाएं और तुरंत कीट की पहचान व सुरक्षित दवा का नाम पाएं।'
              : language === 'mr'
              ? 'कीड किंवा ट्रॅपचा फोटो अपलोड करा आणि त्वरित किडीचे नाव व उपाय मिळवा.'
              : 'Upload a crop pest or trap photo to identify pests, count specimens, and get safe spray advice.'}
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
        
        {/* Left Column: Crop + Image Upload */}
        <div className="lg:col-span-5 space-y-6 no-print">
          <div className="agri-card p-6 space-y-5">
            
            {/* Step 1: Select ANY Crop */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-extrabold text-[#26332B] flex items-center space-x-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#245C3A] text-white flex items-center justify-center text-xs">1</span>
                  <span>फसल चुनें (Select Crop)</span>
                </label>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  92 फसलें उपलब्ध
                </span>
              </div>

              {/* Popular Crop Quick Chips */}
              <div className="text-[11px] font-bold text-[#748077] mb-1.5">
                लोकप्रिय फसलें (Quick Chips):
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

              {/* All 92 Crops Categorized Dropdown */}
              <div className="relative">
                <label className="block text-[11px] font-bold text-[#748077] mb-1">
                  या सभी 92 फसलों में से चुनें:
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

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-semibold text-amber-900 leading-relaxed">
              केवल फसल की पत्ती, कीट या फेरोमोन/येलो ट्रैप की साफ फोटो डालें — दीवार, कपड़ा, स्क्रीनशॉट या गैर-फसली चीज़ें अस्वीकार कर दी जाएंगी।
            </div>

            {/* Step 2: Upload Pest Photo */}
            <div>
              <label className="text-sm font-extrabold text-[#26332B] flex items-center space-x-1.5 mb-2.5">
                <span className="w-6 h-6 rounded-full bg-[#245C3A] text-white flex items-center justify-center text-xs">2</span>
                <span>कीट या ट्रैप का फोटो लगाएं (Upload Photo)</span>
              </label>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#6C9468] hover:border-[#245C3A] bg-emerald-50/30 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-[#245C3A] flex items-center justify-center mx-auto mb-3">
                    <Bug className="w-7 h-7" />
                  </div>
                  <p className="text-xs font-bold text-[#26332B] mb-1">
                    ट्रैप शीट, पत्ती या कीट का फोटो अपलोड करें
                  </p>
                  <p className="text-[11px] text-[#748077] mb-4">
                    फेरोमोन ट्रैप, लाइट ट्रैप या पत्ती पर बैठा कीड़ा
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
                      <span>फ़ाइल चुनें</span>
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
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
                    alt="Pest specimen"
                    className="w-full h-64 object-contain bg-black/40"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 p-2 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors shadow"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sample test buttons */}
              <div className="mt-3 pt-3 border-t border-[#E3E9E1]">
                <div className="text-[11px] font-bold text-[#748077] mb-2">
                  या तैयार नमूनों से जांचें (Instant Samples):
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => loadSamplePest('cotton')}
                    className="p-2 text-left border border-[#E3E9E1] rounded-lg hover:border-[#245C3A] hover:bg-emerald-50/60 font-semibold text-[11px] text-[#26332B] flex items-center space-x-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="truncate">कपास गुलाबी सुंडी</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSamplePest('maize')}
                    className="p-2 text-left border border-[#E3E9E1] rounded-lg hover:border-[#245C3A] hover:bg-emerald-50/60 font-semibold text-[11px] text-[#26332B] flex items-center space-x-1.5"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="truncate">मक्का फॉल आर्मीवर्म</span>
                  </button>
                </div>
              </div>

              {/* Big Analyze Button */}
              <button
                onClick={handleDetect}
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
                    <span>कीटों की पहचान हो रही है...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 text-emerald-300" />
                    <span>कीट पहचान करें (Detect Pests Now)</span>
                  </>
                )}
              </button>

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Spatial Detection & Remedies */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="agri-card p-6 space-y-5">

              {/* Printable Official Slip Header */}
              <div className="hidden print-only-header border-b-2 border-[#0F2942] pb-3 mb-3">
                <div className="text-xs font-bold uppercase text-[#14532D]">
                  भारत सरकार | कृषि एवं किसान कल्याण विभाग • ICAR प्रमाणित प्रणाली
                </div>
                <div className="text-xl font-extrabold text-[#0F2942]">
                  कृषि रक्षक (CropGuard AI) — आधिकारिक कीट पहचान पर्ची
                </div>
                <div className="text-xs text-slate-600">
                  फसल: {result.crop_affected} | दिनांक: {new Date().toLocaleDateString('en-IN')} | किसान कॉल सेंटर: 1800-180-1551
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 no-print">
                <span className="text-xs font-extrabold text-[#0F2942] uppercase tracking-wider">
                  कीट जांच परिणाम
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeakPest}
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
                    onClick={handlePrintPest}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-[#0F2942] border border-slate-300 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>प्रिंट / PDF पर्ची</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsAppPest}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold bg-[#16A34A] hover:bg-[#15803D] text-white shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp भेजें</span>
                  </button>
                </div>
              </div>

              {/* Unsupported / Blank Image Warning */}
              {result.unsupported && (
                <div className="p-4 bg-amber-50 border-2 border-amber-400 rounded-xl text-xs text-amber-950 font-bold flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{result.advisory_summary || 'कृपया अच्छी रोशनी में कीट, पत्ती या ट्रैप की साफ तस्वीर अपलोड करें।'}</span>
                </div>
              )}
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E3E9E1] gap-2">
                <div>
                  <div className="text-xs font-extrabold text-[#245C3A] uppercase tracking-wider mb-0.5">
                    {result.crop_affected} • कीट पहचान परिणाम
                  </div>
                  <h3 className="text-xl font-extrabold text-[#26332B]">
                    {result.pest_category}
                  </h3>
                  <div className="text-xs italic text-[#748077]">
                    {result.scientific_name}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">

                  {result.status === 'above_etl' ? (
                    <div className="px-3.5 py-1.5 bg-red-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow">
                      <ShieldAlert className="w-4 h-4" />
                      <span>आर्थिक सीमा पार (तुरंत स्प्रे करें)</span>
                    </div>
                  ) : result.status === 'at_etl' ? (
                    <div className="px-3.5 py-1.5 bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow">
                      <AlertTriangle className="w-4 h-4" />
                      <span>सीमा पर (निगरानी रखें)</span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1.5 shadow">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>सुरक्षित (आर्थिक सीमा से कम)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Spatial Bounding Box Visualization */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#245C3A] bg-black max-h-[360px] flex items-center justify-center shadow-inner">
                <img
                  src={imagePreview || ''}
                  alt="Spatial detection canvas"
                  className="w-full max-h-[360px] object-contain block"
                />

                {/* Render Bounding Boxes */}
                {result.bounding_boxes && result.bounding_boxes.map((box: BoundingBox, idx: number) => {
                  const top = `${box.ymin * 100}%`;
                  const left = `${box.xmin * 100}%`;
                  const height = `${(box.ymax - box.ymin) * 100}%`;
                  const width = `${(box.xmax - box.xmin) * 100}%`;

                  return (
                    <div
                      key={idx}
                      style={{ top, left, width, height }}
                      className="absolute border-2 border-emerald-400 bg-emerald-500/25 pointer-events-none transition-all shadow"
                    >
                      <span className="absolute -top-5 left-0 bg-[#173D2A] text-emerald-300 font-mono text-[10px] px-1.5 py-0.5 rounded font-extrabold whitespace-nowrap shadow border border-emerald-500/50">
                        #{idx + 1} {box.label} ({Math.round(box.confidence * 100)}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick Counts Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-[#F5F7F2] p-3 rounded-xl border border-[#E3E9E1]">
                  <div className="text-[11px] font-bold text-[#748077] mb-1">
                    पहचाने गए कीट (Count)
                  </div>
                  <div className="text-2xl font-extrabold text-[#245C3A]">
                    {result.total_count} कीट पाए गए
                  </div>
                </div>

                <div className="bg-[#F5F7F2] p-3 rounded-xl border border-[#E3E9E1]">
                  <div className="text-[11px] font-bold text-[#748077] mb-1">
                    एआई विश्वसनीयता
                  </div>
                  <div className="text-2xl font-extrabold text-[#26332B]">
                    {Math.round(result.confidence * 100)}%
                  </div>
                </div>

                <div className="bg-[#F5F7F2] p-3 rounded-xl border border-[#E3E9E1] col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-bold text-[#748077] mb-1">
                    कार्रवाई की स्थिति
                  </div>
                  <div className="text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-1 rounded-md inline-block">
                    {result.status === 'above_etl' ? 'दवा का छिड़काव आवश्यक' : 'नियमित निगरानी'}
                  </div>
                </div>
              </div>

              {/* Economic Threshold Level definition */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="font-extrabold text-amber-950 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>आर्थिक नुकसान सीमा (Economic Threshold Level - ETL):</span>
                </div>
                <p className="text-amber-900 leading-relaxed font-semibold text-xs">
                  {result.economic_threshold}
                </p>
              </div>

              {/* Remedies & Spray Advice */}
              <div className="space-y-3">
                <h4 className="text-sm font-extrabold text-[#245C3A] flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>कीट रोकथाम व उपचार (Control Recommendations):</span>
                </h4>

                {/* Biological */}
                {result.biological_recommendation && (
                  <div className="p-4 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl text-xs text-emerald-950 font-medium">
                    <strong className="text-emerald-900 font-extrabold block mb-1">🌿 जैविक व प्राकृतिक नियंत्रण (Biological):</strong>
                    {result.biological_recommendation}
                  </div>
                )}

                {/* Chemical */}
                {result.chemical_recommendation && (
                  <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-xl text-xs text-amber-950 font-medium">
                    <strong className="text-amber-900 font-extrabold block mb-1">🧪 अनुशंसित कीटनाशक दवा व मात्रा (Chemical Spray):</strong>
                    {result.chemical_recommendation}
                  </div>
                )}

                {/* Spray Calculator */}
                {result.total_count > 0 && !result.unsupported && (
                  <SprayCalculator compact defaultDosePerLiter={2.0} />
                )}

                {/* Helpline Call */}
                <div className="p-4 rounded-xl border border-sky-300 bg-sky-50 text-xs text-sky-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold block mb-0.5">कीटों का प्रकोप अधिक है?</span>
                    <span>कृषि अधिकारी या KVK वैज्ञानिक से तुरंत निशुल्क मार्गदर्शन लें।</span>
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

            </div>
          ) : (
            <div className="agri-card p-12 text-center flex flex-col items-center justify-center h-full min-h-[460px]">
              <div className="w-18 h-18 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#245C3A] mb-4 p-4">
                <Bug className="w-10 h-10" />
              </div>
              <h3 className="font-extrabold text-lg text-[#26332B] mb-1">
                कीट पहचान के लिए तैयार
              </h3>
              <p className="text-xs sm:text-sm text-[#748077] max-w-sm leading-relaxed mb-6 font-medium">
                बाएं पैनल से किसी भी फसल को चुनें, ट्रैप शीट या कीट की फोटो अपलोड करें और "कीट पहचान करें" पर क्लिक करें।
              </p>
              <div className="text-xs text-[#245C3A] font-bold flex items-center space-x-1.5 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                <Target className="w-4 h-4" />
                <span>गुलाबी सुंडी, फॉल आर्मीवर्म, सफेद मक्खी, तना छेदक, माहू (एफिड) आदि 92+ फसलों के कीट</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

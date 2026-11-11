import React from 'react';
import { Globe, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const LanguageWelcomeModal: React.FC = () => {
  const { needsLanguagePrompt, dismissLanguagePrompt } = useLanguage();

  if (!needsLanguagePrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print">
      <div className="bg-white border-2 border-[#0F2942] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        <div className="tricolour-strip w-full" />
        <div className="bg-[#0F2942] text-white p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-white/15 border border-amber-300 flex items-center justify-center mx-auto mb-2">
            <Globe className="w-6 h-6 text-[#FF9933]" />
          </div>
          <h2 className="text-lg font-extrabold">अपनी भाषा चुनें / Select Language</h2>
          <p className="text-xs text-slate-300 mt-1">
            कृषि रक्षक (CropGuard AI) सरकारी किसान सेवा पोर्टल
          </p>
        </div>

        <div className="p-5 space-y-3 bg-[#F4F6F4]">
          <button
            type="button"
            onClick={() => dismissLanguagePrompt('hi')}
            className="w-full p-4 bg-white hover:bg-green-50 border-2 border-[#14532D] rounded-xl flex items-center justify-between shadow-sm transition-all"
          >
            <div className="text-left">
              <div className="font-extrabold text-base text-[#0F2942]">हिंदी (Hindi)</div>
              <div className="text-xs text-slate-600">सरल हिंदी भाषा में जारी रखें</div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-[#14532D]" />
          </button>

          <button
            type="button"
            onClick={() => dismissLanguagePrompt('mr')}
            className="w-full p-4 bg-white hover:bg-amber-50 border-2 border-slate-300 hover:border-[#FF9933] rounded-xl flex items-center justify-between shadow-sm transition-all"
          >
            <div className="text-left">
              <div className="font-extrabold text-base text-[#0F2942]">मराठी (Marathi)</div>
              <div className="text-xs text-slate-600">सोप्या मराठी भाषेत पुढे जा</div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg">निवडा</span>
          </button>

          <button
            type="button"
            onClick={() => dismissLanguagePrompt('en')}
            className="w-full p-4 bg-white hover:bg-slate-50 border-2 border-slate-300 hover:border-[#0F2942] rounded-xl flex items-center justify-between shadow-sm transition-all"
          >
            <div className="text-left">
              <div className="font-extrabold text-base text-[#0F2942]">English</div>
              <div className="text-xs text-slate-600">Continue in English</div>
            </div>
            <span className="text-xs font-extrabold px-2.5 py-1 bg-slate-100 text-[#0F2942] rounded-lg">Select</span>
          </button>

          <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#14532D]" />
            <span>आप ऊपर मेनू बार से कभी भी भाषा बदल सकते हैं</span>
          </div>
        </div>
      </div>
    </div>
  );
};


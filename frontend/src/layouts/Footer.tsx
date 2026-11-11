import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0F2942] text-slate-200 border-t-4 border-[#14532D] text-sm mt-auto">
      {/* Main Footer Columns */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Department Ownership */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-white text-[#0F2942] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#14532D]" />
              </div>
              <div>
                <div className="font-extrabold text-white text-base leading-tight">
                  कृषि रक्षक (CropGuard AI)
                </div>
                <div className="text-[11px] text-amber-300 font-semibold">
                  कृषि एवं किसान कल्याण विभाग
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Department of Agriculture & Farmers Welfare — Integrated Crop Disease & Pest Advisory System for Indian Farmers (92 Crops Covered).
            </p>
            <div className="inline-flex items-center space-x-1.5 text-[11px] bg-slate-800 border border-slate-600 px-2.5 py-1 rounded text-green-300 font-semibold">
              <span>Digital India • Krishi Vigyan Kendra</span>
            </div>
          </div>

          {/* Col 2: Quick Citizen Links */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-700 pb-1.5">
              किसान सेवाएं (Farmer Services)
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link to="/detect" className="hover:text-amber-300 flex items-center space-x-1.5">
                  <span>&rsaquo;</span>
                  <span>फसल रोग जांच (Disease Detection)</span>
                </Link>
              </li>
              <li>
                <Link to="/pests" className="hover:text-amber-300 flex items-center space-x-1.5">
                  <span>&rsaquo;</span>
                  <span>कीट व इल्ली पहचान (Pest Check)</span>
                </Link>
              </li>
              <li>
                <Link to="/crops" className="hover:text-amber-300 flex items-center space-x-1.5">
                  <span>&rsaquo;</span>
                  <span>सभी 92 फसलों की सूची (All Crops)</span>
                </Link>
              </li>
              <li>
                <Link to="/risk" className="hover:text-amber-300 flex items-center space-x-1.5">
                  <span>&rsaquo;</span>
                  <span>मौसम एवं खतरा अलर्ट (Weather Risk)</span>
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-amber-300 flex items-center space-x-1.5">
                  <span>&rsaquo;</span>
                  <span>सरकारी योजनाएं व मंडी भाव (Schemes &amp; MSP)</span>
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-amber-300 flex items-center space-x-1.5">
                  <span>&rsaquo;</span>
                  <span>मेरी पुरानी जांच रिपोर्ट (My Reports)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Agricultural Universities */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-700 pb-1.5">
              कृषि विश्वविद्यालय (Knowledge Partners)
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-start space-x-1.5">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                <span>Indian Council of Agricultural Research (ICAR)</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                <span>Mahatma Phule Krishi Vidyapeeth (MPKV), Rahuri</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                <span>Dr. Panjabrao Deshmukh Krishi Vidyapeeth (PDKV), Akola</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 text-amber-400 shrink-0" />
                <span>Vasantrao Naik Marathwada Krishi Vidyapeeth, Parbhani</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Official Helpline */}
          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3 border-b border-slate-700 pb-1.5">
              टोल-फ्री हेल्पलाइन (Kisan Helpline)
            </h4>
            <div className="bg-slate-800/80 p-4 rounded-lg border border-slate-600 space-y-2">
              <div className="text-xs text-amber-300 font-bold">किसान कॉल सेंटर (Kisan Call Centre):</div>
              <a
                href="tel:18001801551"
                className="flex items-center space-x-2 text-xl font-extrabold text-white hover:text-amber-300 transition-colors"
              >
                <PhoneCall className="w-5 h-5 text-[#FF9933]" />
                <span>1800-180-1551</span>
              </a>
              <div className="text-[11px] text-slate-300">
                सुबह 06:00 बजे से रात 10:00 बजे तक (सभी दिन निशुल्क सेवा)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Official GIGW Footer Bar */}
      <div className="bg-[#081A2C] border-t border-slate-700 py-4 px-4 text-xs text-slate-400">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-center md:text-left">
          <div>
            Website Content Managed by <strong className="text-slate-200">Department of Agriculture</strong> | Government of Maharashtra &amp; Ministry of Agriculture &amp; Farmers Welfare.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px]">
            <span>Last Updated: 11 Nov 2026</span>
            <span>|</span>
            <span>GIGW Accessible Portal</span>
            <span>|</span>
            <span className="text-emerald-300 font-semibold">ICAR Certified Protocols</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

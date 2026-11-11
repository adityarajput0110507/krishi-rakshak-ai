import React, { useState } from 'react';
import { Calculator, Droplets, Sprout } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface SprayCalculatorProps {
  compact?: boolean;
  defaultDosePerLiter?: number;
  unitLabel?: string;
}

export const SprayCalculator: React.FC<SprayCalculatorProps> = ({
  compact = false,
  defaultDosePerLiter = 2.5,
  unitLabel = 'ग्राम / ml'
}) => {
  const { language } = useLanguage();
  const [acres, setAcres] = useState<number>(1);
  const [pumpSize, setPumpSize] = useState<number>(15);
  const [dosePerLiter, setDosePerLiter] = useState<number>(defaultDosePerLiter);

  // Standard ICAR foliar spray recommendation: ~150 Liters water per acre
  const totalWaterLiters = Math.round(acres * 150);
  const totalPumps = Math.max(1, Math.round(totalWaterLiters / pumpSize));
  const dosePerPump = Number((dosePerLiter * pumpSize).toFixed(1));
  const totalMedicine = Math.round(totalWaterLiters * dosePerLiter);

  return (
    <div className={`rounded-xl border-2 border-[#0F2942]/20 bg-slate-50 ${compact ? 'p-4' : 'p-6'} space-y-4 no-print`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F2942] text-amber-300 flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#0F2942]">
              {language === 'hi'
                ? 'दवाई व पानी मात्रा कैलकुलेटर (Spray Dose Calculator)'
                : language === 'mr'
                ? 'औषध व पाणी प्रमाण कॅल्क्युलेटर (Spray Calculator)'
                : 'Spray Dose & Water Calculator'}
            </h4>
            <p className="text-[11px] text-slate-600 font-medium">
              {language === 'hi'
                ? 'अपनी जमीन (एकड़) चुनें — पंप के हिसाब से सही मात्रा जानें'
                : language === 'mr'
                ? 'तुमची शेती (एकर) निवडा — पंपाप्रमाणे अचूक प्रमाण पहा'
                : 'Select acres & pump size to calculate exact water & dose'}
            </p>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Acres */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-300">
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center space-x-1">
            <Sprout className="w-3.5 h-3.5 text-[#14532D]" />
            <span>जमीन (Acres):</span>
          </label>
          <div className="flex items-center space-x-1.5">
            {[0.5, 1, 2, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAcres(val)}
                className={`px-2 py-1 rounded text-xs font-extrabold border transition-colors ${
                  acres === val
                    ? 'bg-[#14532D] text-white border-[#14532D]'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-green-50'
                }`}
              >
                {val}
              </button>
            ))}
            <input
              type="number"
              min="0.25"
              max="100"
              step="0.25"
              value={acres}
              onChange={(e) => setAcres(Math.max(0.25, Number(e.target.value) || 1))}
              className="w-14 text-xs font-extrabold p-1 border border-slate-300 rounded text-center"
            />
          </div>
        </div>

        {/* Pump Capacity */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-300">
          <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center space-x-1">
            <Droplets className="w-3.5 h-3.5 text-sky-600" />
            <span>पंप क्षमता (Pump Size):</span>
          </label>
          <select
            value={pumpSize}
            onChange={(e) => setPumpSize(Number(e.target.value))}
            className="w-full text-xs font-bold p-1.5 bg-slate-50 border border-slate-300 rounded text-[#0F2942]"
          >
            <option value={15}>15 लीटर पंप (Knapsack)</option>
            <option value={16}>16 लीटर बैटरी पंप</option>
            <option value={20}>20 लीटर पावर स्प्रे</option>
            <option value={200}>200 लीटर बैरल (Tractor)</option>
          </select>
        </div>

        {/* Dose per Liter */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-300">
          <label className="block text-[11px] font-bold text-slate-600 mb-1">
            मात्रा प्रति लीटर (Dose / L):
          </label>
          <select
            value={dosePerLiter}
            onChange={(e) => setDosePerLiter(Number(e.target.value))}
            className="w-full text-xs font-bold p-1.5 bg-slate-50 border border-slate-300 rounded text-[#0F2942]"
          >
            <option value={1.5}>1.5 ग्राम / ml प्रति लीटर (हल्का)</option>
            <option value={2.0}>2.0 ग्राम / ml प्रति लीटर (सामान्य)</option>
            <option value={2.5}>2.5 ग्राम / ml प्रति लीटर (मध्यम)</option>
            <option value={3.0}>3.0 ग्राम / ml प्रति लीटर (गंभीर)</option>
            <option value={5.0}>5.0 ml प्रति लीटर (नीम तेल / जैविक)</option>
          </select>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-lg border border-slate-300 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">कुल पानी (Water)</div>
          <div className="text-lg font-extrabold text-sky-700 mt-0.5">{totalWaterLiters} L</div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-300 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase">कुल पंप ({pumpSize}L)</div>
          <div className="text-lg font-extrabold text-[#0F2942] mt-0.5">{totalPumps} पंप</div>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-300 text-center">
          <div className="text-[10px] font-bold text-amber-900 uppercase">1 पंप में दवा</div>
          <div className="text-lg font-extrabold text-amber-950 mt-0.5">{dosePerPump} <span className="text-xs">{unitLabel}</span></div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg border border-green-300 text-center">
          <div className="text-[10px] font-bold text-[#14532D] uppercase">कुल दवा (Total)</div>
          <div className="text-lg font-extrabold text-[#14532D] mt-0.5">{totalMedicine} <span className="text-xs">{unitLabel}</span></div>
        </div>
      </div>
    </div>
  );
};


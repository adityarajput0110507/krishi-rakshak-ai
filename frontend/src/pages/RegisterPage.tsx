import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, UserPlus, AlertCircle, MapPin } from 'lucide-react';
import { api } from '../services/api';

export const RegisterPage: React.FC = () => {
  const { t } = useLanguage();
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Location
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [state, setState] = useState<string>('Maharashtra');
  const [district, setDistrict] = useState<string>('Nashik');
  const [taluka, setTaluka] = useState<string>('Niphad');
  const [village, setVillage] = useState<string>('Pimpalgaon Baswant');
  const [landArea, setLandArea] = useState<number>(3.5);
  const [crop, setCrop] = useState<string>('cotton');
  const [prefLang, setPrefLang] = useState<string>('mr');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getStates()
      .then((data) => {
        setStates(data);
        if (data.length > 0 && !data.includes(state)) {
          setState(data[0]);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (state) {
      api.getDistrictsForState(state)
        .then((distList) => {
          setDistricts(distList);
          if (distList.length > 0) {
            setDistrict(distList[0]);
          }
        })
        .catch(console.error);
    }
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({
        name,
        phone,
        password,
        role: 'farmer',
        farmer_profile: {
          state,
          district,
          taluka,
          village,
          land_area_acres: landArea,
          primary_crop: crop,
          preferred_language: prefLang
        }
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#245C3A] text-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-sm border border-[#6C9468]/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-[#26332B]">
            {t.auth.registerFarmer}
          </h2>
          <p className="text-xs text-[#748077] mt-1">
            Create an All-India farmer profile to receive regional weather advisories, disease risk forecasting, and AI plant health diagnostics.
          </p>
        </div>

        <div className="agri-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26332B] mb-1">
                {t.auth.name}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Vitthal Shinde"
                className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#26332B] mb-1">
                  {t.auth.phone}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9822011003"
                  className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#26332B] mb-1">
                  {t.auth.password}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  required
                />
              </div>
            </div>

            {/* Farm Profile Information */}
            <div className="pt-2 border-t border-[#E3E9E1]">
              <div className="text-xs font-bold uppercase tracking-wider text-[#245C3A] mb-3 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4" />
                <span>All-India Farm Location & Holding</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#748077] mb-1">
                    State / UT
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  >
                    {states.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#748077] mb-1">
                    District
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  >
                    {districts.map((dst) => (
                      <option key={dst} value={dst}>{dst}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#748077] mb-1">
                    {t.auth.taluka} / Tehsil
                  </label>
                  <input
                    type="text"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    placeholder="e.g. Niphad"
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#748077] mb-1">
                    {t.auth.village} / Locality
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Pimpalgaon"
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#748077] mb-1">
                    Primary Crop
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                  >
                    <option value="cotton">Cotton (कापूस)</option>
                    <option value="soybean">Soybean (सोयाबीन)</option>
                    <option value="rice">Rice (भात / धान)</option>
                    <option value="maize">Maize (मका)</option>
                    <option value="wheat">Wheat (गहू / गेहूं)</option>
                    <option value="sugarcane">Sugarcane (ऊस / गन्ना)</option>
                    <option value="grapes">Grapes (द्राक्षे / अंगूर)</option>
                    <option value="apple">Apple (सफरचंद / सेब)</option>
                    <option value="banana">Banana (केळी / केला)</option>
                    <option value="turmeric">Turmeric (हळद / हल्दी)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#748077] mb-1">
                    {t.auth.landArea}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="100"
                    value={landArea}
                    onChange={(e) => setLandArea(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs p-2 bg-[#F5F7F2] border border-[#E3E9E1] rounded"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#245C3A] hover:bg-[#173D2A] text-white text-xs font-semibold rounded shadow transition-colors flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? t.common.loading : t.auth.registerFarmer}</span>
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[#E3E9E1] text-center text-xs text-[#748077]">
            {t.auth.hasAccount}{' '}
            <Link to="/login" className="font-semibold text-[#245C3A] hover:underline">
              {t.nav.login}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

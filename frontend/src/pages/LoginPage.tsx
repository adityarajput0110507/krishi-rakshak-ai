import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck, LogIn, AlertCircle, UserCheck, Building2, Sprout } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(phone, password);
      // Retrieve stored role
      const storedRole = localStorage.getItem('cropguard_role');
      if (storedRole === 'admin') {
        navigate('/admin');
      } else if (storedRole === 'expert') {
        navigate('/expert');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid mobile number or credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#0F2942] border-2 border-[#FF9933] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-7 h-7 text-[#FF9933]" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#0F2942]">
            किसान / अधिकारी पोर्टल लॉगिन
          </h2>
          <p className="text-xs text-slate-600 font-semibold mt-1">
            कृषि रक्षक (CropGuard AI) • भारत एवं महाराष्ट्र शासन कृषि विभाग
          </p>
        </div>

        {/* Demo Roles Quick Fill */}
        <div className="agri-card p-3 bg-emerald-50/50 border border-emerald-200/80 space-y-2">
          <div className="text-[11px] font-bold text-[#173D2A] uppercase tracking-wider">
            Quick Fill Demo Accounts:
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickLogin('9822011003', 'farmer123')}
              className="p-1.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 font-medium text-[#173D2A] text-center"
            >
              🌱 Farmer (Nashik)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('9822011002', 'expert123')}
              className="p-1.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 font-medium text-[#173D2A] text-center"
            >
              🔬 KVK Expert
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('9822011001', 'admin123')}
              className="p-1.5 bg-white border border-emerald-300 rounded hover:bg-emerald-100 font-medium text-[#173D2A] text-center"
            >
              🏛️ Admin Officer
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="agri-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#26332B] mb-1">
                {t.auth.phone} / Email
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9822011003 or admin@cropguard.gov.in"
                className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-[#26332B]">
                  {t.auth.password}
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs p-2.5 bg-[#F5F7F2] border border-[#E3E9E1] rounded focus:outline-none focus:border-[#245C3A]"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#245C3A] hover:bg-[#173D2A] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.auth.loginSubmit}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#E3E9E1] text-center text-xs text-[#748077]">
            <span>{t.auth.noAccount} </span>
            <Link to="/register" className="text-[#245C3A] font-bold hover:underline">
              {t.auth.registerFarmer}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};


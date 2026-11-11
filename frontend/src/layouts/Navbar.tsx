import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { 
  Scan, 
  Bug, 
  AlertTriangle, 
  History, 
  BookOpen, 
  UserCheck, 
  Building2, 
  LogOut, 
  Menu, 
  X,
  Home,
  Compass,
  PhoneCall,
  Megaphone,
  Contrast,
  UserCircle,
  Landmark
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [highContrast, setHighContrast] = useState<boolean>(false);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-size-sm', 'font-size-md', 'font-size-lg');
    html.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: t.nav.home, path: '/', icon: Home, roles: ['all'] },
    { name: t.nav.scanCrop, path: '/detect', icon: Scan, roles: ['all'] },
    { name: t.nav.pestDetection, path: '/pests', icon: Bug, roles: ['all'] },
    { name: t.nav.exploreCrops, path: '/crops', icon: Compass, roles: ['all'] },
    { name: t.nav.riskAlerts, path: '/risk', icon: AlertTriangle, roles: ['all'] },
    { name: language === 'hi' ? 'योजनाएं व मंडी' : language === 'mr' ? 'योजना व बाजारभाव' : 'Schemes & Mandi', path: '/schemes', icon: Landmark, roles: ['all'] },
    { name: t.nav.history, path: '/history', icon: History, roles: ['all'] },
    { name: t.nav.advisory, path: '/advisory', icon: BookOpen, roles: ['all'] },
    { name: t.nav.expertPortal, path: '/expert', icon: UserCheck, roles: ['expert', 'admin'] },
    { name: t.nav.adminDashboard, path: '/admin', icon: Building2, roles: ['admin'] },
  ];

  const visibleLinks = navLinks.filter(link => {
    if (link.roles.includes('all')) return true;
    if (!role) return false;
    return link.roles.includes(role);
  });

  return (
    <header className="sticky top-0 z-50 shadow-md bg-white">
      {/* 1. National Tricolour Top Strip */}
      <div className="tricolour-strip w-full" aria-hidden="true" />

      {/* 2. GIGW Top Utility Strip (Govt of India Standard) */}
      <div className="bg-[#0F2942] text-slate-100 text-[11px] sm:text-xs border-b border-slate-700">
        <div className="container mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
          {/* Government Identity */}
          <div className="flex items-center space-x-2">
            {/* Simple India Flag Mini SVG */}
            <svg className="w-4 h-3 rounded-[1px] shrink-0 border border-white/20" viewBox="0 0 24 16" aria-hidden="true">
              <rect width="24" height="5.33" fill="#FF9933" />
              <rect y="5.33" width="24" height="5.34" fill="#FFFFFF" />
              <rect y="10.67" width="24" height="5.33" fill="#138808" />
              <circle cx="12" cy="8" r="1.8" fill="none" stroke="#000080" strokeWidth="0.7" />
            </svg>
            <span className="font-semibold tracking-wide text-white">
              भारत सरकार | महाराष्ट्र शासन
            </span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-200">
              {t.app.subtitle}
            </span>
          </div>

          {/* GIGW Accessibility & Language Controls */}
          <div className="flex items-center space-x-3">
            <a href="#main-content" className="hidden lg:inline hover:underline text-slate-300">
              Skip to Main Content
            </a>

            {/* Font Resize Controls */}
            <div className="hidden sm:flex items-center border-l border-r border-slate-600 px-2.5 space-x-1" aria-label="Text Size">
              <button
                type="button"
                onClick={() => setFontSize('sm')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${fontSize === 'sm' ? 'bg-white text-[#0F2942]' : 'text-slate-200 hover:bg-slate-700'}`}
                title="Small Text"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize('md')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${fontSize === 'md' ? 'bg-white text-[#0F2942]' : 'text-slate-200 hover:bg-slate-700'}`}
                title="Normal Text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('lg')}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${fontSize === 'lg' ? 'bg-white text-[#0F2942]' : 'text-slate-200 hover:bg-slate-700'}`}
                title="Large Text"
              >
                A+
              </button>
            </div>

            {/* Contrast Toggle */}
            <button
              type="button"
              onClick={() => setHighContrast(!highContrast)}
              className={`hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded border text-[11px] font-semibold transition-colors ${
                highContrast
                  ? 'bg-amber-400 text-black border-amber-300'
                  : 'border-slate-500 text-slate-200 hover:bg-slate-700'
              }`}
              title="Toggle High Contrast"
            >
              <Contrast className="w-3 h-3" />
              <span className="hidden md:inline">Contrast</span>
            </button>

            {/* Language Selector */}
            <div className="inline-flex items-center bg-slate-800 rounded border border-slate-600 p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  language === 'en' ? 'bg-[#FF9933] text-[#0F2942]' : 'text-slate-200 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  language === 'hi' ? 'bg-[#FF9933] text-[#0F2942]' : 'text-slate-200 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('mr')}
                className={`px-2 py-0.5 rounded-sm transition-colors ${
                  language === 'mr' ? 'bg-[#FF9933] text-[#0F2942]' : 'text-slate-200 hover:text-white'
                }`}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official White Department Masthead / Emblem Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Left: Official Portal Emblem & Name */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            {/* Government-style Crest Emblem (State Emblem & Agriculture Leaf Seal) */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F8FAFC] border-2 border-[#0F2942] flex items-center justify-center shrink-0 shadow-sm p-1.5">
              <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
                <circle cx="24" cy="24" r="21" fill="none" stroke="#14532D" strokeWidth="2" />
                <circle cx="24" cy="24" r="17" fill="none" stroke="#FF9933" strokeWidth="1" strokeDasharray="3 2" />
                {/* Ashoka / Chakra inspired wheel top */}
                <circle cx="24" cy="14" r="4.5" fill="none" stroke="#0F2942" strokeWidth="1.5" />
                <circle cx="24" cy="14" r="1.2" fill="#0F2942" />
                {/* Wheat / Leaf Stems */}
                <path d="M24 38 C24 26, 15 24, 13 18 C18 19, 23 23, 24 30 Z" fill="#14532D" />
                <path d="M24 38 C24 26, 33 24, 35 18 C30 19, 25 23, 24 30 Z" fill="#166534" />
                <path d="M24 39 L24 21" stroke="#0F2942" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-2xl text-[#0F2942] tracking-tight leading-none">
                  {t.app.title}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-green-100 text-green-900 border border-green-300">
                  GOVT PORTAL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-0.5">
                {t.app.tagline}
              </p>
            </div>
          </Link>

          {/* Right: Kisan Call Center + Partner Badges + User Account */}
          <div className="flex items-center space-x-3">
            {/* Toll-free Helpline */}
            <a
              href="tel:18001801551"
              className="hidden md:flex items-center space-x-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3.5 py-2 rounded-lg transition-colors"
              title="Toll-Free Farmer Helpline"
            >
              <div className="w-8 h-8 rounded-full bg-[#FF9933] text-white flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <div className="text-[10px] font-bold text-amber-900 uppercase">किसान कॉल सेंटर (निशुल्क)</div>
                <div className="text-sm font-extrabold text-[#0F2942]">1800-180-1551</div>
              </div>
            </a>

            {/* Auth / User Status */}
            {user ? (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to={role === 'admin' ? '/admin' : role === 'expert' ? '/expert' : '/dashboard'}
                  className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-[#0F2942] border border-slate-300 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-[#14532D]" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  title={t.nav.logout}
                  className="p-2 rounded-lg text-red-700 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-[#0F2942] border border-[#0F2942] hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-bold text-white bg-[#14532D] hover:bg-[#0f3f22] rounded-lg transition-colors shadow-sm"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#0F2942] border border-slate-300 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Primary Navigation Menu Bar (Official Agriculture Green) */}
      <nav className="hidden lg:block bg-[#14532D] text-white border-b border-green-900">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {visibleLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-3 text-sm font-bold flex items-center space-x-2 border-b-4 transition-colors ${
                    active
                      ? 'bg-[#0f3f22] text-white border-[#FF9933]'
                      : 'text-green-50 border-transparent hover:bg-[#196638] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-300" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="text-[11px] font-bold text-green-100 bg-green-900/60 px-2.5 py-1 rounded border border-green-600/50">
            ICAR • KVK Verified
          </div>
        </div>
      </nav>

      {/* 5. Official Public Notice / Announcement Bar */}
      <div className="bg-amber-50 border-b border-amber-200 text-amber-950 text-xs py-1.5 px-4">
        <div className="container mx-auto flex items-center space-x-2.5 overflow-hidden">
          <span className="inline-flex items-center space-x-1 bg-[#B91C1C] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0">
            <Megaphone className="w-3 h-3" />
            <span>सूचना / Notice</span>
          </span>
          <div className="truncate font-semibold text-slate-800">
            {language === 'hi'
              ? 'अब सभी 92 भारतीय फसलों के रोग और कीट की निशुल्क AI जांच उपलब्ध है। पत्ती की फोटो अपलोड कर तुरंत ICAR प्रमाणित उपाय जानें।'
              : language === 'mr'
              ? 'आता सर्व 92 भारतीय पिकांच्या रोग व किडींची मोफत तपासणी उपलब्ध आहे. पानाचा फोटो अपलोड करून त्वरित ICAR प्रमाणित उपाय पहा.'
              : 'Free AI crop disease & pest screening now available for all 92 Indian crops. Upload a leaf photo for instant ICAR-certified advice.'}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#14532D] text-white border-t border-green-800 px-4 py-3 space-y-1.5">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-sm font-bold flex items-center space-x-3 ${
                  active
                    ? 'bg-[#0f3f22] text-white border-l-4 border-[#FF9933]'
                    : 'text-green-50 hover:bg-[#196638]'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-300" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-green-700 flex flex-col space-y-2">
            <a
              href="tel:18001801551"
              className="flex items-center justify-center space-x-2 bg-amber-400 text-[#0F2942] py-2 rounded-lg font-extrabold text-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>किसान हेल्पलाइन: 1800-180-1551</span>
            </a>
            {user ? (
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="font-bold">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded font-bold flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.nav.logout}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-white border border-green-400 rounded-lg"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-bold text-[#0F2942] bg-[#FF9933] rounded-lg"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

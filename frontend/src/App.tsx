import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './layouts/Navbar';
import { Footer } from './layouts/Footer';
import { KisanVoiceAssistant } from './components/KisanVoiceAssistant';
import { LanguageWelcomeModal } from './components/LanguageWelcomeModal';

// Pages
import { LandingPage } from './pages/LandingPage';
import { FarmerDashboardPage } from './pages/FarmerDashboardPage';
import { DiseaseDetectionPage } from './pages/DiseaseDetectionPage';
import { PestDetectionPage } from './pages/PestDetectionPage';
import { RiskSurveillancePage } from './pages/RiskSurveillancePage';
import { HistoryPage } from './pages/HistoryPage';
import { AdvisoryPage } from './pages/AdvisoryPage';
import { CropsCataloguePage } from './pages/CropsCataloguePage';
import { CropDetailPage } from './pages/CropDetailPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { ExpertPortalPage } from './pages/ExpertPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SchemesMandiPage } from './pages/SchemesMandiPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-[#F4F6F4]">
            <Navbar />
            <main id="main-content" className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<FarmerDashboardPage />} />
                <Route path="/detect" element={<DiseaseDetectionPage />} />
                <Route path="/pests" element={<PestDetectionPage />} />
                <Route path="/risk" element={<RiskSurveillancePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/advisory" element={<AdvisoryPage />} />
                <Route path="/schemes" element={<SchemesMandiPage />} />
                <Route path="/crops" element={<CropsCataloguePage />} />
                <Route path="/crops/:cropId" element={<CropDetailPage />} />
                <Route path="/analytics" element={<AnalyticsDashboardPage />} />
                <Route path="/expert" element={<ExpertPortalPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
            <KisanVoiceAssistant />
            <LanguageWelcomeModal />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;

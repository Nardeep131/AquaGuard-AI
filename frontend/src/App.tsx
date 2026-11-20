import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LandingPage } from './pages/LandingPage';
import { DrinkingWaterModule } from './pages/DrinkingWaterModule';
import { EnvironmentalWaterModule } from './pages/EnvironmentalWaterModule';
import { DashboardOverview } from './pages/DashboardOverview';
import { HistoryAndReports } from './pages/HistoryAndReports';
import { ChatbotWidget } from './chatbot/ChatbotWidget';
import { apiClient, waterService } from './services/api';
import { User, DashboardStats } from './types';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'drinking' | 'environmental' | 'dashboard' | 'history'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Load user from existing token on startup
  useEffect(() => {
    async function initUserAndStats() {
      const token = localStorage.getItem('aquaguard_token');
      if (token) {
        try {
          const res = await apiClient.get<User>('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.warn('Session expired or invalid token');
          localStorage.removeItem('aquaguard_token');
        }
      }

      // Fetch initial telemetry stats for hero
      try {
        const statsData = await waterService.getStats();
        setStats(statsData);
      } catch (e) {
        // Fallback default statistics
        setStats({
          total_samples: 54,
          drinking_samples: 30,
          environmental_samples: 24,
          samples_requiring_investigation: 11,
          potable_compliant_samples: 22,
          treatment_needed_samples: 32,
          average_quality_score: 84.5,
          compliance_rate_percent: 73.3
        });
      }
    }
    initUserAndStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('aquaguard_token');
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#061426] text-[#F1F5F9] selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Routed Page Content */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartAnalysis={cat => setCurrentView(cat)}
            onExploreDashboard={() => setCurrentView('dashboard')}
            stats={stats}
          />
        )}

        {currentView === 'drinking' && <DrinkingWaterModule />}

        {currentView === 'environmental' && <EnvironmentalWaterModule />}

        {currentView === 'dashboard' && <DashboardOverview onNavigate={setCurrentView} />}

        {currentView === 'history' && <HistoryAndReports />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating 3D Water Droplet Rule-based Chatbot */}
      <ChatbotWidget />

      {/* Role-based Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={newUser => setUser(newUser)}
      />
    </div>
  );
}

export default App;

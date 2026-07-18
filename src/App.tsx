import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PlanningPage } from '@/features/planning/PlanningPage';
import { FinancePage } from '@/features/finance/FinancePage';
import { FoodPage } from '@/features/food/FoodPage';
import { HealthPage } from '@/features/health/HealthPage';
import { LearningPage } from '@/features/learning/LearningPage';
import { CareerPage } from '@/features/career/CareerPage';
import { DocumentsPage } from '@/features/documents/DocumentsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { syncEngine } from '@/lib/syncEngine';
import { useAuthStore } from '@/store/authStore';
import { AuthPage } from '@/features/auth/AuthPage';

export function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    syncEngine.initialize();
  }, []);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/planning/*" element={<PlanningPage />} />
          <Route path="/finance/*" element={<FinancePage />} />
          <Route path="/food/*" element={<FoodPage />} />
          <Route path="/health/*" element={<HealthPage />} />
          <Route path="/learning/*" element={<LearningPage />} />
          <Route path="/career/*" element={<CareerPage />} />
          <Route path="/documents/*" element={<DocumentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

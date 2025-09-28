import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './hooks/useToast';

// Import the new timer hook and your conflict data
import { useTimer } from './contexts/TimerContext';
import conflictsData from './data/conflicts.json';

import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { SchedulePage } from './pages/SchedulePage';
import { ConflictsPage } from './pages/ConflictsPage';
import { SimulationPage } from './pages/SimulationPage';
import { KPIsPage } from './pages/KPIsPage';
import { AuditPage } from './pages/AuditPage';
import { SettingsPage } from './pages/SettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// NEW: This component now holds your routes and the timer logic
const AppRoutes = () => {
  const { startCriticalTimer } = useTimer();

  // This effect will check for critical conflicts and start the global timer
  useEffect(() => {
    const hasCriticalConflict = conflictsData.some(
      (c) => c.severity === 'Critical' && c.status === 'Pending'
    );
    if (hasCriticalConflict) {
      startCriticalTimer(300); // Start a 5-minute timer
    }
  }, [startCriticalTimer]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="conflicts" element={<ConflictsPage />} />
          <Route path="simulation" element={<SimulationPage />} />
          <Route path="kpis" element={<KPIsPage />} />
          <Route path="audit" element={<AuditPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

// The main App component now just sets up the providers
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes /> {/* Render the new component here */}
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
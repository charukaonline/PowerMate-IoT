import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import PowerSupply from '@/pages/PowerSupply';
import CurrentMonitoring from '@/pages/CurrentMonitoring';
import GeneratorFuel from '@/pages/GeneratorFuel';
import BackupBattery from '@/pages/BackupBattery';
import Settings from '@/pages/Settings';

import './App.css';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RedirectAuthenticatedUser } from './components/RedirectAuthenticatedUser';
import NotFound from './pages/NotFound';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <div>Loading...</div>;

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Router>

        <Routes>
          <Route path='/auth/login' element={
            <RedirectAuthenticatedUser>
              <Login />
            </RedirectAuthenticatedUser>
          }
          />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <ProtectedRoute>
          <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/power-supply" element={<PowerSupply />} />
              <Route path="/current-monitoring" element={<CurrentMonitoring />} />
              <Route path="/generator-fuel" element={<GeneratorFuel />} />
              <Route path="/backup-battery" element={<BackupBattery />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Layout>
          <Toaster />
        </ProtectedRoute>
      </Router>
    </ThemeProvider>
  );
}

export default App;
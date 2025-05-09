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
import PowerHistoryTable from "@/pages/DCPowerHistory.tsx";
import RegisterForm from "@/pages/Register.tsx";
import ProfilePage from "@/pages/UserProfile.tsx";
import BatteryHistoryDashboard from "@/pages/BackupBattery";
import FullBatteryHistory from "@/pages/FullBatteryHistory.tsx";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const authCheck = async () => {
      try {
        await Promise.race([
          checkAuth(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth check timeout')), 5000)
          )
        ]);
      } catch (error) {
        console.error('Auth check timed out or failed:', error);
      }
    };

    authCheck();
  }, [checkAuth]);

  // Add a timeout to prevent infinite loading
  if (isCheckingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full inline-block mb-4"></div>
          <p className=' text-white'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path='/auth/login' element={
            <RedirectAuthenticatedUser>
              <Login />
            </RedirectAuthenticatedUser>
          } />
          
          {/* Protected routes wrapped with Layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/register" element={<RegisterForm />}/>
          <Route path="/login" element={<Login />}/>
          <Route path="/power-supply" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <PowerHistoryTable />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/current-monitoring" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <CurrentMonitoring />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/generator-fuel" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <GeneratorFuel />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/backup-battery" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <BatteryHistoryDashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <Settings />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/full-battery-history" element={
            <ProtectedRoute>
              <FullBatteryHistory />
            </ProtectedRoute>
          } />
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <ThemeProvider defaultTheme="system" storageKey="ui-theme">
      <Router>
        <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/power-supply" element={<PowerSupply />} />
            <Route path="/current-monitoring" element={<CurrentMonitoring />} />
            <Route path="/generator-fuel" element={<GeneratorFuel />} />
            <Route path="/backup-battery" element={<BackupBattery />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}

export default App;
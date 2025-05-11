import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Layout from './components/layout/Layout'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from '@/components/ui/toaster';
import Login from './pages/Login'
import { RedirectAuthenticatedUser } from './components/RedirectAuthenticatedUser'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import PowerSupply from './pages/PowerSupply'
import BackupBattery from './pages/BackupBattery'
import GeneratorFuel from './pages/GeneratorFuel'

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
    <>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <Routes>

          <Route path='/auth/login' element={
            <RedirectAuthenticatedUser>
              <Login />
            </RedirectAuthenticatedUser>
          } />

          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/power-supply'
            element={
              <ProtectedRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <PowerSupply />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/backup-battery'
            element={
              <ProtectedRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <BackupBattery />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/generator-fuel'
            element={
              <ProtectedRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <GeneratorFuel />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/settings'
            element={
              <ProtectedRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <div>Settings</div>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                  <div>Profile</div>
                </Layout>
              </ProtectedRoute>
            }
          /> */}

        </Routes>
        <Toaster />
      </ThemeProvider>
    </>
  )
}

export default App
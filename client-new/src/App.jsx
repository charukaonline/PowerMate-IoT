import React, { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Layout from './components/layout/Layout'
import { ThemeProvider } from './components/ThemeProvider'

function App() {

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <Routes>

          <Route
            path='/'
            element={
              <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
                <Dashboard />
              </Layout>
            }
          />

        </Routes>
      </ThemeProvider>
    </>
  )
}

export default App
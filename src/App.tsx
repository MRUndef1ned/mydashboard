import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UIProvider } from './context/UIContext'
import { WatchlistProvider } from './context/WatchlistContext'
import { PortfolioProvider } from './context/PortfolioContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { OverviewPage } from './pages/OverviewPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { TeamPage } from './pages/TeamPage'
import { MessagesPage } from './pages/MessagesPage'
import { SettingsPage } from './pages/SettingsPage'
import { StocksPage } from './pages/StocksPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { ToastContainer } from './components/ToastContainer'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <WatchlistProvider>
          <PortfolioProvider>
          <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/team" element={<TeamPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/stocks" element={<StocksPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
          </PortfolioProvider>
          </WatchlistProvider>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

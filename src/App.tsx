import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Pricing from './components/landing/Pricing';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ClientsPage from './pages/dashboard/Clients';
import InvoicesPage from './pages/dashboard/Invoices';
import RemindersPage from './pages/dashboard/Reminders';
import ReportsPage from './pages/dashboard/Reports';







// Landing Page Wrapper
const LandingPage = () => (
  <div className="min-h-screen bg-slate-50/10">
    <Navbar />
    <Hero />
    <Features />
    <Pricing />
    <footer className="py-12 border-t border-slate-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="text-2xl font-bold gradient-heading mb-6">PAY⚡TRACK</div>
        <p className="text-slate-400 text-sm">© 2024 PayTrack.io. Built for freelancers worldwide.</p>
      </div>
    </footer>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout pageTitle="Overview">
                  <DashboardHome />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/clients"
            element={
              <ProtectedRoute>
                <DashboardLayout pageTitle="Clients">
                  <ClientsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/invoices"
            element={
              <ProtectedRoute>
                <DashboardLayout pageTitle="Invoices">
                  <InvoicesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reminders"
            element={
              <ProtectedRoute>
                <DashboardLayout pageTitle="Reminders">
                  <RemindersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout pageTitle="Reports">
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;


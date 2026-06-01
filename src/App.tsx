import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import Features from './components/landing/Features';
import Pricing from './components/landing/Pricing';
import Testimonials from './components/landing/Testimonials';
import FAQ from './components/landing/FAQ';
import Comparison from './components/landing/Comparison';
import Steps from './components/landing/Steps';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import ClientsPage from './pages/dashboard/Clients';
import InvoicesPage from './pages/dashboard/Invoices';
import RemindersPage from './pages/dashboard/Reminders';
import ReportsPage from './pages/dashboard/Reports';
import SettingsPage from './pages/dashboard/Settings';
import PaymentPage from './pages/dashboard/Payment';
import ProjectsPage from './pages/dashboard/Projects';







// Landing Page Wrapper
const LandingPage = () => (
  <div className="min-h-screen bg-slate-950">
    <Navbar />
    <Hero />
    <Features />
    <Comparison />
    <Steps />
    <Pricing />
    <Testimonials />
    <FAQ />
    <footer className="py-24 border-t border-white/5 bg-slate-950 relative overflow-hidden">
      {/* Subtle ambient light */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/10 rounded-full blur-[100px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pb-16 border-b border-white/5">
          {/* Logo & Intro Column */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <span className="text-white font-black text-xl italic leading-none">P</span>
              </div>
              <span className="text-xl font-black text-white tracking-tighter">PayTrack</span>
            </div>
            <p className="text-slate-400 text-sm font-semibold max-w-sm leading-relaxed">
              The sophisticated invoicing and automated payment flow platform built specifically for professional creators, developers, and agency owners.
            </p>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Product</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="text-slate-400 hover:text-white transition-colors">Success Stories</a></li>
              <li><a href="#faq" className="text-slate-400 hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Workspace Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Workspace</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><a href="/login" className="text-slate-400 hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="/signup" className="text-slate-400 hover:text-white transition-colors">Flat-Rate Portal</a></li>
              <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">GST Compliance</a></li>
              <li><a href="/dashboard/settings" className="text-slate-400 hover:text-white transition-colors">Security Rules</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
            © 2026 PayTrack. The Elite Choice for Freelancers.
          </p>
          <div className="flex gap-6 text-xs font-bold text-slate-500">
            <a href="#faq" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#faq" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#faq" className="hover:text-white transition-colors">Status: Operational</a>
          </div>
        </div>
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
        <SearchProvider>
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
             <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <DashboardLayout pageTitle="Settings">
                    <SettingsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/projects"
              element={
                <ProtectedRoute>
                  <DashboardLayout pageTitle="Projects">
                    <ProjectsPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/payment"
              element={
                <ProtectedRoute>
                  <DashboardLayout pageTitle="Billing">
                    <PaymentPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


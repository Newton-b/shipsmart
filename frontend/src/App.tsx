import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { FreightNavigation } from './components/FreightNavigation';
import { Dashboard } from './components/Dashboard';
import { FreightHero } from './components/FreightHero';
import { ServicesSection } from './components/ServicesSection';
import { TrackingSection } from './components/TrackingSection';
import { TrackShipment } from './pages/TrackShipment';
import { ClientTestimonials } from './components/ClientTestimonials';
import { FreightFooter } from './components/FreightFooter';
import { ProtectedRoute, AdminRoute, EndUserRoute, AuthenticatedRoute } from './components/ProtectedRoute';
import { OceanFreight } from './pages/OceanFreight';
import { AirFreight } from './pages/AirFreight';
import { GroundTransportation } from './pages/GroundTransportation';
import { CustomsClearance } from './pages/CustomsClearance';
import { Warehousing } from './pages/Warehousing';
import { ProjectCargo } from './pages/ProjectCargo';
import { AboutUs } from './pages/AboutUs';
import { Team } from './pages/Team';
import { Careers } from './pages/Careers';
import { News } from './pages/News';
import { CaseStudies } from './pages/CaseStudies';
import { Partners } from './pages/Partners';
import { Contact } from './pages/Contact';
import { Documentation } from './pages/Documentation';
import { APIReference } from './pages/APIReference';
import { ShippingCalculator } from './pages/ShippingCalculator';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserProfilePage } from './pages/UserProfilePage';
import { MyShipments } from './pages/MyShipments';
import { Analytics } from './pages/Analytics';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { Products } from './pages/Products';
import { AdminDashboard } from './pages/AdminDashboard';
import { CustomerManagement } from './pages/CustomerManagement';
import { InventoryManagement } from './pages/InventoryManagement';
import { QuotationSystem } from './pages/QuotationSystem';
import { DocumentManagement } from './pages/DocumentManagement';
import { NotificationSystem } from './pages/NotificationSystem';
import { SupplyChainManagement } from './pages/SupplyChainManagement';
import { Unauthorized } from './pages/Unauthorized';
import NotificationCenter from './pages/NotificationCenter';
import LiveDashboard from './components/LiveDashboard';
import ShipperDashboard from './pages/ShipperDashboard';
import CarrierDashboard from './pages/CarrierDashboard';
import DriverDashboard from './pages/DriverDashboard';
import DispatcherDashboard from './pages/DispatcherDashboard';
import CustomerServiceDashboard from './pages/CustomerServiceDashboard';
import FinanceDashboard from './pages/FinanceDashboard';
import RoleDashboard from './pages/RoleDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { LiveChat } from './components/LiveChat';
import { WeatherAlerts } from './components/WeatherAlerts';
import { RealTimeInventory } from './components/RealTimeInventory';
import { LiveVideoFeeds } from './components/LiveVideoFeeds';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');

  const handleNavigate = (section: string) => {
    setActiveSection(section);
  };

  const handleQuoteClick = () => {
    setActiveSection('contact');
    navigate('/shipping-calculator');
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  const handleTrackingSubmit = (trackingNumber: string) => {
    navigate(`/tracking?number=${encodeURIComponent(trackingNumber)}`);
  };

  const handleLearnMoreClick = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/about');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 relative">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <FreightHero 
              onQuoteClick={handleQuoteClick}
              onLearnMoreClick={handleLearnMoreClick}
            />
            <ServicesSection onQuoteClick={handleQuoteClick} />
            <TrackingSection />
            <ClientTestimonials onContactClick={handleContactClick} />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* Authentication Routes */}
        <Route path="/login" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Login 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
              onNavigate={(page) => navigate(`/${page}`)}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/register" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Register 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Admin-Only Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/customers" element={
          <AdminRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <CustomerManagement />
            </>
          </AdminRoute>
        } />
        <Route path="/admin/inventory" element={
          <AdminRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <InventoryManagement />
            </>
          </AdminRoute>
        } />
        <Route path="/admin/quotations" element={
          <AdminRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <QuotationSystem />
            </>
          </AdminRoute>
        } />
        <Route path="/admin/documents" element={
          <AdminRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <DocumentManagement />
            </>
          </AdminRoute>
        } />
        <Route path="/admin/notifications" element={
          <AdminRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <NotificationSystem />
            </>
          </AdminRoute>
        } />
        <Route path="/admin/supply-chain" element={
          <AdminRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <SupplyChainManagement />
            </>
          </AdminRoute>
        } />

        {/* Shipper Dashboard Route */}
        <Route path="/shipper" element={
          <AuthenticatedRoute>
            <ShipperDashboard />
          </AuthenticatedRoute>
        } />

        {/* Carrier Dashboard Route */}
        <Route path="/carrier" element={
          <AuthenticatedRoute>
            <CarrierDashboard />
          </AuthenticatedRoute>
        } />

        {/* Driver Dashboard Route */}
        <Route path="/driver" element={
          <AuthenticatedRoute>
            <DriverDashboard />
          </AuthenticatedRoute>
        } />

        {/* Dispatcher Dashboard Route */}
        <Route path="/dispatcher" element={
          <AuthenticatedRoute>
            <DispatcherDashboard />
          </AuthenticatedRoute>
        } />

        {/* Customer Service Dashboard Route */}
        <Route path="/customer-service" element={
          <AuthenticatedRoute>
            <CustomerServiceDashboard />
          </AuthenticatedRoute>
        } />

        {/* Finance Dashboard Route */}
        <Route path="/finance" element={
          <AuthenticatedRoute>
            <FinanceDashboard />
          </AuthenticatedRoute>
        } />

        {/* Role Dashboard - Landing page for role selection */}
        <Route path="/dashboard" element={
          <AuthenticatedRoute>
            <RoleDashboard />
          </AuthenticatedRoute>
        } />

        {/* Authenticated User Routes */}
        <Route path="/profile" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <UserProfilePage 
                onQuoteClick={handleQuoteClick}
                onContactClick={handleContactClick}
              />
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/my-shipments" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <MyShipments 
                onQuoteClick={handleQuoteClick}
                onContactClick={handleContactClick}
              />
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/analytics" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <Analytics 
                onQuoteClick={handleQuoteClick}
                onContactClick={handleContactClick}
              />
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/notifications" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <NotificationCenter />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/live-dashboard" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <LiveDashboard />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/settings" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <Settings 
                onQuoteClick={handleQuoteClick}
                onContactClick={handleContactClick}
              />
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />

        {/* Public Tracking Route - Available to all users */}
        <Route path="/track" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <TrackShipment onBack={() => navigate('/')} />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* End User Routes (Tracking Dashboard) */}
        <Route path="/tracking" element={
          <EndUserRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <Dashboard 
                onQuoteClick={handleQuoteClick}
                onContactClick={handleContactClick}
              />
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </EndUserRoute>
        } />

        {/* Service Pages - Available to all users */}
        <Route path="/ocean-freight" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <OceanFreight 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/air-freight" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <AirFreight 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/ground-transport" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <GroundTransportation 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/customs" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <CustomsClearance 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/warehousing" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Warehousing 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/project-cargo" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <ProjectCargo 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/products" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Products 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* Company Pages */}
        <Route path="/about" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <AboutUs 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/team" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Team 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/careers" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Careers 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/news" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <News 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/case-studies" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <CaseStudies 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/partners" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Partners 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* Resource Pages */}
        <Route path="/documentation" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Documentation 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/api-reference" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <APIReference 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />
        <Route path="/shipping-calculator" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <ShippingCalculator 
              onQuoteClick={handleQuoteClick}
              onContactClick={handleContactClick}
            />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* Enhanced Live Features Routes */}
        <Route path="/weather-alerts" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <WeatherAlerts />
              </div>
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/real-time-inventory" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <RealTimeInventory />
              </div>
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/live-video-feeds" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <LiveVideoFeeds />
              </div>
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />
        <Route path="/predictive-analytics" element={
          <AuthenticatedRoute>
            <>
              <FreightNavigation onNavigate={handleNavigate} />
              <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <PredictiveAnalytics />
              </div>
              <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
            </>
          </AuthenticatedRoute>
        } />

        {/* Contact Page */}
        <Route path="/contact" element={
          <>
            <FreightNavigation onNavigate={handleNavigate} />
            <Contact />
            <FreightFooter onContactClick={handleContactClick} onNavigate={handleNavigate} onPageNavigate={(page) => navigate(`/${page}`)} />
          </>
        } />

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Global Live Chat - Available on all pages */}
      <LiveChat />
    </div>
  );
};

export default App;

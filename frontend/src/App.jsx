import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LogoutPage from './pages/LogoutPage';
import ActivationPage from './pages/ActivationPage';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import ProposeWorkshopPage from './pages/ProposeWorkshopPage';
import WorkshopDetailsPage from './pages/WorkshopDetailsPage';
import WorkshopTypeListPage from './pages/WorkshopTypeListPage';
import WorkshopTypeDetailsPage from './pages/WorkshopTypeDetailsPage';
import AddWorkshopTypePage from './pages/AddWorkshopTypePage';
import EditWorkshopTypePage from './pages/EditWorkshopTypePage';
import ProfilePage from './pages/ProfilePage';
import ViewProfilePage from './pages/ViewProfilePage';
import PublicStatsPage from './pages/PublicStatsPage';
import TeamStatsPage from './pages/TeamStatsPage';
import NotFoundPage from './pages/NotFoundPage';

function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  return user.is_instructor ? <InstructorDashboard /> : <CoordinatorDashboard />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-spinner" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="/activation" element={<ActivationPage />} />
            <Route path="/statistics" element={<PublicStatsPage />} />

            <Route path="/dashboard" element={<DashboardRouter />} />

            <Route path="/propose-workshop" element={
              <ProtectedRoute><ProposeWorkshopPage /></ProtectedRoute>
            } />
            <Route path="/workshop/:id" element={
              <ProtectedRoute><WorkshopDetailsPage /></ProtectedRoute>
            } />
            <Route path="/workshop-types" element={
              <ProtectedRoute><WorkshopTypeListPage /></ProtectedRoute>
            } />
            <Route path="/workshop-types/add" element={
              <ProtectedRoute><AddWorkshopTypePage /></ProtectedRoute>
            } />
            <Route path="/workshop-types/:id" element={
              <ProtectedRoute><WorkshopTypeDetailsPage /></ProtectedRoute>
            } />
            <Route path="/workshop-types/:id/edit" element={
              <ProtectedRoute><EditWorkshopTypePage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute><ViewProfilePage /></ProtectedRoute>
            } />
            <Route path="/statistics/team" element={
              <ProtectedRoute><TeamStatsPage /></ProtectedRoute>
            } />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

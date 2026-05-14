import React from 'react';
import { Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import LandingPage from './components/landing/LandingPage';
import AnimatedLogin from './components/auth/AnimatedLogin';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import AdminDashboard from './components/admin/AdminDashboard';
import LiveTracking from './components/admin/LiveTracking';
import DriverDashboard from './components/driver/DriverDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ParentDashboard from './components/parents/ParentDashboard';
import ProtectedRoute from './components/common/ProtectedRoutes';
import StudentsModule from './components/admin/StudentsModule';
import DriversModule from './components/admin/DriversModule';
import RoutesModule from './components/admin/RoutesModule';
import VehiclesModule from './components/admin/VehiclesModule';
import AlertsModule from './components/admin/AlertsModule';
import SettingsModule from './components/admin/SettingsModule';

const AdminPage = ({ title }) => (
  <AdminDashboard activePage={title} />
);

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AnimatedLogin />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/tracking" element={<ProtectedRoute roles={['admin']}><LiveTracking /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><StudentsModule /></ProtectedRoute>} />
            <Route path="/admin/drivers" element={<ProtectedRoute roles={['admin']}><DriversModule /></ProtectedRoute>} />
            <Route path="/admin/routes" element={<ProtectedRoute roles={['admin']}><RoutesModule /></ProtectedRoute>} />
            <Route path="/admin/vehicles" element={<ProtectedRoute roles={['admin']}><VehiclesModule /></ProtectedRoute>} />
            <Route path="/admin/alerts" element={<ProtectedRoute roles={['admin']}><AlertsModule /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute roles={['admin']}><SettingsModule /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            
            <Route path="/driver" element={
              <ProtectedRoute roles={['driver']}>
                <DriverDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student" element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/parent" element={
              <ProtectedRoute roles={['parent']}>
                <ParentDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
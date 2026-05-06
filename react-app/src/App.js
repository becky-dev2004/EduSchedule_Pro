import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardAdminPage from './pages/DashboardAdminPage';
import DashboardEnseignantPage from './pages/DashboardEnseignantPage';
import DashboardDeleguePage from './pages/DashboardDeleguePage';
import EmploiTempsPage from './pages/EmploiTempsPage';
import PointagePage from './pages/PointagePage';
import CahierTextePage from './pages/CahierTextePage';
import VacationPage from './pages/VacationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard/admin" element={
            <PrivateRoute roles={['administrateur']}>
              <DashboardAdminPage />
            </PrivateRoute>
          } />
          <Route path="/dashboard/enseignant" element={
            <PrivateRoute roles={['enseignant']}>
              <DashboardEnseignantPage />
            </PrivateRoute>
          } />
          <Route path="/dashboard/delegue" element={
            <PrivateRoute roles={['delegue']}>
              <DashboardDeleguePage />
            </PrivateRoute>
          } />
          <Route path="/emploi-temps" element={
            <PrivateRoute roles={['administrateur','enseignant','delegue','etudiant']}>
              <EmploiTempsPage />
            </PrivateRoute>
          } />
          <Route path="/pointage" element={
            <PrivateRoute roles={['enseignant','administrateur']}>
              <PointagePage />
            </PrivateRoute>
          } />
          <Route path="/cahier-texte" element={
            <PrivateRoute roles={['delegue','enseignant','surveillant']}>
              <CahierTextePage />
            </PrivateRoute>
          } />
          <Route path="/vacation" element={
            <PrivateRoute roles={['enseignant','surveillant','comptable','administrateur']}>
              <VacationPage />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
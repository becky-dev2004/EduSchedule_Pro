// ============================================
// EduSchedule Pro — Dashboard Administrateur
// ============================================
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function DashboardAdminPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          'http://localhost/EduSchedule_Pro/backend/api/dashboard.php',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) setStats(response.data.data);
      } catch (error) {
        console.error('Erreur stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="main-content">

        {/* Titre */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Tableau de bord</h4>
            <p className="text-muted mb-0">Vue d'ensemble — Aujourd'hui</p>
          </div>
          <span className="badge bg-primary fs-6">Administrateur</span>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary"></div>
          </div>
        ) : (
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="kpi-card">
                <div className="kpi-number">{stats?.total_seances || 0}</div>
                <div className="kpi-label">
                  <i className="bi bi-calendar-check text-primary"></i> Séances aujourd'hui
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="kpi-card green">
                <div className="kpi-number">{stats?.seances_pointees || 0}</div>
                <div className="kpi-label">
                  <i className="bi bi-check-circle text-success"></i> Séances pointées
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="kpi-card orange">
                <div className="kpi-number">{stats?.retards || 0}</div>
                <div className="kpi-label">
                  <i className="bi bi-clock text-warning"></i> Retards signalés
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="kpi-card red">
                <div className="kpi-number">{stats?.absences || 0}</div>
                <div className="kpi-label">
                  <i className="bi bi-x-circle text-danger"></i> Absences
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertes */}
        <div className="card-edu">
          <h5><i className="bi bi-exclamation-triangle text-warning"></i> Alertes</h5>
          {stats?.cahiers_non_signes > 0 && (
            <div className="alert alert-info">
              <i className="bi bi-journal-x"></i>
              <strong> Cahiers de texte :</strong> {stats.cahiers_non_signes} cahier(s) non clôturé(s)
            </div>
          )}
          {stats?.vacations_attente > 0 && (
            <div className="alert alert-warning">
              <i className="bi bi-cash-stack"></i>
              <strong> Vacations :</strong> {stats.vacations_attente} fiche(s) en attente de validation
            </div>
          )}
          {!stats?.cahiers_non_signes && !stats?.vacations_attente && (
            <div className="alert alert-success">
              <i className="bi bi-check-circle"></i> Aucune alerte pour aujourd'hui
            </div>
          )}
        </div>

      </div>
    </>
  );
}

export default DashboardAdminPage;
// ============================================
// EduSchedule Pro — Dashboard Enseignant
// ============================================
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function DashboardEnseignantPage() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Tableau de bord</h4>
            <p className="text-muted mb-0">Bienvenue, {user?.email}</p>
          </div>
          <span className="badge bg-success fs-6">Enseignant</span>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="kpi-card">
              <div className="kpi-number">5</div>
              <div className="kpi-label">
                <i className="bi bi-calendar-check text-primary"></i> Séances cette semaine
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kpi-card green">
              <div className="kpi-number">3</div>
              <div className="kpi-label">
                <i className="bi bi-check-circle text-success"></i> Séances pointées
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kpi-card orange">
              <div className="kpi-number">125 000</div>
              <div className="kpi-label">
                <i className="bi bi-cash text-warning"></i> FCFA ce mois
              </div>
            </div>
          </div>
        </div>

        <div className="card-edu">
          <h5><i className="bi bi-calendar3"></i> Mes prochaines séances</h5>
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Jour</th>
                <th>Heure</th>
                <th>Matière</th>
                <th>Classe</th>
                <th>Salle</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lundi</td>
                <td>08h00 - 10h00</td>
                <td>Algorithmique</td>
                <td>L1-INFO</td>
                <td>A101</td>
                <td><span className="badge badge-encours">À venir</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DashboardEnseignantPage;
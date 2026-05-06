// ============================================
// EduSchedule Pro — Dashboard Délégué
// ============================================
import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function DashboardDeleguePage() {
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
          <span className="badge bg-warning fs-6">Délégué</span>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="kpi-card">
              <div className="kpi-number">6</div>
              <div className="kpi-label">
                <i className="bi bi-calendar3 text-primary"></i> Séances cette semaine
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kpi-card orange">
              <div className="kpi-number">2</div>
              <div className="kpi-label">
                <i className="bi bi-journal-x text-warning"></i> Cahiers à remplir
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="kpi-card green">
              <div className="kpi-number">4</div>
              <div className="kpi-label">
                <i className="bi bi-journal-check text-success"></i> Cahiers clôturés
              </div>
            </div>
          </div>
        </div>

        <div className="card-edu">
          <h5><i className="bi bi-journal-text"></i> Cahiers de texte à remplir</h5>
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Matière</th>
                <th>Enseignant</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>05 Mai 2025</td>
                <td>Algorithmique</td>
                <td>M. KABORE</td>
                <td><span className="badge badge-brouillon">Brouillon</span></td>
                <td>
                  <a href="/cahier-texte" className="btn btn-sm btn-primary">
                    <i className="bi bi-pencil"></i> Remplir
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default DashboardDeleguePage;
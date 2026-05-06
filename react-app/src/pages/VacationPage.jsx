// ============================================
// EduSchedule Pro — Page Fiches de vacation
// ============================================
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function VacationPage() {
  const { token } = useAuth();
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVacations = async () => {
      try {
        const res = await axios.get(
          'http://localhost/EduSchedule_Pro/backend/api/vacations.php',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) setVacations(res.data.data);
      } catch (error) {
        console.error('Erreur vacations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVacations();
  }, [token]);

  const getStatutBadge = (statut) => {
    const badges = {
      'generee': 'badge-generee',
      'signee_enseignant': 'badge-signee',
      'visee_surveillant': 'badge-visee',
      'approuvee_comptable': 'badge-approuvee'
    };
    return badges[statut] || 'badge-generee';
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Fiches de vacation</h4>
            <p className="text-muted mb-0">Calcul et validation des vacations enseignants</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-primary btn-sm">
              <i className="bi bi-plus-circle"></i> Générer une fiche
            </button>
            <button className="btn btn-outline-success btn-sm">
              <i className="bi bi-file-pdf"></i> Export PDF
            </button>
          </div>
        </div>

        <div className="card-edu">
          <h5><i className="bi bi-list"></i> Liste des fiches de vacation</h5>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : vacations.length === 0 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle"></i> Aucune fiche de vacation trouvée.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Enseignant</th>
                    <th>Période</th>
                    <th>Montant brut</th>
                    <th>Montant net</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vacations.map(v => (
                    <tr key={v.id}>
                      <td>{v.nom} {v.prenom}</td>
                      <td>{v.mois}/{v.annee}</td>
                      <td>{v.montant_brut} FCFA</td>
                      <td>{v.montant_net} FCFA</td>
                      <td><span className={`badge ${getStatutBadge(v.statut)}`}>{v.statut}</span></td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary me-1">
                          <i className="bi bi-eye"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-success">
                          <i className="bi bi-file-pdf"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VacationPage;
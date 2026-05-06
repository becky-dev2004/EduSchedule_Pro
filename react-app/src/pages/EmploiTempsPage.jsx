// ============================================
// EduSchedule Pro — Page Emploi du temps
// ============================================
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function EmploiTempsPage() {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [emploiTemps, setEmploiTemps] = useState([]);
  const [filtreClasse, setFiltreClasse] = useState('');
  const [loading, setLoading] = useState(false);

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'];

  // Charger les classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(
          'http://localhost/EduSchedule_Pro/backend/api/classes.php',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) setClasses(res.data.data);
      } catch (error) {
        console.error('Erreur classes:', error);
      }
    };
    fetchClasses();
  }, [token]);

  // Charger l'emploi du temps
  const fetchEmploiTemps = async () => {
    setLoading(true);
    try {
      const url = filtreClasse
        ? `http://localhost/EduSchedule_Pro/backend/api/emploi_temps.php?id_classe=${filtreClasse}`
        : 'http://localhost/EduSchedule_Pro/backend/api/emploi_temps.php';

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setEmploiTemps(res.data.data);
    } catch (error) {
      console.error('Erreur emploi du temps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmploiTemps(); }, [filtreClasse]);

  // Couleurs par matière
  const couleurs = ['creneau-algo', 'creneau-bdd', 'creneau-web', 'creneau-reseau', 'creneau-math'];

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="main-content">

        {/* Titre */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Emploi du temps</h4>
            <p className="text-muted mb-0">Vue hebdomadaire</p>
          </div>
          <button className="btn btn-outline-success btn-sm">
            <i className="bi bi-file-pdf"></i> Export PDF
          </button>
        </div>

        {/* Filtres */}
        <div className="card-edu">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Classe</label>
              <select
                className="form-select form-select-sm"
                value={filtreClasse}
                onChange={(e) => setFiltreClasse(e.target.value)}
              >
                <option value="">Toutes les classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.code} — {c.libelle}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grille */}
        <div className="card-edu">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-bordered mb-0">
                <thead>
                  <tr>
                    <th style={{ backgroundColor: '#1a56db', color: 'white', width: '80px' }}>Heure</th>
                    {jours.map(j => (
                      <th key={j} style={{ backgroundColor: '#1a56db', color: 'white', textAlign: 'center' }}>{j}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heures.map((heure, i) => (
                    <tr key={heure}>
                      <td style={{ backgroundColor: '#f8fafc', textAlign: 'center', fontWeight: 600, color: '#6b7280', fontSize: '0.85rem' }}>
                        {heure}
                      </td>
                      {jours.map(jour => {
                        // Trouver les créneaux pour ce jour et cette heure
                        const creneauxDuJour = emploiTemps.flatMap(et =>
                          (et.creneaux || []).filter(cr =>
                            cr.jour === jour && cr.heure_debut.substring(0, 5) === heure
                          )
                        );

                        return (
                          <td key={jour} style={{ padding: '4px' }}>
                            {creneauxDuJour.map((cr, idx) => (
                              <div key={cr.id} className={`creneau ${couleurs[idx % couleurs.length]}`}
                                style={{
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  padding: '8px',
                                  margin: '2px',
                                  fontSize: '0.82rem'
                                }}>
                                <div style={{ fontWeight: 700 }}>{cr.matiere_libelle}</div>
                                <div style={{ color: '#6b7280' }}>
                                  <i className="bi bi-person"></i> {cr.enseignant_nom}
                                </div>
                                <div style={{ color: '#6b7280' }}>
                                  <i className="bi bi-building"></i> {cr.salle_code}
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
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

export default EmploiTempsPage;
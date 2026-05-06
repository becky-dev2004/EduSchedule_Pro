// ============================================
// EduSchedule Pro — Page Pointage QR-Code
// ============================================
import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function PointagePage() {
  const { token } = useAuth();
  const [codeManuel, setCodeManuel] = useState('');
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!codeManuel.trim()) return;
    setLoading(true);
    setErreur('');
    setResultat(null);

    try {
      const res = await axios.post(
        'http://localhost/EduSchedule_Pro/backend/api/pointages.php?action=scan',
        { token_qr: codeManuel },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setResultat(res.data);
    } catch (error) {
      setErreur(error.response?.data?.message || 'Erreur lors du scan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Pointage QR-Code</h4>
            <p className="text-muted mb-0">Validation de présence des enseignants</p>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6">

            {/* Zone scanner */}
            <div className="card-edu">
              <h5><i className="bi bi-qr-code-scan"></i> Scanner un QR-Code</h5>
              <div style={{
                border: '3px dashed #1a56db',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f0f7ff',
                cursor: 'pointer'
              }}>
                <i className="bi bi-qr-code-scan" style={{ fontSize: '5rem', color: '#1a56db' }}></i>
                <h5 className="mt-3 text-primary fw-bold">Scanner le QR-Code</h5>
                <p className="text-muted">Activez la caméra pour scanner le QR-Code de la séance</p>
                <button className="btn btn-primary mt-2">
                  <i className="bi bi-camera"></i> Activer la caméra
                </button>
              </div>
            </div>

            {/* Saisie manuelle */}
            <div className="card-edu">
              <h5><i className="bi bi-keyboard"></i> Saisie manuelle du code</h5>
              <p className="text-muted small">En cas de problème technique avec le scanner</p>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Entrez le code de la séance"
                  value={codeManuel}
                  onChange={(e) => setCodeManuel(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleScan} disabled={loading}>
                  {loading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-circle"></i> Valider</>}
                </button>
              </div>

              {/* Résultat */}
              {resultat && (
                <div className="alert alert-success mt-3">
                  <i className="bi bi-check-circle"></i> <strong>Pointage enregistré !</strong>
                  <div>Statut : {resultat.statut}</div>
                  <div>Heure : {resultat.heure_pointage}</div>
                </div>
              )}
              {erreur && (
                <div className="alert alert-danger mt-3">
                  <i className="bi bi-exclamation-triangle"></i> {erreur}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default PointagePage;
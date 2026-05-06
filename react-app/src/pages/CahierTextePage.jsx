// ============================================
// EduSchedule Pro — Page Cahier de texte
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SignaturePad from 'signature_pad';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

function CahierTextePage() {
  const { token } = useAuth();
  const [titre, setTitre] = useState('');
  const [contenu, setContenu] = useState('');
  const [avancement, setAvancement] = useState('');
  const [observations, setObservations] = useState('');
  const [heureFin, setHeureFin] = useState('');
  const [message, setMessage] = useState('');

  // Refs pour les signatures
  const canvasDelegueRef = useRef(null);
  const canvasEnseignantRef = useRef(null);
  let sigDelegue = null;
  let sigEnseignant = null;

  useEffect(() => {
    if (canvasDelegueRef.current) {
      sigDelegue = new SignaturePad(canvasDelegueRef.current);
    }
    if (canvasEnseignantRef.current) {
      sigEnseignant = new SignaturePad(canvasEnseignantRef.current);
    }
  }, []);

  const handleSauvegarder = async () => {
    try {
      const res = await axios.post(
        'http://localhost/EduSchedule_Pro/backend/api/cahiers.php',
        {
          id_creneau: 1,
          titre: titre,
          contenu_json: { points: contenu, avancement, observations },
          travaux: []
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setMessage('Cahier sauvegardé avec succès !');
    } catch (error) {
      setMessage('Erreur lors de la sauvegarde');
    }
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <div className="main-content">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold text-dark mb-0">Cahier de texte</h4>
            <p className="text-muted mb-0">Saisie et validation du contenu pédagogique</p>
          </div>
          <button className="btn btn-outline-success btn-sm">
            <i className="bi bi-file-pdf"></i> Export PDF
          </button>
        </div>

        <div className="row g-4">
          <div className="col-md-8">

            {/* Infos séance */}
            <div className="card-edu">
              <h5><i className="bi bi-info-circle"></i> Informations de la séance</h5>
              <div style={{ backgroundColor: '#f0f7ff', borderRadius: '8px', padding: '15px', borderLeft: '4px solid #1a56db' }}>
                <div className="row g-2">
                  <div className="col-md-6">
                    <small className="text-muted">Classe</small>
                    <div className="fw-semibold">L1-INFO</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Matière</small>
                    <div className="fw-semibold">Algorithmique</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Enseignant</small>
                    <div className="fw-semibold">M. KABORE Aminata</div>
                  </div>
                  <div className="col-md-6">
                    <small className="text-muted">Heure début réelle</small>
                    <div className="fw-semibold text-success">08h05 <i className="bi bi-check-circle"></i></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="card-edu">
              <h5><i className="bi bi-pencil-square"></i> Contenu pédagogique</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Titre du cours</label>
                <input type="text" className="form-control" value={titre} onChange={e => setTitre(e.target.value)} placeholder="Ex: Introduction aux algorithmes de tri" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Points vus dans le cours</label>
                <textarea className="form-control" rows="4" value={contenu} onChange={e => setContenu(e.target.value)} placeholder="Liste des notions, concepts, exercices traités..."></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Niveau d'avancement</label>
                <input type="text" className="form-control" value={avancement} onChange={e => setAvancement(e.target.value)} placeholder="Ex: Chapitre 2 / 5" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Observations</label>
                <textarea className="form-control" rows="2" value={observations} onChange={e => setObservations(e.target.value)} placeholder="Incidents, retards, absences signalées..."></textarea>
              </div>

              {message && <div className="alert alert-success">{message}</div>}

              <button className="btn btn-primary w-100" onClick={handleSauvegarder}>
                <i className="bi bi-save"></i> Sauvegarder
              </button>
            </div>

            {/* Signatures */}
            <div className="card-edu">
              <h5><i className="bi bi-pen"></i> Signatures numériques</h5>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="fw-semibold mb-2"><i className="bi bi-person"></i> Signature du délégué</div>
                  <canvas ref={canvasDelegueRef} style={{ border: '2px dashed #1a56db', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'crosshair', width: '100%', height: '150px' }}></canvas>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-outline-danger w-50" onClick={() => sigDelegue?.clear()}>
                      <i className="bi bi-trash"></i> Effacer
                    </button>
                    <button className="btn btn-sm btn-success w-50">
                      <i className="bi bi-check"></i> Valider
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="fw-semibold mb-2"><i className="bi bi-person-badge"></i> Signature enseignant</div>
                  <canvas ref={canvasEnseignantRef} style={{ border: '2px dashed #1a56db', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'crosshair', width: '100%', height: '150px' }}></canvas>
                  <div className="d-flex gap-2 mt-2">
                    <button className="btn btn-sm btn-outline-danger w-50" onClick={() => sigEnseignant?.clear()}>
                      <i className="bi bi-trash"></i> Effacer
                    </button>
                    <button className="btn btn-sm btn-success w-50">
                      <i className="bi bi-check"></i> Valider
                    </button>
                  </div>
                </div>
              </div>

              <div className="row g-3 mt-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Heure de fin réelle</label>
                  <input type="time" className="form-control" value={heureFin} onChange={e => setHeureFin(e.target.value)} />
                </div>
                <div className="col-md-8 d-flex align-items-end">
                  <button className="btn btn-danger w-100">
                    <i className="bi bi-lock"></i> Clôturer la séance
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default CahierTextePage;
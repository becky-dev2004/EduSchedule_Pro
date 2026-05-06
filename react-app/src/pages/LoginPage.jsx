// ============================================
// EduSchedule Pro — Page de connexion
// ============================================
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost/EduSchedule_Pro/backend/api/auth.php?action=login',
        { email, password }
      );

      if (response.data.success) {
        login(response.data.user, response.data.token);

        // Redirection selon le rôle
        const role = response.data.user.role;
        if (role === 'administrateur') navigate('/dashboard/admin');
        else if (role === 'enseignant') navigate('/dashboard/enseignant');
        else if (role === 'delegue') navigate('/dashboard/delegue');
        else navigate('/emploi-temps');
      }
    } catch (error) {
      setErreur(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#f0f4f8',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
        padding: '40px',
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <i className="bi bi-calendar-check" style={{ fontSize: '3rem', color: '#1a56db' }}></i>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1a56db' }}>
            EduSchedule Pro
          </h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>
            Gestion des emplois du temps et vacations
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">
              <i className="bi bi-envelope"></i> Adresse email
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">
              <i className="bi bi-lock"></i> Mot de passe
            </label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          {/* Erreur */}
          {erreur && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle"></i> {erreur}
            </div>
          )}

          {/* Bouton */}
          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold"
            disabled={loading}
            style={{ borderRadius: '8px' }}
          >
            {loading ? (
              <><span className="spinner-border spinner-border-sm me-2"></span>Connexion...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right"></i> Se connecter</>
            )}
          </button>
        </form>

        <div className="text-center mt-3 text-muted" style={{ fontSize: '0.8rem' }}>
          Année Universitaire 2025-2026
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
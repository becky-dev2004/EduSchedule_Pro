// ============================================
// EduSchedule Pro — Composant Navbar
// ============================================
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Navbar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost/EduSchedule_Pro/backend/api/auth.php?action=logout', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-edu">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <i className="bi bi-calendar-check"></i> EduSchedule Pro
        </a>
        <div className="d-flex align-items-center gap-3">
          <a href="#" className="text-white position-relative">
            <i className="bi bi-bell fs-5"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </a>
          <div className="dropdown">
            <a href="#" className="text-white dropdown-toggle text-decoration-none" data-bs-toggle="dropdown">
              <i className="bi bi-person-circle fs-5"></i> {user?.role}
            </a>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <a className="dropdown-item" href="#">
                  <i className="bi bi-person"></i> Mon profil
                </a>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right"></i> Déconnexion
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
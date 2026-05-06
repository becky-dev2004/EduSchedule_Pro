// ============================================
// EduSchedule Pro — Composant Sidebar
// ============================================
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user } = useAuth();

  return (
    <div className="sidebar">
      <p className="sidebar-title">Menu principal</p>
      <nav className="nav flex-column">

        {/* Dashboard selon rôle */}
        {user?.role === 'administrateur' && (
          <NavLink to="/dashboard/admin" className="nav-link">
            <i className="bi bi-speedometer2"></i> Tableau de bord
          </NavLink>
        )}
        {user?.role === 'enseignant' && (
          <NavLink to="/dashboard/enseignant" className="nav-link">
            <i className="bi bi-speedometer2"></i> Tableau de bord
          </NavLink>
        )}
        {user?.role === 'delegue' && (
          <NavLink to="/dashboard/delegue" className="nav-link">
            <i className="bi bi-speedometer2"></i> Tableau de bord
          </NavLink>
        )}

        <NavLink to="/emploi-temps" className="nav-link">
          <i className="bi bi-calendar3"></i> Emploi du temps
        </NavLink>

        {['administrateur', 'enseignant'].includes(user?.role) && (
          <NavLink to="/pointage" className="nav-link">
            <i className="bi bi-qr-code-scan"></i> Pointage QR-Code
          </NavLink>
        )}

        {['delegue', 'enseignant', 'surveillant'].includes(user?.role) && (
          <NavLink to="/cahier-texte" className="nav-link">
            <i className="bi bi-journal-text"></i> Cahier de texte
          </NavLink>
        )}

        {['enseignant', 'surveillant', 'comptable', 'administrateur'].includes(user?.role) && (
          <NavLink to="/vacation" className="nav-link">
            <i className="bi bi-cash-stack"></i> Fiches de vacation
          </NavLink>
        )}
      </nav>

      {/* Menu admin uniquement */}
      {user?.role === 'administrateur' && (
        <>
          <p className="sidebar-title mt-3">Administration</p>
          <nav className="nav flex-column">
            <a href="#" className="nav-link"><i className="bi bi-people"></i> Enseignants</a>
            <a href="#" className="nav-link"><i className="bi bi-mortarboard"></i> Classes</a>
            <a href="#" className="nav-link"><i className="bi bi-book"></i> Matières</a>
            <a href="#" className="nav-link"><i className="bi bi-building"></i> Salles</a>
            <a href="#" className="nav-link"><i className="bi bi-file-bar-graph"></i> Rapports</a>
            <a href="#" className="nav-link"><i className="bi bi-clock-history"></i> Logs activité</a>
          </nav>
        </>
      )}
    </div>
  );
}

export default Sidebar;
-- ============================================
-- EduSchedule Pro — Script SQL
-- Base de données : eduschedulepro
-- Année Universitaire 2025-2026
-- ============================================

CREATE DATABASE IF NOT EXISTS eduschedulepro
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE eduschedulepro;

-- Table : classes
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL,
    niveau VARCHAR(50) NOT NULL,
    annee_academique VARCHAR(20) NOT NULL
);

-- Table : matieres
CREATE TABLE matieres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    libelle VARCHAR(100) NOT NULL,
    volume_horaire_total INT NOT NULL,
    coefficient DECIMAL(4,2) NOT NULL
);

-- Table : enseignants
CREATE TABLE enseignants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matricule VARCHAR(30) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    specialite VARCHAR(100),
    statut ENUM('vacataire','permanent') NOT NULL,
    taux_horaire DECIMAL(10,2) NOT NULL
);

-- Table : salles
CREATE TABLE salles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    capacite INT NOT NULL,
    equipements TEXT,
    batiment VARCHAR(100)
);

-- Table : utilisateurs
CREATE TABLE utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe_hash VARCHAR(255) NOT NULL,
    role ENUM('administrateur','enseignant','delegue','surveillant','comptable','etudiant') NOT NULL,
    id_lien INT DEFAULT NULL,
    actif TINYINT(1) DEFAULT 1,
    token_reset VARCHAR(255) DEFAULT NULL
);
-- Table : emploi_temps
CREATE TABLE emploi_temps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_classe INT NOT NULL,
    semaine_debut DATE NOT NULL,
    statut_publication ENUM('brouillon','publié') DEFAULT 'brouillon',
    cree_par INT NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_classe) REFERENCES classes(id),
    FOREIGN KEY (cree_par) REFERENCES utilisateurs(id)
);

-- Table : creneaux
CREATE TABLE creneaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_emploi_temps INT NOT NULL,
    id_matiere INT NOT NULL,
    id_enseignant INT NOT NULL,
    id_salle INT NOT NULL,
    jour ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi') NOT NULL,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    qr_token VARCHAR(255) DEFAULT NULL,
    qr_expire DATETIME DEFAULT NULL,
    FOREIGN KEY (id_emploi_temps) REFERENCES emploi_temps(id),
    FOREIGN KEY (id_matiere) REFERENCES matieres(id),
    FOREIGN KEY (id_enseignant) REFERENCES enseignants(id),
    FOREIGN KEY (id_salle) REFERENCES salles(id)
);

-- Table : pointages
CREATE TABLE pointages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_creneau INT NOT NULL,
    heure_pointage_reelle DATETIME NOT NULL,
    ip_source VARCHAR(50),
    token_utilise VARCHAR(255),
    statut ENUM('valide','retard','absent') NOT NULL,
    FOREIGN KEY (id_creneau) REFERENCES creneaux(id)
);
-- Table : cahiers_texte
CREATE TABLE cahiers_texte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_creneau INT NOT NULL,
    id_delegue INT NOT NULL,
    titre_cours VARCHAR(255),
    contenu_json JSON,
    heure_fin_reelle TIME DEFAULT NULL,
    statut ENUM('brouillon','signe_delegue','cloture') DEFAULT 'brouillon',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_creneau) REFERENCES creneaux(id),
    FOREIGN KEY (id_delegue) REFERENCES utilisateurs(id)
);

-- Table : signatures
CREATE TABLE signatures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cahier INT NOT NULL,
    type_signataire ENUM('delegue','enseignant') NOT NULL,
    id_utilisateur INT NOT NULL,
    signature_base64 LONGTEXT NOT NULL,
    horodatage DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cahier) REFERENCES cahiers_texte(id),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id)
);

-- Table : travaux_demandes
CREATE TABLE travaux_demandes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_cahier INT NOT NULL,
    description TEXT NOT NULL,
    date_limite DATE DEFAULT NULL,
    type ENUM('devoir','exercice','projet','autre') NOT NULL,
    FOREIGN KEY (id_cahier) REFERENCES cahiers_texte(id)
);
-- Table : vacations
CREATE TABLE vacations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_enseignant INT NOT NULL,
    mois INT NOT NULL,
    annee INT NOT NULL,
    montant_brut DECIMAL(12,2) DEFAULT 0,
    montant_net DECIMAL(12,2) DEFAULT 0,
    statut ENUM('generee','signee_enseignant','visee_surveillant','approuvee_comptable') DEFAULT 'generee',
    date_generation DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_enseignant) REFERENCES enseignants(id)
);

-- Table : vacation_lignes
CREATE TABLE vacation_lignes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_vacation INT NOT NULL,
    id_creneau INT NOT NULL,
    duree_heures DECIMAL(5,2) NOT NULL,
    taux DECIMAL(10,2) NOT NULL,
    montant DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (id_vacation) REFERENCES vacations(id),
    FOREIGN KEY (id_creneau) REFERENCES creneaux(id)
);

-- Table : validations
CREATE TABLE validations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_vacation INT NOT NULL,
    id_validateur INT NOT NULL,
    role_validateur ENUM('enseignant','surveillant','comptable') NOT NULL,
    visa_base64 LONGTEXT DEFAULT NULL,
    date_validation DATETIME DEFAULT CURRENT_TIMESTAMP,
    commentaire TEXT DEFAULT NULL,
    FOREIGN KEY (id_vacation) REFERENCES vacations(id),
    FOREIGN KEY (id_validateur) REFERENCES utilisateurs(id)
);

-- Table : logs_activite
CREATE TABLE logs_activite (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_utilisateur INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    details_json JSON DEFAULT NULL,
    ip VARCHAR(50),
    date_heure DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateurs(id)
);
-- ============================================
-- DONNÉES DE DÉMONSTRATION
-- ============================================

-- Classes (minimum 3 demandées)
INSERT INTO classes (code, libelle, niveau, annee_academique) VALUES
('L1-INFO', 'Licence 1 Informatique', 'Licence 1', '2025-2026'),
('L2-INFO', 'Licence 2 Informatique', 'Licence 2', '2025-2026'),
('L3-INFO', 'Licence 3 Informatique', 'Licence 3', '2025-2026'),
('M1-INFO', 'Master 1 Informatique', 'Master 1', '2025-2026');

-- Matières
INSERT INTO matieres (code, libelle, volume_horaire_total, coefficient) VALUES
('ALGO', 'Algorithmique', 60, 3.00),
('BDD', 'Base de Données', 45, 2.50),
('WEB', 'Développement Web', 60, 3.00),
('RESEAU', 'Réseaux Informatiques', 45, 2.50),
('MATH', 'Mathématiques', 60, 3.00);

-- Enseignants (minimum 5 demandés)
INSERT INTO enseignants (matricule, nom, prenom, email, specialite, statut, taux_horaire) VALUES
('ENS001', 'KABORE', 'Aminata', 'aminata.kabore@edu.bf', 'Algorithmique', 'permanent', 5000.00),
('ENS002', 'OUEDRAOGO', 'Issouf', 'issouf.ouedraogo@edu.bf', 'Base de Données', 'vacataire', 4500.00),
('ENS003', 'TRAORE', 'Mariam', 'mariam.traore@edu.bf', 'Développement Web', 'vacataire', 4500.00),
('ENS004', 'SANKARA', 'Idrissa', 'idrissa.sankara@edu.bf', 'Réseaux', 'permanent', 5000.00),
('ENS005', 'ZONGO', 'Fatimata', 'fatimata.zongo@edu.bf', 'Mathématiques', 'vacataire', 4000.00);

-- Salles
INSERT INTO salles (code, capacite, equipements, batiment) VALUES
('A101', 50, 'Projecteur, Tableau blanc', 'Bâtiment A'),
('A102', 40, 'Projecteur', 'Bâtiment A'),
('B201', 60, 'Projecteur, Climatisation', 'Bâtiment B'),
('LABO1', 30, 'Ordinateurs, Projecteur', 'Laboratoire');

-- Utilisateurs (un par rôle)
INSERT INTO utilisateurs (email, mot_de_passe_hash, role, id_lien, actif) VALUES
('admin@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrateur', NULL, 1),
('aminata.kabore@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 1, 1),
('issouf.ouedraogo@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 2, 1),
('mariam.traore@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 3, 1),
('idrissa.sankara@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 4, 1),
('fatimata.zongo@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'enseignant', 5, 1),
('delegue.l1@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'delegue', NULL, 1),
('surveillant@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'surveillant', NULL, 1),
('comptable@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'comptable', NULL, 1),
('etudiant@edu.bf', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'etudiant', NULL, 1);
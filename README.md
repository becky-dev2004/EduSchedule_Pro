# EduSchedule Pro

Application web de gestion des emplois du temps et vacations enseignants.

## Année Universitaire 2025-2026

## Technologies utilisées
- Frontend : React 18, Bootstrap 5
- Backend : PHP 8+, API REST
- Base de données : MySQL 8
- Authentification : JWT

## Installation

### Prérequis
- WAMP Server (PHP 8+, MySQL 8)
- Node.js + npm
- Git

### Étapes

1. Cloner le dépôt
```bash
git clone https://github.com/becky-dev2004/EduSchedule_Pro.git
cd EduSchedule_Pro
```

2. Importer la base de données
- Ouvrir phpMyAdmin
- Importer le fichier `database/eduschedulepro.sql`

3. Configurer le backend
- Vérifier `backend/config/database.php`
- Modifier les identifiants MySQL si nécessaire

4. Lancer le frontend React
```bash
cd react-app
npm install
npm start
```

5. Accéder à l'application

http://localhost:3000

## Comptes de test

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| admin@edu.bf | password | Administrateur |
| delegue@edu.bf | password | Délégué |
| surveillant@edu.bf | password | Surveillant |
| comptable@edu.bf | password | Comptable |
| etudiant@edu.bf | password | Etudiant |

## Modules
1. Gestion de l'emploi du temps
2. Pointage QR-Code
3. Cahier de texte numérique
4. Fiches de vacation
5. Tableau de bord et statistiques

## Structure du projet
EduSchedule_Pro/
├── react-app/          # Frontend React
├── backend/            # Backend PHP API REST
├── database/           # Script SQL
├── frontend/           # Pages HTML statiques
└── README.md
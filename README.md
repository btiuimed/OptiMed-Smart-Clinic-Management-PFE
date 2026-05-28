import os

# Contenu du fichier README.md
readme_content = """# 🏥 OptiMed - Système Intelligent de Gestion de Clinique

**OptiMed** est une application web complète de gestion de clinique médicale, conçue dans le cadre d'un Projet de Fin d'Études (PFE). L'application se distingue par l'intégration d'un module d'analyse permettant d'optimiser la gestion des rendez-vous et d'identifier les comportements des patients (absentéisme).

---

## 🌟 Fonctionnalités Principales

### 👤 Espace Patient
* **Recherche Multicritère :** Trouver un médecin par spécialité (département).
* **Prise de Rendez-vous :** Sélection de créneaux horaires disponibles en temps réel.
* **Historique :** Consultation et gestion des rendez-vous passés et à venir.
* **Annulation :** Possibilité d'annuler un rendez-vous (avec impact sur le score de fiabilité).

### 👨‍⚕️ Espace Médecin
* **Gestion du Planning :** Vue d'ensemble des consultations quotidiennes et hebdomadaires.
* **Suivi Patient :** Consultation du motif de visite et historique du patient.
* **Mise à jour des Statuts :** Marquer les rendez-vous comme "Terminés" ou "Annulés".

### 🔑 Espace Administrateur (Dashboard)
* **Gestion des Utilisateurs :** Administration des comptes médecins et patients.
* **Gestion des Services :** Création et modification des départements médicaux.
* **Statistiques Intelligentes :** * Analyse du taux d'annulation par patient (`cancellation_count`).
    * Visualisation des pics d'affluence horaire.

---

## 🧠 Le Module "Intelligent"
Contrairement à un logiciel de gestion classique, **OptiMed** intègre une logique d'optimisation :
* **Prédiction d'absentéisme :** Le système suit le nombre d'annulations par patient pour aider la clinique à mieux gérer ses rappels de rendez-vous.
* **Analyse de flux :** Utilisation des données temporelles pour identifier les heures de forte charge.

---

## 🛠️ Stack Technique
* **Langage :** PHP 8.x
* **Base de données :** MySQL
* **Modélisation :** UML (Diagrammes de Cas d'Utilisation, Classes et Séquence)
* **Interface :** HTML5, CSS3 (Bootstrap), JavaScript
* **Architecture :** Orientée Objet (POO)

---

## 📂 Structure du Projet
```text
/optimed
├── config/             # Connexion à la base de données (db.php)
├── assets/             # Fichiers CSS, JS et images
├── includes/           # Composants réutilisables (header, footer)
├── sql/                # Script de création de la base de données
├── src/                # Logique métier (Classes PHP)
└── index.php           # Page d'accueil

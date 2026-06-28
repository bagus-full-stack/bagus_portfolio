<div align="center">
  <h1>🚀 Mon Portfolio Full-Stack</h1>
  <p><em>Un portfolio moderne, dynamique et performant avec espace d'administration intégré.</em></p>
  
  [![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)]()
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)]()
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)]()
  [![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)]()
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)]()
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

---

## 📖 À propos

🌐 **Site en production : [assami.dev](https://assami.dev)**

Ce projet est un portfolio professionnel interactif conçu pour les développeurs. Il présente non seulement vos expériences, projets et compétences au monde entier, mais il intègre également **un espace d'administration complet** vous permettant de gérer dynamiquement votre contenu sans toucher au code.

### ✨ Fonctionnalités clés

*   **🎨 Design Moderne & Réactif** : Interface UI/UX soignée avec Tailwind CSS et support complet du Thème Clair / Sombre.
*   **🤖 Chatbot IA Intégré** : Un assistant virtuel intelligent propulsé par l'API Google Gemini, avec support de la dictée vocale (Speech-to-Text).
*   **🔒 Dashboard Admin Sécurisé** : Gérez vos projets, compétences, expériences, certifications, témoignages et votre CV depuis un back-office complet (via Supabase Auth).
*   **📅 Prise de rendez-vous intégrée** : Réservation d'appels directement reliée à Google Meet et Google Calendar.
*   **📱 Support PWA (Progressive Web App)** : Application installable fonctionnant comme une application native.
*   **📄 Export de CV en PDF** : Génération automatique de votre profil au format PDF via html2canvas et jsPDF.
*   **🌐 Internationalisation (i18n)** : Support multi-langues prêt à l'emploi (Français et Anglais).
*   **🔍 Recherche Globale** : Moteur de recherche unifié pour trouver rapidement des projets, compétences ou expériences.

---

## 🛠️ Stack Technique

*   **Frontend** : React 18, Vite, TypeScript, Tailwind CSS
*   **Backend & DB** : Supabase (PostgreSQL, Auth, Storage, Edge Functions)
*   **Intégrations** : Google Calendar API, Google Meet
*   **Outils** : Lucide React (Icônes), jsPDF & html2canvas (Export PDF)

---

## 📥 Import de données (CMS Admin)

L'interface d'administration (`/admin/import`) permet d'alimenter toute la base de données en une seule opération via un fichier JSON structuré.

### Comment ça marche ?

1. **Modèle JSON (`import-template.json`)** : Un gabarit complet est fourni dans le dossier `public/`. Il définit la structure exacte attendue pour importer en masse votre profil, vos expériences, vos projets, vos compétences et vos certifications. Les champs supportent l'internationalisation (clés suffixées par `_fr` et `_en`).
2. **Validation & Sécurité** : Le module d'import vérifie rigoureusement le schéma du fichier, sa taille (max 5 Mo) et son format (`application/json`) avant de traiter les données.
3. **Mise à jour atomique** : L'importation effectue des opérations de type "upsert" (mise à jour si existant, création sinon) sur l'ensemble de votre base de données Supabase, vous évitant ainsi la saisie manuelle.

### Instructions d'accès

1. Connectez-vous à votre espace d'administration (`/admin/login`).
2. Naviguez vers l'onglet **Import** (`/admin/import`) depuis le menu latéral.
3. Cliquez sur "Télécharger le modèle JSON" pour récupérer la structure de base.
4. Complétez le fichier avec vos informations dans un éditeur de texte.
5. Glissez-déposez le fichier finalisé dans la zone d'import pour synchroniser votre portfolio instantanément.

### Fonctionnalités

- **Upload drag-and-drop** du fichier JSON
- **Validation** du format avant import
- **Aperçu** du nombre d'items détectés par section
- **Sélection** des sections à importer
- **Deux stratégies** : Fusionner ou Remplacer
- **Rapport détaillé** après import (succès / erreurs par item)

---

### Format JSON requis

Le fichier doit respecter ce format exact. Toutes les sections sont optionnelles — importer uniquement ce dont vous avez besoin.

> ⬇️ **[Télécharger le template JSON](https://assami.dev/import-template.json)**

```json
{
  "version": "1.0",
  "exportDate": "2026-06-28T00:00:00.000Z",

  "profile": {
    "name": "Assami Baga",
    "title_fr": "Full Stack & AI Engineer",
    "title_en": "Full Stack & AI Engineer",
    "bio_short_fr": "Bio courte en français (200 chars max)",
    "bio_short_en": "Short bio in English (200 chars max)",
    "bio_full_fr": "Biographie complète en français...",
    "bio_full_en": "Full biography in English...",
    "location": "Île-de-France, France",
    "email": "email@exemple.com",
    "linkedin_url": "https://linkedin.com/in/profil",
    "github_url": "https://github.com/username",
    "calendly_url": "https://calendly.com/lien"
  },

  "experiences": [
    {
      "type": "pro",
      "title_fr": "Développeur Full Stack",
      "title_en": "Full Stack Developer",
      "organization_fr": "Nom de l'entreprise",
      "organization_en": "Company name",
      "location": "Île-de-France",
      "start_date": "2024-09",
      "end_date": null,
      "description_fr": "Description du poste en français...",
      "description_en": "Job description in English...",
      "stack": ["React", "TypeScript", "Supabase"]
    },
    {
      "type": "education",
      "title_fr": "Bac+5 Ingénierie Informatique",
      "title_en": "Master's Degree in Computer Science",
      "organization_fr": "Nom de l'école",
      "organization_en": "School name",
      "location": "France",
      "start_date": "2021-09",
      "end_date": "2026-09",
      "description_fr": "Description de la formation...",
      "description_en": "Program description...",
      "stack": []
    }
  ],

  "projects": [
    {
      "slug": "nom-du-projet",
      "title_fr": "Nom du projet en français",
      "title_en": "Project name in English",
      "description_fr": "Description courte en français (200 chars max)",
      "description_en": "Short description in English (200 chars max)",
      "cover_image": "https://url-de-limage.com/cover.png",
      "stack": ["FastAPI", "React", "PyTorch"],
      "context_fr": "Contexte complet du projet en français...",
      "context_en": "Full project context in English...",
      "technical_choices": [
        {
          "choice": "FastAPI",
          "reason": "Performance et typage Python natif"
        },
        {
          "choice": "Supabase",
          "reason": "Backend as a Service avec RLS intégré"
        }
      ],
      "challenges_fr": [
        "Premier défi rencontré",
        "Deuxième défi rencontré"
      ],
      "challenges_en": [
        "First challenge encountered",
        "Second challenge encountered"
      ],
      "results": [
        {
          "metric": "Précision modèle",
          "value": "94.2%"
        },
        {
          "metric": "Temps d'inférence",
          "value": "340ms"
        }
      ],
      "github_url": "https://github.com/username/repo",
      "live_url": "https://demo.exemple.com",
      "status": "production",
      "architecture_nodes": [
        {
          "id": "frontend",
          "label": "React Frontend",
          "tech": "TypeScript · Vite",
          "x": 15,
          "y": 50
        },
        {
          "id": "api",
          "label": "FastAPI Backend",
          "tech": "Python · Pydantic",
          "x": 50,
          "y": 50
        },
        {
          "id": "db",
          "label": "Supabase",
          "tech": "PostgreSQL · RLS",
          "x": 85,
          "y": 50
        }
      ],
      "architecture_edges": [
        {
          "from": "frontend",
          "to": "api",
          "label": "HTTP/JSON"
        },
        {
          "from": "api",
          "to": "db",
          "label": "SQL"
        }
      ]
    }
  ],

  "skills": [
    { "name": "React",
      "name_fr": "React",
      "name_en": "React",
      "category": "Frontend" },
    { "name": "TypeScript",
      "name_fr": "TypeScript",
      "name_en": "TypeScript",
      "category": "Frontend" },
    { "name": "FastAPI",
      "name_fr": "FastAPI",
      "name_en": "FastAPI",
      "category": "Backend" },
    { "name": "PyTorch",
      "name_fr": "PyTorch",
      "name_en": "PyTorch",
      "category": "IA-ML" },
    { "name": "Docker",
      "name_fr": "Docker",
      "name_en": "Docker",
      "category": "DevOps" },
    { "name": "Flutter",
      "name_fr": "Flutter",
      "name_en": "Flutter",
      "category": "Mobile" }
  ],

  "certifications": [
    {
      "name_fr": "Nom de la certification",
      "name_en": "Certification name",
      "issuer_fr": "Organisme émetteur",
      "issuer_en": "Issuing organization",
      "date": "2024-03",
      "verify_url": "https://lien-verification.com"
    }
  ],

  "testimonials": [
    {
      "quote_fr": "Témoignage en français. Assami est...",
      "quote_en": "Testimonial in English. Assami is...",
      "author_name": "Jean Dupont",
      "author_role_fr": "Tech Lead",
      "author_role_en": "Tech Lead",
      "author_company": "Entreprise XYZ",
      "linkedin_url": "https://linkedin.com/in/profil",
      "order": 0
    }
  ]
}
```

---

### Règles de validation

| Champ | Type | Requis | Contrainte |
| :--- | :--- | :--- | :--- |
| `version` | string | ✅ | Doit être `"1.0"` |
| `experiences[].type` | string | ✅ | `"pro"` ou `"education"` |
| `experiences[].start_date` | string | ✅ | Format `"YYYY-MM"` |
| `experiences[].end_date` | string \| null | ✅ | `null` si poste actuel |
| `projects[].slug` | string | ✅ | Unique, minuscules, tirets |
| `projects[].status` | string | ✅ | `"production"`, `"beta"`, `"archived"` ou `"conception"` |
| `certifications[].verify_url` | string | ✅ | URL valide |
| `testimonials[].linkedin_url` | string | ✅ | URL LinkedIn valide |
| `architecture_nodes[].x` | number | ✅ | Entre 0 et 100 (%) |
| `architecture_nodes[].y` | number | ✅ | Entre 0 et 100 (%) |

### Stratégies d'import

| Stratégie | Comportement |
| :--- | :--- |
| **Fusionner** | Ajoute les nouveaux items sans toucher à l'existant. Les projets avec le même `slug` sont mis à jour. |
| **Remplacer** | Vide la section sélectionnée puis réimporte. **Irréversible** — faire une sauvegarde avant. |

### Valeurs acceptées par champ

### Notes importantes

> ⚠️ **Champs bilingues** : Pour chaque champ traduisible, fournir la version `_fr` ET `_en`. Si la version `_en` est absente, le contenu français sera affiché en fallback pour les visiteurs anglophones.

> 💡 **Images** : Le champ `cover_image` accepte une URL externe. Pour utiliser Supabase Storage, uploader l'image d'abord via `/admin/media` puis coller l'URL publique dans le JSON.

> 🔒 **Sécurité** : L'import est réservé aux comptes admin authentifiés. Aucune donnée sensible (mots de passe, tokens) ne doit figurer dans le fichier JSON.

---

### Exemple minimal fonctionnel

Pour tester rapidement l'import avec le strict minimum requis :

```json
{
  "version": "1.0",
  "exportDate": "2026-06-28T00:00:00.000Z",
  "projects": [
    {
      "slug": "mon-projet",
      "title_fr": "Mon Premier Projet",
      "title_en": "My First Project",
      "description_fr": "Description courte.",
      "description_en": "Short description.",
      "stack": ["React", "TypeScript"],
      "status": "production",
      "github_url": "https://github.com/user/repo"
    }
  ]
}
```

---

## 🚀 Prérequis

Avant de commencer, assurez-vous d'avoir installé sur votre machine locale :

*   [Node.js](https://nodejs.org/) (version 18+)
*   [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
*   Un compte [Supabase](https://supabase.com/) pour héberger la base de données
*   Un projet sur [Google Cloud Console](https://console.cloud.google.com/) (pour l'API Google Calendar/Meet)

---

## ⚙️ Installation

**1. Cloner le dépôt**
```bash
git clone https://github.com/votre-nom/votre-portfolio.git
cd votre-portfolio
```

**2. Installer les dépendances**
```bash
npm install
# ou
yarn install
```

**3. Configuration des variables d'environnement**
Créez un fichier `.env` à la racine du projet et ajoutez vos variables Supabase :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

**4. Démarrer le serveur de développement**
```bash
npm run dev
# ou
yarn dev
```
L'application sera accessible sur `http://localhost:3000` (ou le port spécifié par votre environnement).

---

## 🔧 Configuration Supabase

1.  **Base de données** : Exécutez vos scripts SQL initiaux pour créer les tables nécessaires (`profiles`, `projects`, `experiences`, `skills`, `certifications`).
2.  **Storage** : Créez les buckets `avatars` (public) et `cv` (privé).
3.  **Edge Functions** : Déployez les fonctions Serverless (ex. `meet` pour la création des événements Calendar/Meet).
    ```bash
    supabase functions deploy meet
    ```
4.  **Secrets Edge Functions** : Configurez les identifiants d'API Google dans les secrets Supabase.
    ```bash
    supabase secrets set GOOGLE_CREDENTIALS='{"type": "service_account", ...}'
    supabase secrets set GOOGLE_CALENDAR_ID='votre_id_calendrier@group.calendar.google.com'
    supabase secrets set OWNER_EMAIL='votre_email@gmail.com'
    ```

---

## 🔒 Accès à l'Administration

Le portfolio intègre un espace d'administration sécurisé pour gérer dynamiquement votre contenu (projets, expériences, compétences, etc.).

*   **Page de connexion (Login)** : Accédez à `/admin/login` pour vous authentifier.
*   **Tableau de bord principal** : Accédez à `/admin` pour gérer votre contenu. (Si vous n'êtes pas connecté, vous serez automatiquement redirigé vers `/admin/login`).

---

## 🤝 Comment contribuer ?

Les contributions, signalements de bugs (issues), et demandes de fonctionnalités (feature requests) sont les bienvenues ! 

Si vous souhaitez contribuer au projet, voici la marche à suivre :

1.  **Forkez** le projet sur GitHub.
2.  **Créez** une branche pour votre fonctionnalité ou votre correctif (`git checkout -b feature/NouvelleFonctionnalite`).
3.  **Committez** vos changements en ajoutant des descriptions claires (`git commit -m 'Ajout d'une nouvelle fonctionnalité X'`).
4.  **Pushez** votre branche sur votre fork (`git push origin feature/NouvelleFonctionnalite`).
5.  **Ouvrez** une Pull Request sur ce dépôt. Nous l'examinerons avec plaisir !

---

## 📝 Licence

Ce projet est distribué sous licence **MIT**. Vous êtes libre de l'utiliser, de le modifier et de le distribuer. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---
<div align="center">
  <p>Fait avec ❤️</p>
</div>

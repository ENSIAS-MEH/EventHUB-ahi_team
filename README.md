# EventHub — Plateforme de Réservation d'Événements

Projet développé par l'équipe **AHI** dans le cadre de la formation à l'ENSIAS.

Application web full-stack permettant la découverte, la recherche et la réservation d'événements culturels (cinéma, théâtre, concerts, voyages).

---

## Architecture

```
development-platform-ahi_team/
├── backend/
│   ├── eureka-server/       # Annuaire de services (Service Discovery)
│   ├── auth-service/        # Microservice d'authentification
│   ├── event-service/       # Microservice de gestion des événements
│   └── booking-service/     # Microservice de réservation
├── eventhub-infrastructure/
│   ├── docker-compose.yml   # Orchestration de tous les services
│   └── init.sql             # Initialisation des bases de données
└── frontend/                # Application React (Vite + Tailwind CSS)
```

Architecture **microservices** : chaque service est indépendant, possède sa propre base de données, et s'enregistre auprès du serveur Eureka. Le frontend React consomme les APIs REST exposées par chaque service.

```
Frontend React :5173
    │
    ├── Auth Service    :8081  (db_auth)
    ├── Event Service   :8082  (db_event)
    └── Booking Service :8083  (db_booking)
                │
                └── Eureka Server :8761  (annuaire)
```

---

## Stack Technique

| Couche         | Technologie                                        |
|----------------|----------------------------------------------------|
| Frontend       | React 18, React Router 7, Vite 5                  |
| Styles         | Tailwind CSS 3, Framer Motion                     |
| Backend        | Java 17, Spring Boot 3.2                          |
| Microservices  | Spring Cloud Netflix Eureka, OpenFeign             |
| Sécurité       | Spring Security, BCrypt                            |
| Persistance    | Spring Data JPA / Hibernate, MySQL 8              |
| Upload fichiers| Spring Multipart, volumes Docker                  |
| Déploiement    | Docker, Docker Compose                            |
| Build          | Maven (backend), npm (frontend)                   |

---

## Prérequis

- **Docker Desktop** (recommandé — lance tout automatiquement)
- Node.js 18+ et npm (pour le frontend uniquement)
- Java 17+ et Maven 3.8+ (seulement si vous lancez sans Docker)

---

## Lancement avec Docker (recommandé)

### 1. Compiler les microservices

```bash
cd backend/eureka-server  && ./mvnw package -DskipTests && cd ../..
cd backend/auth-service   && ./mvnw package -DskipTests && cd ../..
cd backend/event-service  && ./mvnw package -DskipTests && cd ../..
cd backend/booking-service && ./mvnw package -DskipTests && cd ../..
```

### 2. Lancer tous les services

```bash
cd eventhub-infrastructure
docker compose up --build
```

### 3. Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

## Services et ports

| Service          | URL                        | Description                        |
|------------------|----------------------------|------------------------------------|
| Frontend         | http://localhost:5173      | Interface utilisateur React        |
| Eureka Dashboard | http://localhost:8761      | Annuaire des microservices         |
| Auth Service     | http://localhost:8081      | Inscription / Connexion            |
| Event Service    | http://localhost:8082      | Gestion des événements + uploads   |
| Booking Service  | http://localhost:8083      | Réservations                       |
| MySQL            | localhost:3306             | Base de données                    |

---

## APIs

### Auth Service — `http://localhost:8081`

| Méthode | Endpoint              | Description  |
|---------|-----------------------|--------------|
| POST    | `/api/auth/register`  | Inscription  |
| POST    | `/api/auth/login`     | Connexion    |

**Inscription**
```json
POST /api/auth/register
{
  "nom": "Alice Dupont",
  "email": "alice@example.com",
  "password": "motdepasse"
}
```

**Connexion** — retourne `userId`, `nom`, `email`, `role`
```json
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "motdepasse"
}
```

---

### Event Service — `http://localhost:8082`

| Méthode | Endpoint                    | Description                        |
|---------|-----------------------------|------------------------------------|
| GET     | `/api/events`               | Lister tous les événements         |
| GET     | `/api/events/{id}`          | Détail d'un événement              |
| POST    | `/api/events`               | Créer un événement                 |
| PUT     | `/api/events/{id}`          | Modifier un événement              |
| DELETE  | `/api/events/{id}`          | Supprimer un événement             |
| PUT     | `/api/events/{id}/decrement`| Décrémenter les places disponibles |
| POST    | `/api/upload/image`         | Upload d'une image (multipart)     |

**Créer un événement**
```json
POST /api/events
{
  "titre": "Concert Premium",
  "categorie": "Concert",
  "description": "Une soirée inoubliable.",
  "lieu": "Casablanca, Morocco Mall",
  "date": "2026-06-15",
  "prix": 250.0,
  "placesDisponibles": 200,
  "imageUrl": "http://localhost:8082/uploads/mon-image.jpg"
}
```

**Upload image**
```
POST /api/upload/image
Content-Type: multipart/form-data
file: <fichier image>

→ { "url": "http://localhost:8082/uploads/uuid.jpg" }
```

---

### Booking Service — `http://localhost:8083`

| Méthode | Endpoint                       | Description                      |
|---------|--------------------------------|----------------------------------|
| POST    | `/api/bookings`                | Créer une réservation            |
| GET     | `/api/bookings`                | Toutes les réservations          |
| GET     | `/api/bookings/user/{userId}`  | Réservations d'un utilisateur    |
| PUT     | `/api/bookings/{id}/confirmer` | Confirmer une réservation        |
| PUT     | `/api/bookings/{id}/annuler`   | Annuler une réservation          |

**Créer une réservation**
```json
POST /api/bookings
{
  "userId": 1,
  "eventId": 3,
  "nombrePlaces": 2
}
```

---

## Fonctionnalités

### Frontend connecté au backend

- **Inscription / Connexion** réelles via auth-service
- **Chargement des événements** depuis event-service (fallback données statiques si vide)
- **Réservation** connectée au booking-service avec modal de confirmation
- **Upload d'image** avec aperçu et glisser-déposer lors de la création d'événement
- **Dashboard utilisateur** :
  - Réservations réelles avec statut (EN_ATTENTE / CONFIRMEE / ANNULEE)
  - Téléchargement de ticket avec le vrai nom de l'événement
  - Création d'événement publiée directement dans la base de données
  - Favoris persistants en session
- Filtrage par catégorie, ville et période
- Recherche instantanée
- Dark theme avec animations Framer Motion

---

## Structure du frontend

```
frontend/src/
├── api/
│   └── api.js              # Appels vers les 3 microservices
├── context/
│   └── AuthContext.jsx     # État auth global (localStorage)
├── components/
│   ├── Header.jsx          # Header avec auth réelle
│   ├── EventCard.jsx       # Carte événement
│   ├── EventGrid.jsx       # Grille d'événements
│   ├── FeaturedEvents.jsx  # Carrousel événements à la une
│   ├── FilterModal.jsx     # Filtres avancés
│   ├── SecondaryNav.jsx    # Navigation par catégorie
│   ├── Footer.jsx
│   └── Logo.jsx
├── pages/
│   ├── AuthPage.jsx        # Login / Inscription
│   ├── HomePage.jsx        # Page d'accueil
│   ├── EventDetailsPage.jsx # Détail + réservation
│   └── DashboardPage.jsx   # Espace utilisateur
└── data/
    └── events.js           # Données statiques de fallback
```

---

## Configuration Docker

Les variables d'environnement sont injectées par `docker-compose.yml` et surchargent les `application.properties` :

| Variable                            | Valeur Docker                                          |
|-------------------------------------|--------------------------------------------------------|
| `SPRING_DATASOURCE_URL`             | `jdbc:mysql://mysql-server:3306/db_xxx?...`           |
| `SPRING_DATASOURCE_USERNAME`        | `root`                                                 |
| `SPRING_DATASOURCE_PASSWORD`        | `rootpassword`                                         |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | `http://eureka-server:8761/eureka/`               |
| `UPLOAD_DIR`                        | `/app/uploads`                                         |
| `UPLOAD_BASE_URL`                   | `http://localhost:8082`                                |

Les images uploadées sont persistées dans un volume Docker nommé `event-uploads`.

---

## Équipe

Projet réalisé par l'équipe **AHI** — ENSIAS 2A

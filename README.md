# EventHub — Plateforme de Réservation d'Événements

Projet développé par l'équipe **AHI** dans le cadre de la formation à l'ENSIAS.

Application web full-stack permettant la découverte, la recherche et la réservation d'événements culturels (cinéma, théâtre, concerts, voyages).

---

## Architecture

```
development-platform-ahi_team/
├── backend/
│   └── auth-service/        # Microservice d'authentification (Spring Boot)
└── frontend/                # Application React (Vite + Tailwind CSS)
```

Architecture microservices : le backend expose une API REST consommée par le frontend React.

---

## Stack Technique

| Couche      | Technologie                              |
|-------------|------------------------------------------|
| Frontend    | React 18, React Router 7, Vite 5        |
| Styles      | Tailwind CSS 3, Framer Motion           |
| Backend     | Java 17, Spring Boot 3.2                |
| Sécurité    | Spring Security, BCrypt                 |
| Persistance | Spring Data JPA / Hibernate, MySQL 8    |
| Build       | Maven (backend), npm (frontend)         |

---

## Prérequis

- Java 17+
- Maven 3.8+
- Node.js 18+ et npm
- MySQL 8+

---

## Lancement du projet

### 1. Base de données

Démarrez MySQL et créez la base (elle sera auto-créée au premier lancement) :

```sql
CREATE DATABASE IF NOT EXISTS db_auth;
```

### 2. Backend — Auth Service

```bash
cd backend/auth-service
mvn spring-boot:run
```

Le service démarre sur **http://localhost:8081**

> Configurez vos identifiants MySQL dans `backend/auth-service/src/main/resources/application.properties` si nécessaire.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est accessible sur **http://localhost:5173**

---

## API Auth Service

| Méthode | Endpoint              | Description         |
|---------|-----------------------|---------------------|
| POST    | `/api/auth/register`  | Inscription         |
| POST    | `/api/auth/login`     | Connexion           |

### Exemple — Inscription

```json
POST /api/auth/register
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "motdepasse"
}
```

### Exemple — Connexion

```json
POST /api/auth/login
{
  "email": "alice@example.com",
  "password": "motdepasse"
}
```

---

## Fonctionnalités Frontend

- Parcourir les événements par catégorie (Cinéma, Théâtre, Concert, Voyage)
- Filtrer par ville et par période
- Recherche d'événements
- Page de détail d'un événement
- Tableau de bord utilisateur (événements sauvegardés)
- Interface dark theme avec animations

---

## Configuration

**`backend/auth-service/src/main/resources/application.properties`**

```properties
server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/db_auth?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
```

---

## Équipe

Projet réalisé par l'équipe **AHI** — ENSIAS 2A

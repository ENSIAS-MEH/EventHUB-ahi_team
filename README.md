# EventHub — Plateforme de Réservation d'Événements
---
 
## Table des matières
 
1. [Équipe](#équipe)
2. [Introduction](#introduction)
3. [Exigences fonctionnelles et non-fonctionnelles](#exigences)
4. [Acteurs et rôles](#acteurs)
5. [Stack Technique](#stack-technique)
6. [Architecture](#architecture)
7. [Sécurité](#sécurité)
8. [APIs](#apis)
9. [Fonctionnalités](#fonctionnalités)
10. [Déploiement Docker](#déploiement-docker)
11. [Infrastructure Cloud (Terraform)](#infrastructure-cloud)
12. [Déploiement Kubernetes](#kubernetes)
13. [Configuration Docker](#configuration-docker)
14. [Structure du frontend](#structure-du-frontend)
15. [Défis rencontrés](#défis)
16. [Conclusion](#conclusion)
---
## Équipe
 
Projet réalisé par l'équipe **AHI** — ENSIAS 2A 2025–2026
 
| Membre | 
|--------|
| Anas el midaoui 
| Hafsa hounaoui |
| Ihssan ben labsir |
 
---
 
## Introduction
**EventHub** est une plateforme moderne de billetterie en ligne construite selon une architecture **microservices**. Elle permet aux utilisateurs de découvrir des événements culturels, de réserver des billets en ligne, et aux annonceurs de publier et gérer leurs événements avec des statistiques en temps réel.
 
Le projet couvre l'ensemble du cycle de développement : de la conception à la mise en production via Docker, Kubernetes et une infrastructure cloud définie avec Terraform.

---
## Exigences
 
### Fonctionnelles
- Inscription et connexion des utilisateurs avec JWT
- Consultation de la liste des événements
- Réservation de billets avec choix de catégorie (VIP, Standard, etc.)
- Création et gestion d'événements par les annonceurs
- Upload d'images pour les événements
- Dashboard utilisateur : réservations, favoris, annonces publiées
- Statistiques par annonce : tickets vendus, places restantes, taux de remplissage
- Téléchargement de tickets au format texte
### Non-Fonctionnelles
- **Scalabilité** : architecture microservices, 2 replicas pour le booking-service
- **Disponibilité** : Service Discovery via Eureka, restart automatique Docker
- **Sécurité** : JWT, BCrypt, Spring Security, CORS configuré
- **Performance** : HikariCP pour le connection pooling
- **Maintenabilité** : code découplé, repositories Spring Data JPA
### User Stories (quelques un)
- *En tant que client*, je veux m'inscrire avec mon email pour accéder à la plateforme.
- *En tant que client*, je veux réserver des billets d'un événement en choisissant ma catégorie de place.
- *En tant qu'annonceur*, je veux publier un événement avec des catégories de billets et voir les statistiques de vente.
- *En tant qu'annonceur*, je veux voir le nombre de places restantes et le taux de remplissage de mes annonces.
- *En tant qu'admin*, je peux approuvé un événement.
---

## Acteurs
 
| Acteur | Rôle |
|--------|------|
| **Client** | S'inscrit, se connecte, consulte les événements, réserve des billets |
| **Annonceur/organisateur** | Crée des événements, upload des images, consulte ses statistiques |
| **Administrateur** | Gère les utilisateurs via `/api/admin/users` |
---
## Diagrammes d'architecture

<div style="display: flex; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
  <div style="flex: 1; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 10px;">
    <h3 style="margin-top: 0;">📊 Diagramme de classes</h3>
    <img width="273" height="326" alt="Diagramme de classes" src="https://github.com/user-attachments/assets/f46ca7cc-3de2-4154-917f-30e403823557" />
    <p><em>Structure statique des entités : Event, User, Booking, Category</em></p>
  </div>
  
  <div style="flex: 1; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 10px;">
    <h3 style="margin-top: 0;">👥 Diagramme de cas d'utilisation</h3>
    <img width="191" height="329" alt="Diagramme de cas d'utilisation" src="https://github.com/user-attachments/assets/1163f119-a454-4dfe-ba65-340240fe7d22" />
    <p><em>Interactions entre acteurs (Client, Annonceur, Admin) et fonctionnalités</em></p>
  </div>
</div>

---
 ---
## Stack Technique
 
| Couche | Technologie |
|--------|-------------|
| Frontend | React 18, React Router 7, Vite 5 |
| Styles | Tailwind CSS 3, Framer Motion |
| Backend | Java 17, Spring Boot 3.2 / 4.0 |
| Microservices | Spring Cloud Netflix Eureka, OpenFeign |
| API Gateway | Spring Cloud Gateway MVC |
| Sécurité | Spring Security, BCrypt, JWT (JJWT 0.12.6) |
| Persistance | Spring Data JPA / Hibernate, MySQL 8 |
| Connection Pool | HikariCP |
| Upload fichiers | Spring Multipart, volumes Docker |
| Conteneurisation | Docker, Docker Compose |
| Orchestration | Kubernetes (Minikube) |
| Infrastructure Cloud | Terraform (AWS : VPC, EKS, RDS MySQL) |
| Build | Maven (backend), npm (frontend) |
| Versioning | Git, GitHub |

---
 
## Architecture
 
```
development-platform-ahi_team/
├── backend/
│   ├── eureka-server/       # Annuaire de services (Service Discovery)
│   ├── api-gateway/         # API Gateway (port 8084)
│   ├── auth-service/        # Microservice d'authentification (port 8081)
│   ├── event-service/       # Microservice de gestion des événements (port 8082)
│   └── booking-service/     # Microservice de réservation (port 8083)
├── eventhub-infrastructure/
│   ├── docker-compose.yml   # Orchestration de tous les services
│   └── init.sql             # Initialisation des bases de données
├── frontend/                # Application React (Vite + Tailwind CSS)
├── k8s/
│   └── eventhub-k8s.yaml    # Manifestes Kubernetes
└── Terraform/
    └── main.tf              # Infrastructure AWS (VPC, EKS, RDS)
```
 
### Flux de communication
 
```
Navigateur (localhost:9090 / localhost:80)
    │
    └── API Gateway :8084
            │
            ├── Auth Service    :8081  (db_auth)
            ├── Event Service   :8082  (db_event)   ← Feign Client
            └── Booking Service :8083  (db_booking) ─────────────┘
                        │
                        └── Eureka Server :8761  (Service Discovery)
```


### Design Patterns appliqués

- **Repository Pattern** : `JpaRepository` pour chaque entité
- **DTO Pattern** : `AuthResponse`, `RegisterRequest`
- **Facade Pattern** : API Gateway comme point d'entrée unique
- **Observer Pattern** : Eureka heartbeat pour la disponibilité des services
- **SOLID** : chaque service a une responsabilité unique


---
## Sécurité
 
- **Mots de passe** : hashés avec **BCrypt** (jamais stockés en clair)
- **Authentification** : **JWT** généré par `JwtService` (JJWT 0.12.6)
- **Filtres** : `JwtFilter` dans event-service et booking-service pour valider le token
- **Autorisation** : Spring Security avec `SecurityFilterChain`, `@PreAuthorize`
- **CORS** : configuré dans `CorsConfig.java` du gateway
- **Requêtes paramétrées** : Spring Data JPA (protection contre les injections SQL)
- **Rôles** : `ROLE_CLIENT`, `ROLE_ADMIN`
- **Validation** : Bean Validation (`@Valid`) sur les requêtes entrantes

---

## Services et ports
 
| Service | URL | Description |
|---------|-----|-------------|
| Frontend (Docker) | http://localhost:80 | Interface utilisateur React |
| Frontend (Dev) | http://localhost:5173 | Développement avec Vite |
| API Gateway | http://localhost:8084 | Point d'entrée unique |
| Eureka Dashboard | http://localhost:8761 | Annuaire des microservices |
| Auth Service | http://localhost:8081 | Inscription / Connexion |
| Event Service | http://localhost:8082 | Gestion des événements + uploads |
| Booking Service | http://localhost:8083 | Réservations |
| MySQL | localhost:3306 | Base de données |


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
 
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/events` | Lister tous les événements |
| GET | `/api/events/{id}` | Détail d'un événement |
| GET | `/api/events/annonceur/{userId}` | Événements d'un annonceur |
| POST | `/api/events` | Créer un événement |
| PUT | `/api/events/{id}` | Modifier un événement |
| DELETE | `/api/events/{id}` | Supprimer un événement |
| PUT | `/api/events/{id}/decrement?nombre=N` | Décrémenter N places |
| POST | `/api/upload/image` | Upload d'une image (multipart) |
 
**Créer un événement**
```json
POST /api/events
{
  "annonceurId": 1,
  "titre": "Concert Premium",
  "categorie": "Concert",
  "description": "Une soirée inoubliable.",
  "lieu": "Casablanca, Morocco Mall",
  "date": "2026-06-15",
  "prix": 250.0,
  "placesDisponibles": 300,
  "imageUrl": "http://localhost:8082/uploads/mon-image.jpg"
}
```
 
---


**Upload image**
```
POST /api/upload/image
Content-Type: multipart/form-data
file: <fichier image>

→ { "url": "http://localhost:8082/uploads/uuid.jpg" }
```

---
### Booking Service — `http://localhost:8083`
 
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/bookings` | Créer une réservation |
| GET | `/api/bookings` | Toutes les réservations |
| GET | `/api/bookings/user/{userId}` | Réservations d'un utilisateur |
| GET | `/api/bookings/event/{eventId}` | Réservations d'un événement |
| PUT | `/api/bookings/{id}/confirmer` | Confirmer une réservation |
| PUT | `/api/bookings/{id}/annuler` | Annuler une réservation |
 
**Créer une réservation**
```json
POST /api/bookings
{
  "userId": 1,
  "eventId": 3,
  "nombrePlaces": 2
}
```
 
**Flux de réservation :**
1. Le client envoie `POST /api/bookings`
2. Booking Service sauvegarde avec statut `EN_ATTENTE`
3. Booking Service appelle Event Service via **Feign Client** : `PUT /api/events/{id}/decrement?nombre=2`
4. Event Service décrémente les places disponibles
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
## Déploiement Docker
### Prérequis
- Docker et Docker Compose installés
- Java 17+ et Maven 3.8+
- Node.js 18+ et npm

## Configuration Docker

### Lancement (recommandé)
 
```bash
# 1. Cloner le projet
git clone https://github.com/ENSIAS-MEH/development-platform-ahi_team.git
cd development-platform-ahi_team
 
# 2. Compiler tous les services
cd backend/auth-service    && mvn clean package -DskipTests && cd ../..
cd backend/event-service   && mvn clean package -DskipTests && cd ../..
cd backend/booking-service && mvn clean package -DskipTests && cd ../..
cd backend/eureka-server   && mvn clean package -DskipTests && cd ../..
cd backend/api-gateway     && mvn clean package -DskipTests && cd ../..
 
# 3. Lancer tous les services
cd eventhub-infrastructure
docker compose up -d --build
 
# 4. Vérifier
docker compose ps
```
 
L'application est accessible sur **http://localhost**
 
### Après un git pull (mise à jour d'équipe)
 
```
bash
cd eventhub-infrastructure
docker compose down -v
# Recompiler les services modifiés
docker compose up -d --build
```
---
## Infrastructure Cloud (Terraform)
 
L'infrastructure AWS est définie dans `Terraform/main.tf` :
 
- **VPC** avec 2 sous-réseaux (région Paris `eu-west-3`)
- **Cluster Kubernetes EKS** : `eventhub-k8s-cluster`
- **Base de données RDS MySQL 8.0** : instance `db.t3.micro`
```
bash
cd Terraform
terraform init   # Initialise les providers (hashicorp/aws v6.49.0)
terraform plan   # Affiche le plan de déploiement
terraform apply  # Déploie sur AWS (nécessite credentials AWS)
```
---
## Kubernetes
 
Déploiement local via **Minikube** :
 
```bash
# Démarrer Minikube
minikube start --driver=docker
 
# Déployer tous les services
kubectl apply -f k8s/eventhub-k8s.yaml
 
# Vérifier les pods
kubectl get pods
kubectl get services
 
# Accéder au frontend
kubectl port-forward service/eventhub-frontend 8080:80
kubectl port-forward service/api-gateway 8084:8084
```
 
**Services déployés :**
 
| Pod | Replicas | Image |
|-----|----------|-------|
| mysql | 1 | hafsaaa22/eventhub-mysql:v1.0 |
| eureka-server | 1 | hafsaaa22/eureka-server:latest |
| auth-service | 1 | hafsaaa22/auth-service:latest |
| event-service | 1 | hafsaaa22/event-service:latest |
| booking-service | **2** | hafsaaa22/booking-service:latest |
| frontend | 1 | hafsaaa22/eventhub-frontend:latest |
| api-gateway | 1 | hafsaaa22/api-gateway:latest |
 
---
## Configuration Docker
 
| Variable | Valeur |
|----------|--------|
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://mysql-server:3306/db_xxx?...` |
| `SPRING_DATASOURCE_USERNAME` | `root` |
| `SPRING_DATASOURCE_PASSWORD` | `rootpassword` |
| `EUREKA_CLIENT_SERVICEURL_DEFAULTZONE` | `http://eureka-server:8761/eureka/` |
| `UPLOAD_DIR` | `/app/uploads` |
| `UPLOAD_BASE_URL` | `http://localhost:8082` |
| `JWT_SECRET` | Variable d'environnement sécurisée |
---
## Structure du frontend

```
frontend/src/
├── api/
│   └── api.js                # Appels vers les microservices via API Gateway
├── context/
│   └── AuthContext.jsx       # État auth global (localStorage + JWT)
├── components/
│   ├── Header.jsx
│   ├── EventCard.jsx
│   ├── EventGrid.jsx
│   ├── FeaturedEvents.jsx
│   ├── FilterModal.jsx
│   ├── SecondaryNav.jsx
│   ├── Footer.jsx
│   └── Logo.jsx
├── pages/
│   ├── AuthPage.jsx           # Login / Inscription
│   ├── HomePage.jsx           # Page d'accueil
│   ├── EventDetailsPage.jsx   # Détail + réservation avec choix de catégorie
│   └── DashboardPage.jsx      # Espace utilisateur complet
└── data/
    └── events.js              # Données statiques de fallback
```
---
## Défis rencontrés

- **Conflits Git entre membres** : résolution via merge manuel des fichiers en conflit
- **Double décrémentation des places** : bug corrigé dans le Feign Client — passage du paramètre `nombrePlaces` au lieu d'une décrémentation fixe de 1
- **Doublon de champ** dans `Event.java` après merge : champ `annonceurId` dupliqué supprimé
- **Synchronisation des services** dans Kubernetes : certains services démarraient avant MySQL, résolu avec `kubectl rollout restart`
- **CORS entre frontend et API Gateway** : `CorsConfig.java` mis à jour pour inclure les origines frontend
- **Compatibilité Terraform** : installation manuelle du binaire sur Ubuntu 25.04 (repo HashiCorp incompatible avec cette version)

---
## Conclusion
 
Le projet EventHub démontre une architecture microservices complète allant du développement à la mise en production. Chaque membre de l'équipe a pris en charge des services spécifiques avec une intégration continue via GitHub.
 
Les points clés réalisés :
- Architecture microservices avec Service Discovery (Eureka)
- Sécurité JWT + BCrypt + Spring Security
- Déploiement Docker Compose (production) et Kubernetes (orchestration)
- Infrastructure Cloud décrite avec Terraform (AWS)
- Frontend React complet avec dashboard statistiques en temps réel

## Équipe

Projet réalisé par l'équipe **AHI: anas el midaoui,hafsa hounaoui,ihssan ben labsir** 
— ENSIAS 2A
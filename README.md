# Food Delivery & Ordering Platform (Full-Stack + Kubernetes)

A production-grade, enterprise-ready full-stack Food Delivery and Ordering application built with **Spring Boot 3**, **React 18**, **MySQL 8.0**, **Redis 7**, **Docker**, and deployed with high availability on **Kubernetes**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [High-Level Architecture](#high-level-architecture)
3. [Technology Stack](#technology-stack)
4. [Application Features & Role-Based Access](#application-features--role-based-access)
5. [Database Architecture & Schema Design](#database-architecture--schema-design)
6. [Redis Caching Flow](#redis-caching-flow)
7. [Project Directory Structure](#project-directory-structure)
8. [Local Development with Docker Compose](#local-development-with-docker-compose)
9. [Kubernetes Architecture & Manifests](#kubernetes-architecture--manifests)
10. [Step-by-Step Kubernetes Deployment](#step-by-step-kubernetes-deployment)
11. [Verification & Health Auditing](#verification--health-auditing)
12. [Core Kubernetes Demonstrations](#core-kubernetes-demonstrations)
    - [1. Horizontal Pod Scaling](#1-horizontal-pod-scaling)
    - [2. Automated Self-Healing](#2-automated-self-healing)
    - [3. StatefulSet Data Persistence](#3-statefulset-data-persistence)
    - [4. Dynamic ConfigMap Update](#4-dynamic-configmap-update)
    - [5. Secret Decoupling](#5-secret-decoupling)
    - [6. DNS Service Discovery](#6-dns-service-discovery)
    - [7. Ingress HTTP Routing](#7-ingress-http-routing)
13. [Troubleshooting & Diagnostic Playbook](#troubleshooting--diagnostic-playbook)
14. [Architectural Deep Dive: Why These K8s Resources?](#architectural-deep-dive-why-these-k8s-resources)
15. [Production Evolution Roadmap](#production-evolution-roadmap)

---

## Project Overview

The **Food Delivery Platform** demonstrates how modern cloud-native standards are applied to a distributed multi-tier application. It implements a complete customer ordering flow, restaurant dish and order management, platform administration, caching with cache-invalidation, multi-stage containerization, and zero-downtime orchestration on Kubernetes.

---

## High-Level Architecture

```
                                    User Browser / Client
                                              │
                                              │ http://food.local
                                              ▼
                                 [ NGINX Ingress Controller ]
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     │ Path: /                                         │ Path: /api
                     ▼                                                 ▼
          [ frontend-service ]                              [ backend-service ]
           (ClusterIP: Port 80)                              (ClusterIP: Port 8080)
                     │                                                 │
          ┌──────────┴──────────┐                           ┌──────────┴──────────┐
          ▼                     ▼                           ▼                     ▼
   [ frontend-pod-1 ]    [ frontend-pod-2 ]          [ backend-pod-1 ]     [ backend-pod-2 ]
    (Nginx + React)       (Nginx + React)             (Spring Boot 3)       (Spring Boot 3)
                                                            │                     │
                                             ┌──────────────┴──────────────┐      │
                                             ▼                             ▼      │
                                     [ redis-service ]             [ mysql-service ]
                                      (ClusterIP: 6379)             (Headless: 3306)
                                             │                             │
                                        [ redis-0 ]                    [ mysql-0 ]
                                       (Deployment)                   (StatefulSet)
                                                                           │
                                                                           ▼
                                                                     [ mysql-pvc ]
                                                                           │
                                                                           ▼
                                                                     [ mysql-pv ]
                                                                   (Persistent Disk)
```

---

## Technology Stack

### Frontend
- **React.js 18** with functional components and React Hooks.
- **Vite** for optimized bundling and sub-second Hot Module Replacement.
- **React Router v6** for single-page client routing and route protection.
- **Axios** with global request/response interceptors attaching JWT Bearer tokens and managing authorization failures.
- **Lucide Icons** & custom responsive modern UI layout.

### Backend
- **Java 17 / 21** & **Spring Boot 3.3.x**.
- **Spring Web (REST APIs)** following clean DTO patterns.
- **Spring Data JPA / Hibernate 6** with database connection pooling and optimized queries.
- **Spring Security 6** with stateless JWT authentication and Method Security (`@PreAuthorize`).
- **JJWT 0.12.x** with HMAC-SHA-512 signing.
- **Spring Data Redis** & **Spring Cache Abstraction** (`@Cacheable`, `@CacheEvict`).
- **Spring Boot Actuator** exposing `/actuator/health/readiness` and `/actuator/health/liveness` for Kubernetes probes.

### Database & In-Memory Store
- **MySQL 8.0**: ACID-compliant relational persistence deployed via StatefulSet.
- **Redis 7 (Alpine)**: Low-latency caching layer for restaurant listings and menus.

### Containerization & Cloud-Native
- **Docker**: Multi-stage, lean images using non-root security principles.
- **Docker Compose**: Complete multi-container local development runtime with health dependencies.
- **Kubernetes**: Declarative manifests across Namespaces, ConfigMaps, Secrets, PV/PVCs, StatefulSets, Deployments, Services, and Ingress.

---

## Application Features & Role-Based Access

### 1. Customer Flow (`ROLE_CUSTOMER`)
- **Authentication**: Registration and login returning signed JWT tokens.
- **Browsing & Discovery**: Filter restaurants by name, tags (Pizza, Burger, Asian, Curry, Biryani), and pagination.
- **Restaurant Details & Menus**: View items, availability, descriptions, and pricing.
- **Shopping Cart**: Real-time quantity adjustments (`+` / `-`), clear cart, restaurant validation, subtotal calculations.
- **Order Placement**: Provide delivery address, calculate estimated fees/taxes, and place order.
- **Live Order Tracking**: Visual progress stepper: `PLACED` → `CONFIRMED` → `PREPARING` → `OUT_FOR_DELIVERY` → `DELIVERED`.

### 2. Restaurant Owner Flow (`ROLE_RESTAURANT`)
- **Menu Management**: Add new dishes, edit price and descriptions, toggle item availability (`In Stock` / `Sold Out`), delete dishes.
- **Live Order Intake**: Review incoming customer orders and transition statuses in real-time.

### 3. Admin Flow (`ROLE_ADMIN`)
- **Platform Analytics**: Total platform users, registered restaurants, total orders placed, and gross merchandise volume (GMV).
- **User Governance**: List platform users and dynamically promote/change roles (`ROLE_CUSTOMER`, `ROLE_RESTAURANT`, `ROLE_ADMIN`).
- **Restaurant Catalog**: Add new restaurant partners, edit profiles, or remove partners.
- **Global Order Logs**: Monitor orders across all restaurants and override statuses.

---

## Database Architecture & Schema Design

The application uses a normalized relational model in MySQL:

```
 users
 ├── id (BIGINT, PK, AUTO_INCREMENT)
 ├── name (VARCHAR(100))
 ├── email (VARCHAR(120), UNIQUE)
 ├── password (VARCHAR(255))
 ├── role (VARCHAR(30))
 └── created_at (DATETIME)
       │
       ├──────────────────────────────────┐
       ▼ (1:1)                            ▼ (1:N)
     carts                              orders
     ├── id (BIGINT, PK)                ├── id (BIGINT, PK)
     ├── user_id (FK -> users)          ├── user_id (FK -> users)
     └── created_at (DATETIME)          ├── restaurant_id (FK -> restaurants)
           │                            ├── total_amount (DECIMAL(10,2))
           ▼ (1:N)                      ├── status (VARCHAR(30))
       cart_items                       ├── delivery_address (VARCHAR(500))
       ├── id (BIGINT, PK)              ├── created_at (DATETIME)
       ├── cart_id (FK -> carts)        └── updated_at (DATETIME)
       ├── menu_item_id (FK)                  │
       └── quantity (INT)                     ▼ (1:N)
                                          order_items
 restaurants                              ├── id (BIGINT, PK)
 ├── id (BIGINT, PK, AUTO_INCREMENT)      ├── order_id (FK -> orders)
 ├── name (VARCHAR(150))                  ├── menu_item_id (FK -> menu_items)
 ├── description (TEXT)                   ├── quantity (INT)
 ├── address (VARCHAR(255))               └── price (DECIMAL(10,2))
 ├── phone (VARCHAR(30))
 ├── image_url (VARCHAR(500))
 └── created_at (DATETIME)
       │
       ▼ (1:N)
   menu_items
   ├── id (BIGINT, PK, AUTO_INCREMENT)
   ├── restaurant_id (FK -> restaurants)
   ├── name (VARCHAR(150))
   ├── description (TEXT)
   ├── price (DECIMAL(10,2))
   ├── image_url (VARCHAR(500))
   ├── available (BOOLEAN)
   └── created_at (DATETIME)
```

---

## Redis Caching Flow

```
                      Client Request
                            │
                            ▼
                   [ Spring Boot API ]
                            │
              Is data present in Redis?
                     /             \
             YES    /               \  NO
                   /                 \
                  ▼                   ▼
           [ Read Cache ]      [ Query MySQL DB ]
                  │                   │
                  │            [ Write to Redis ]
                  │            (TTL: 10 minutes)
                  │                   │
                  └─────────┬─────────┘
                            ▼
                      Return DTO
```

### Cache Invalidation Rules:
- **`@Cacheable(value = "restaurants")`**: Cached upon listing. Evicted whenever a restaurant is created, updated, or deleted (`@CacheEvict(allEntries = true)`).
- **`@Cacheable(value = "restaurant", key = "#id")`**: Cached per restaurant ID. Evicted upon updates.
- **`@Cacheable(value = "menus", key = "#restaurantId")`**: Cached per restaurant menu. Evicted whenever a dish is added, edited, or deleted.

---

## Project Directory Structure

```
food-delivery-app/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/fooddelivery/
│   │       │   ├── config/              # Redis, Security, Seed Data
│   │       │   ├── controller/          # REST Controllers (Auth, Restaurant, Menu, Cart, Order, Admin)
│   │       │   ├── dto/                 # Request/Response Data Transfer Objects
│   │       │   ├── entity/              # Normalized JPA Entities
│   │       │   ├── exception/           # Global Exception Handling
│   │       │   ├── repository/          # Spring Data Repositories
│   │       │   ├── security/            # JWT Utils, Filter, UserDetailsService
│   │       │   ├── service/             # Business Logic & Redis Caching
│   │       │   └── FoodDeliveryApplication.java
│   │       └── resources/
│   │           └── application.properties
│   ├── Dockerfile                       # Multi-stage Maven -> Temurin Alpine JRE
│   ├── .dockerignore
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/                         # Axios client with JWT interceptor
│   │   ├── context/                     # AuthContext & CartContext
│   │   ├── components/                  # Navbar, Cards, Loading, Errors, ProtectedRoute
│   │   ├── pages/                       # Home, Login, Register, Restaurants, Cart, Orders, Dashboards
│   │   ├── styles/                      # Modern responsive CSS
│   │   ├── App.jsx                      # Client router
│   │   └── main.jsx
│   ├── index.html
│   ├── nginx.conf                       # Production Nginx reverse-proxy & SPA routing
│   ├── Dockerfile                       # Multi-stage Node builder -> Nginx Alpine
│   ├── .dockerignore
│   ├── package.json
│   └── vite.config.js
│
├── k8s/
│   ├── namespace.yaml                   # food-delivery namespace
│   ├── configmap.yaml                   # Non-sensitive configuration (DB host, Redis host, ports)
│   ├── secret.yaml                      # Sensitive credentials (DB passwords, JWT secret)
│   ├── mysql-pv.yaml                    # PersistentVolume (5Gi storage)
│   ├── mysql-pvc.yaml                   # PersistentVolumeClaim for MySQL
│   ├── mysql-service.yaml               # Headless ClusterIP service for MySQL
│   ├── mysql-statefulset.yaml           # MySQL 8.0 StatefulSet with health checks
│   ├── redis-deployment.yaml            # Redis 7 Deployment
│   ├── redis-service.yaml               # Redis ClusterIP service
│   ├── backend-deployment.yaml          # Spring Boot Deployment (2 replicas, health probes)
│   ├── backend-service.yaml             # Backend ClusterIP service
│   ├── frontend-deployment.yaml         # React Nginx Deployment (2 replicas, probes)
│   ├── frontend-service.yaml            # Frontend ClusterIP service
│   ├── deployment.yaml                  # Consolidated backend & frontend deployments
│   ├── service.yaml                     # Consolidated backend & frontend services
│   └── ingress.yaml                     # Ingress routing rules for food.local
│
├── docker-compose.yml                   # Multi-service local composition
├── .env                                 # Local environment variables
└── README.md                            # Complete documentation & runbook
```

---

## Local Development with Docker Compose

To run the complete system locally without Kubernetes:

### 1. Build and Launch Containers
```bash
cd /Users/vasanthreddylingala/.gemini/antigravity/scratch/food-delivery-app
docker compose up --build -d
```

### 2. Verify Container Health
```bash
docker compose ps
```
All four containers (`food-delivery-mysql`, `food-delivery-redis`, `food-delivery-backend`, `food-delivery-frontend`) will show status `healthy` / `running`.

### 3. Access the Application
- **Frontend**: Open [http://localhost](http://localhost) (or [http://localhost:3000](http://localhost:3000))
- **Backend Actuator Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
- **API Restaurants**: [http://localhost:8080/api/restaurants](http://localhost:8080/api/restaurants)

### 4. Stop Containers
```bash
docker compose down
```
*(To erase database volume: `docker compose down -v`)*

---

## Step-by-Step Kubernetes Deployment

### Stage 1: Build Docker Images
Build the container images and tag them for Kubernetes:
```bash
# Build Frontend
docker build -t food-frontend:1.0 ./frontend

# Build Backend
docker build -t food-backend:1.0 ./backend
```

*(If using Minikube, make sure images are available to minikube's Docker daemon via `eval $(minikube docker-env)` before building, or run `minikube image load food-frontend:1.0 food-backend:1.0`)*.

---

### Stage 2: Create Namespace
```bash
kubectl apply -f k8s/namespace.yaml
```

---

### Stage 3: Create ConfigMap & Secret
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
```

---

### Stage 4: Deploy Persistent Storage & MySQL StatefulSet
```bash
kubectl apply -f k8s/mysql-pv.yaml
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-service.yaml
kubectl apply -f k8s/mysql-statefulset.yaml
```

Verify that MySQL pod `mysql-0` achieves ready state:
```bash
kubectl get pods -n food-delivery -l app=mysql -w
```

---

### Stage 5: Deploy Redis In-Memory Cache
```bash
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/redis-service.yaml
```

---

### Stage 6: Deploy Backend (Spring Boot 3)
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
```

---

### Stage 7: Deploy Frontend (React + Nginx)
```bash
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
```

---

### Stage 8: Configure Ingress
```bash
kubectl apply -f k8s/ingress.yaml
```

Or deploy all resources simultaneously:
```bash
kubectl apply -f k8s/
```

---

### Stage 9: Configure Local Hosts File
Add `food.local` to `/etc/hosts` pointing to your cluster ingress IP or localhost:
```bash
echo "127.0.0.1 food.local" | sudo tee -a /etc/hosts
```
*(On Minikube, run `minikube ip` and map `<minikube-ip> food.local`)*.

---

## Verification & Health Auditing

Verify all Kubernetes objects across the `food-delivery` namespace:

```bash
# 1. Inspect Pods
kubectl get pods -n food-delivery -o wide

# 2. Inspect Services
kubectl get svc -n food-delivery

# 3. Inspect Deployments & Replicas
kubectl get deployments -n food-delivery

# 4. Inspect StatefulSets
kubectl get statefulsets -n food-delivery

# 5. Inspect Persistent Volumes & Claims
kubectl get pvc -n food-delivery
kubectl get pv

# 6. Inspect Ingress routing rules
kubectl get ingress -n food-delivery
```

Expected output:
```
NAME                          READY   STATUS    RESTARTS   AGE
backend-77bfd498c8-4k9l2      1/1     Running   0          2m
backend-77bfd498c8-xj8m1      1/1     Running   0          2m
frontend-69d6575cb7-28dkm     1/1     Running   0          2m
frontend-69d6575cb7-w9b4x     1/1     Running   0          2m
mysql-0                       1/1     Running   0          4m
redis-574bc99dc8-98fgh        1/1     Running   0          3m
```

---

## Core Kubernetes Demonstrations

### 1. Horizontal Pod Scaling
Demonstrate elastic horizontal scaling by increasing backend capacity from 2 to 4 replicas:
```bash
# Scale up
kubectl scale deployment backend --replicas=4 -n food-delivery

# Observe real-time pod scheduling
kubectl get pods -n food-delivery -l app=backend -w

# Scale back down
kubectl scale deployment backend --replicas=2 -n food-delivery
```

---

### 2. Automated Self-Healing
Demonstrate how the Kubernetes Deployment controller detects pod termination and launches replacements immediately:
```bash
# Identify an active backend pod
POD_NAME=$(kubectl get pods -n food-delivery -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Delete the pod
kubectl delete pod $POD_NAME -n food-delivery

# Notice how the pod enters Terminating while a brand new pod is instantly spawned
kubectl get pods -n food-delivery -l app=backend
```

---

### 3. StatefulSet Data Persistence
StatefulSets ensure data survival across pod restarts:
1. Log in to [http://food.local](http://food.local) as Customer (`customer@food.local` / `customer123`).
2. Add dishes to cart and place an order.
3. Delete the MySQL pod:
   ```bash
   kubectl delete pod mysql-0 -n food-delivery
   ```
4. Observe Kubernetes recreating `mysql-0` with the exact same identity and reattaching `mysql-pvc`:
   ```bash
   kubectl get pods -n food-delivery -l app=mysql -w
   ```
5. Refresh [http://food.local/orders](http://food.local/orders) in your browser: **All orders and user records remain intact.**

---

### 4. Dynamic ConfigMap Update
Update application configuration without editing container images:
```bash
# Modify ConfigMap
kubectl edit configmap food-delivery-config -n food-delivery

# Trigger rolling restart to propagate changes
kubectl rollout restart deployment/backend -n food-delivery
kubectl rollout status deployment/backend -n food-delivery
```

---

### 5. Secret Decoupling
Demonstrate that sensitive passwords are never written as plaintext in Deployment templates:
```bash
# Verify the backend deployment references secrets via secretKeyRef / secretRef
kubectl get deployment backend -n food-delivery -o yaml | grep -A 5 food-delivery-secret
```

---

### 6. DNS Service Discovery
Demonstrate inter-service DNS communication within the cluster:
```bash
# Run a temporary diagnostic shell inside the cluster
kubectl run dns-test --rm -it --image=busybox -n food-delivery -- nslookup backend-service
kubectl run dns-test --rm -it --image=busybox -n food-delivery -- nslookup mysql
kubectl run dns-test --rm -it --image=busybox -n food-delivery -- nslookup redis
```
Kubernetes CoreDNS automatically resolves `mysql` to `mysql.food-delivery.svc.cluster.local:3306` and `redis` to `redis.food-delivery.svc.cluster.local:6379`.

---

### 7. Ingress HTTP Routing
Verify that the NGINX Ingress controller routes traffic according to URL prefix:
```bash
# Test Web Frontend routing
curl -I http://food.local/

# Test REST API routing
curl http://food.local/api/restaurants
```

---

## Troubleshooting & Diagnostic Playbook

### Diagnostic Commands:
```bash
# 1. Describe pod events, lifecycle, and scheduling
kubectl describe pod <pod-name> -n food-delivery

# 2. View streaming container stdout/stderr logs
kubectl logs -f <pod-name> -n food-delivery

# 3. View previous container logs if pod crashed
kubectl logs <pod-name> -n food-delivery --previous

# 4. Open interactive shell inside pod
kubectl exec -it <pod-name> -n food-delivery -- /bin/sh

# 5. List namespace events chronologically
kubectl get events -n food-delivery --sort-by='.metadata.creationTimestamp'
```

### Common Scenarios & Resolutions:

| Symptom | Primary Cause | Solution |
|---|---|---|
| `CrashLoopBackOff` | Application exception at startup (e.g. database not reachable, bad JWT key). | Inspect `kubectl logs <pod> -n food-delivery`. Ensure MySQL and Redis pods are in `1/1 Running` state. |
| `ImagePullBackOff` / `ErrImagePull` | Docker image not found in local registry or minikube daemon. | Run `docker build -t food-backend:1.0 ./backend`. In Minikube, execute `minikube image load food-backend:1.0 food-frontend:1.0`. Verify `imagePullPolicy: IfNotPresent`. |
| `Pending PVC` | PersistentVolume not bound or StorageClass mismatch. | Verify `mysql-pv.yaml` has `storageClassName: manual` matching `mysql-pvc.yaml`. Run `kubectl describe pvc mysql-pvc -n food-delivery`. |
| Database Connection Refused | Backend pod attempting connection before MySQL initialized. | Spring Boot retries connection. Ensure `MYSQL_HOST: "mysql"` and `MYSQL_PORT: "3306"` are matched in ConfigMap. Check `kubectl logs mysql-0 -n food-delivery`. |
| Redis Connection Failure | Redis host set to `localhost` instead of DNS name. | Verify `REDIS_HOST: "redis"` in `k8s/configmap.yaml`. Check Redis logs: `kubectl logs -l app=redis -n food-delivery`. |
| Ingress 404 / 503 | Ingress controller not enabled or missing `/etc/hosts` entry. | Run `minikube addons enable ingress`. Ensure `food.local` points to ingress controller IP in `/etc/hosts`. |

---

## Architectural Deep Dive: Why These K8s Resources?

### 1. Deployment vs. StatefulSet
- **Deployment** is optimal for **stateless services** (Backend & Frontend). Pods are interchangeable and ephemeral. If a backend pod crashes, any replacement pod with the same image can handle requests without data disparity.
- **StatefulSet** is essential for **stateful workloads** (MySQL). It guarantees:
  1. *Stable, persistent network identifier* (`mysql-0`).
  2. *Dedicated, sticky storage* (`mysql-pvc` remains bound to `mysql-0` even when destroyed and recreated).
  3. *Controlled rollout and termination* ensuring transactions flush before shutdown.

### 2. ConfigMap vs. Secret
- **ConfigMap** separates application configuration (database host names, ports, logging levels) from container image builds. Modifying environment variables does not require recompiling code.
- **Secret** protects sensitive data (database credentials, JWT signing keys). They are decoupled from git manifests, can be RBAC-restricted, and are mounted directly into memory (`tmpfs`).

### 3. PersistentVolume (PV) vs. PersistentVolumeClaim (PVC)
- **PV** represents the physical storage resource provisioned in the cluster (e.g., local hostPath, AWS EBS, GCP Persistent Disk).
- **PVC** represents a developer's request for storage (capacity and access mode). The PVC decouples application deployments from storage infrastructure specifics.

### 4. ClusterIP Service
- Pods have transient IP addresses. The **ClusterIP Service** provides a stable internal virtual IP and DNS name (`backend-service`, `mysql`, `redis`) with built-in round-robin load balancing across all healthy backend pods.

### 5. Ingress Controller
- Eliminates the need to allocate an expensive cloud LoadBalancer for each individual service.
- Handles host-based routing (`food.local`) and path-based routing (`/` to frontend, `/api` to backend) through a single unified entry point.

---

## Production Evolution Roadmap

When advancing this architecture to production environments (AWS EKS, Google Cloud GKE, Azure AKS):
1. **Horizontal Pod Autoscaler (HPA)**: Auto-scale backend and frontend deployments automatically based on CPU utilization (>70%) and HTTP request metrics.
2. **TLS / HTTPS Encryption**: Provision `cert-manager` with Let's Encrypt certificates to automatically manage SSL/TLS termination on Ingress.
3. **External Secrets Operator**: Integrate HashiCorp Vault, AWS Secrets Manager, or GCP Secret Manager to automatically sync secrets directly into Kubernetes Secrets.
4. **Helm Chart Packaging**: Package all YAML manifests into parameterized Helm charts (`values-dev.yaml`, `values-prod.yaml`).
5. **CI/CD Pipeline**: GitHub Actions workflow to build, unit test, run security scans (Trivy), and deploy using GitOps (ArgoCD / Flux).
6. **Managed Cloud Databases**: In mission-critical environments, replace in-cluster MySQL and Redis with managed services (Amazon RDS Multi-AZ, AWS ElastiCache, Google Cloud SQL, Memorystore) to offload automated backups and replication.
7. **Observability**: Deploy Prometheus & Grafana for cluster metrics, and Grafana Loki / FluentBit for centralized container log aggregation.

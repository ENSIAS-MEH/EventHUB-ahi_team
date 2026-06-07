#!/bin/bash
# Déployer toute la stack EventHub sur Kubernetes
# Usage: bash apply.sh

set -e

echo "==> Application des manifests Kubernetes..."
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-secrets.yaml
kubectl apply -f 02-mysql.yaml

echo "==> Attente que MySQL soit prêt..."
kubectl wait --namespace eventhub \
  --for=condition=ready pod \
  --selector=app=mysql \
  --timeout=180s

echo "==> Déploiement des services..."
kubectl apply -f 03-auth-service.yaml
kubectl apply -f 04-event-service.yaml
kubectl apply -f 05-booking-service.yaml
kubectl apply -f 06-api-gateway.yaml
kubectl apply -f 07-frontend.yaml

echo ""
echo "==> Déploiement terminé. Statut des pods :"
kubectl get pods -n eventhub

echo ""
echo "==> Pour accéder à l'application :"
echo "    Frontend  : http://localhost:30080"
echo "    API       : http://localhost:30000"
echo ""
echo "==> Ou avec port-forward (si NodePort ne fonctionne pas) :"
echo "    kubectl port-forward svc/frontend   80:80   -n eventhub"
echo "    kubectl port-forward svc/api-gateway 8000:8000 -n eventhub"

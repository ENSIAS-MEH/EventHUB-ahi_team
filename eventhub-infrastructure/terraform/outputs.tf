output "frontend_url" {
  description = "URL du frontend (après minikube ip)"
  value       = "http://<minikube-ip>:30080"
}

output "api_gateway_url" {
  description = "URL de l'API Gateway"
  value       = "http://<minikube-ip>:30000"
}

output "namespace" {
  description = "Namespace Kubernetes utilisé"
  value       = kubernetes_namespace.eventhub.metadata[0].name
}

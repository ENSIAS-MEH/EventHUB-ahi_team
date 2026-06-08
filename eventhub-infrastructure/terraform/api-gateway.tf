resource "kubernetes_deployment" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "api-gateway" }
    }

    template {
      metadata {
        labels = { app = "api-gateway" }
      }

      spec {
        container {
          name              = "api-gateway"
          image             = "anaselmidaoui/api-gateway:latest"
          image_pull_policy = "Always"

          port {
            container_port = 8000
          }

          readiness_probe {
            http_get {
              path = "/actuator/health"
              port = 8000
            }
            initial_delay_seconds = 20
            period_seconds        = 10
            failure_threshold     = 10
          }

          liveness_probe {
            http_get {
              path = "/actuator/health"
              port = 8000
            }
            initial_delay_seconds = 40
            period_seconds        = 20
          }

          resources {
            requests = {
              memory = "256Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "512Mi"
              cpu    = "500m"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "api_gateway" {
  metadata {
    name      = "api-gateway"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    selector = { app = "api-gateway" }
    type     = "NodePort"

    port {
      port        = 8000
      target_port = 8000
      node_port   = 30000
    }
  }
}

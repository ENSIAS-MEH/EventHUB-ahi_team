resource "kubernetes_persistent_volume_claim" "event_uploads_pvc" {
  metadata {
    name      = "event-uploads-pvc"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "2Gi"
      }
    }
  }
}

resource "kubernetes_deployment" "event_service" {
  metadata {
    name      = "event-service"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "event-service" }
    }

    template {
      metadata {
        labels = { app = "event-service" }
      }

      spec {
        container {
          name              = "event-service"
          image             = "anaselmidaoui/event-service:latest"
          image_pull_policy = "Always"

          port {
            container_port = 8082
          }

          env {
            name  = "SPRING_DATASOURCE_URL"
            value = "jdbc:mysql://mysql-server:3306/db_event?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
          }

          env {
            name  = "SPRING_DATASOURCE_USERNAME"
            value = "root"
          }

          env {
            name = "SPRING_DATASOURCE_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.eventhub_secrets.metadata[0].name
                key  = "mysql-root-password"
              }
            }
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.eventhub_secrets.metadata[0].name
                key  = "jwt-secret"
              }
            }
          }

          env {
            name  = "UPLOAD_DIR"
            value = "/app/uploads"
          }

          env {
            name  = "UPLOAD_BASE_URL"
            value = "http://localhost:8000"
          }

          volume_mount {
            name       = "uploads"
            mount_path = "/app/uploads"
          }

          readiness_probe {
            http_get {
              path = "/actuator/health"
              port = 8082
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            failure_threshold     = 10
          }

          liveness_probe {
            http_get {
              path = "/actuator/health"
              port = 8082
            }
            initial_delay_seconds = 60
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

        volume {
          name = "uploads"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.event_uploads_pvc.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "event_service" {
  metadata {
    name      = "event-service"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    selector = { app = "event-service" }
    type     = "ClusterIP"

    port {
      port        = 8082
      target_port = 8082
    }
  }
}

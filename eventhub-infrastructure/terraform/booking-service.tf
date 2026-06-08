resource "kubernetes_deployment" "booking_service" {
  metadata {
    name      = "booking-service"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "booking-service" }
    }

    template {
      metadata {
        labels = { app = "booking-service" }
      }

      spec {
        container {
          name              = "booking-service"
          image             = "anaselmidaoui/booking-service:latest"
          image_pull_policy = "Always"

          port {
            container_port = 8083
          }

          env {
            name  = "SPRING_DATASOURCE_URL"
            value = "jdbc:mysql://mysql-server:3306/db_booking?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
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
            name  = "EVENT_SERVICE_URL"
            value = "http://event-service:8082"
          }

          readiness_probe {
            http_get {
              path = "/actuator/health"
              port = 8083
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            failure_threshold     = 10
          }

          liveness_probe {
            http_get {
              path = "/actuator/health"
              port = 8083
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
      }
    }
  }
}

resource "kubernetes_service" "booking_service" {
  metadata {
    name      = "booking-service"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    selector = { app = "booking-service" }
    type     = "ClusterIP"

    port {
      port        = 8083
      target_port = 8083
    }
  }
}

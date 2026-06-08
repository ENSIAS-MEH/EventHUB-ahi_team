resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = { app = "frontend" }
    }

    template {
      metadata {
        labels = { app = "frontend" }
      }

      spec {
        container {
          name              = "frontend"
          image             = "anaselmidaoui/frontend:latest"
          image_pull_policy = "Always"

          port {
            container_port = 80
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 80
            }
            initial_delay_seconds = 5
            period_seconds        = 10
          }

          resources {
            requests = {
              memory = "64Mi"
              cpu    = "100m"
            }
            limits = {
              memory = "128Mi"
              cpu    = "200m"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    selector = { app = "frontend" }
    type     = "NodePort"

    port {
      port        = 80
      target_port = 80
      node_port   = 30080
    }
  }
}

resource "kubernetes_config_map" "mysql_init" {
  metadata {
    name      = "mysql-init"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  data = {
    "init.sql" = <<-EOT
      CREATE DATABASE IF NOT EXISTS db_auth;
      CREATE DATABASE IF NOT EXISTS db_event;
      CREATE DATABASE IF NOT EXISTS db_booking;
    EOT
  }
}

resource "kubernetes_persistent_volume_claim" "mysql_pvc" {
  metadata {
    name      = "mysql-pvc"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]
    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}

resource "kubernetes_deployment" "mysql" {
  metadata {
    name      = "mysql"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    selector {
      match_labels = { app = "mysql" }
    }

    strategy {
      type = "Recreate"
    }

    template {
      metadata {
        labels = { app = "mysql" }
      }

      spec {
        container {
          name  = "mysql"
          image = "mysql:8.0"

          port {
            container_port = 3306
          }

          env {
            name = "MYSQL_ROOT_PASSWORD"
            value_from {
              secret_key_ref {
                name = kubernetes_secret.eventhub_secrets.metadata[0].name
                key  = "mysql-root-password"
              }
            }
          }

          volume_mount {
            name       = "mysql-data"
            mount_path = "/var/lib/mysql"
          }

          volume_mount {
            name       = "mysql-init"
            mount_path = "/docker-entrypoint-initdb.d"
          }

          readiness_probe {
            exec {
              command = ["mysqladmin", "ping", "-h", "localhost", "-u", "root", "-prootpassword"]
            }
            initial_delay_seconds = 30
            period_seconds        = 10
            failure_threshold     = 40
          }

          resources {
            requests = {
              memory = "512Mi"
              cpu    = "250m"
            }
            limits = {
              memory = "1Gi"
              cpu    = "500m"
            }
          }
        }

        volume {
          name = "mysql-data"
          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mysql_pvc.metadata[0].name
          }
        }

        volume {
          name = "mysql-init"
          config_map {
            name = kubernetes_config_map.mysql_init.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "mysql" {
  metadata {
    name      = "mysql-server"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  spec {
    selector = { app = "mysql" }
    type     = "ClusterIP"

    port {
      port        = 3306
      target_port = 3306
    }
  }
}

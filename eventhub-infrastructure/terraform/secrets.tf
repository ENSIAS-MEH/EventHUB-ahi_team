resource "kubernetes_secret" "eventhub_secrets" {
  metadata {
    name      = "eventhub-secrets"
    namespace = kubernetes_namespace.eventhub.metadata[0].name
  }

  data = {
    "mysql-root-password" = var.mysql_root_password
    "jwt-secret"          = var.jwt_secret
  }
}

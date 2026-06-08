resource "kubernetes_namespace" "eventhub" {
  metadata {
    name = var.namespace
  }
}

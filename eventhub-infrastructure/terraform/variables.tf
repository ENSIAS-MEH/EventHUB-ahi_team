variable "mysql_root_password" {
  description = "MySQL root password"
  type        = string
  default     = "rootpassword"
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT secret key"
  type        = string
  default     = "eventhub-super-secret-jwt-key-2024-XXXXXXXXXXXXXXXXXXXXXXXXXX"
  sensitive   = true
}

variable "namespace" {
  description = "Kubernetes namespace"
  type        = string
  default     = "eventhub"
}

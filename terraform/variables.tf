variable "project_name" {
  type        = string
  description = "Project name"
  default     = "shreeanna"
}

variable "resource_group_name" {
  type        = string
  description = "Azure resource group"
  default     = "shreeanna-rg"
}

variable "location" {
  type        = string
  description = "Azure region"
  default     = "Central India"
}

variable "environment" {
  type        = string
  description = "Environment"
  default     = "dev"
}

variable "storage_account_name" {
  type        = string
  description = "Globally unique Azure Storage Account name"
  default     = "shreeannafarmimages"
}

variable "storage_container_name" {
  type        = string
  description = "Blob container"
  default     = "farm-images"
}

variable "log_analytics_workspace_name" {
  type        = string
  description = "Existing Log Analytics Workspace name (optional)"
  default     = "workspaceshreeannarg820e"
}

variable "container_app_environment_name" {
  type        = string
  description = "Azure Container App Environment name"
  default     = "shreeanna-env"
}

variable "backend_container_app_name" {
  type        = string
  description = "Azure Container App name for the backend API"
  default     = "shreeanna"
}

variable "backend_image" {
  type        = string
  description = "Container image tag for backend API"
  default     = "mukund100/shreeanna-api:latest"
}

variable "database_connection_string" {
  type        = string
  description = "Database connection string for backend API"
  default     = "Host=ep-young-sky-b5ldzw1i-pooler.c-7.us-east-2.aws.neon.tech; Database=neondb; Username=neondb_owner; Password=npg_TYyfSnplW69G; SSL Mode=VerifyFull; Channel Binding=Require;"
  sensitive   = true
}

variable "frontend_container_app_name" {
  type        = string
  description = "Azure Container App name for the frontend website"
  default     = "shreeanna-website"
}

variable "frontend_image" {
  type        = string
  description = "Container image tag for frontend website"
  default     = "mukund100/shreeanna-website:latest"
}

variable "enable_frontend" {
  type        = bool
  description = "Whether to deploy the frontend container app"
  default     = true
}

variable "dockerhub_username" {
  type        = string
  description = "Docker Hub username (optional if pulling public images)"
  default     = ""
}

variable "dockerhub_token" {
  type        = string
  description = "Docker Hub token or password (optional if pulling public images)"
  default     = ""
  sensitive   = true
}
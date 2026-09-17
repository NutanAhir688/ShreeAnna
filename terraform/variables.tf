variable "project_name" {
  type        = string
  description = "Project name"

  default = "shreeanna"
}

variable "resource_group_name" {
  type        = string
  description = "Azure resource group"

  default = "shreeanna-rg"
}

variable "location" {
  type        = string
  description = "Azure region"

  default = "Central India"
}

variable "environment" {
  type        = string
  description = "Environment"

  default = "dev"
}

variable "storage_account_name" {
  type        = string
  description = "Globally unique Azure Storage Account name"
}

variable "storage_container_name" {
  type        = string
  description = "Blob container"

  default = "farm-images"
}
terraform {
  required_version = ">= 1.6.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 5.4"
    }
  }
}

provider "azurerm" {
  resource_provider_registrations = "all"
  features {}
}

# ---------------------------------------------------------
# RESOURCE GROUP
# ---------------------------------------------------------

resource "azurerm_resource_group" "shreeanna" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    project     = "ShreeAnna"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ---------------------------------------------------------
# STORAGE ACCOUNT
# ---------------------------------------------------------

resource "azurerm_storage_account" "farm_images" {
  name                = var.storage_account_name
  resource_group_name = azurerm_resource_group.shreeanna.name
  location            = azurerm_resource_group.shreeanna.location

  account_tier             = "Standard"
  account_replication_type = "LRS"

  min_tls_version = "TLS1_2"

  # Allow public read access to image blobs
  allow_nested_items_to_be_public = true

  # Keep infrastructure secure
  shared_access_key_enabled = true

  # We use SAS for direct Flutter uploads.
  # Therefore public network access must remain enabled
  # for the current architecture.
  public_network_access = "Enabled"

  blob_properties {
    versioning_enabled = true

    delete_retention_policy {
      days = 7
    }

    container_delete_retention_policy {
      days = 7
    }

    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["DELETE", "GET", "HEAD", "MERGE", "POST", "OPTIONS", "PUT"]
      allowed_origins    = ["*"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 3600
    }
  }

  tags = {
    project     = "ShreeAnna"
    environment = var.environment
  }
}

# ---------------------------------------------------------
# PUBLIC BLOB IMAGE CONTAINER
# ---------------------------------------------------------

resource "azurerm_storage_container" "farm_images" {
  name                  = var.storage_container_name
  storage_account_id    = azurerm_storage_account.farm_images.id
  container_access_type = "blob"
}

# ---------------------------------------------------------
# MANAGED IDENTITY
# Used by ASP.NET API to generate User Delegation SAS
# ---------------------------------------------------------

resource "azurerm_user_assigned_identity" "farm_api" {
  name                = "${var.project_name}-farm-api-identity"
  resource_group_name = azurerm_resource_group.shreeanna.name
  location            = azurerm_resource_group.shreeanna.location
}

# ---------------------------------------------------------
# STORAGE BLOB DELEGATOR & DATA CONTRIBUTOR
# Allows backend identity to request User Delegation Keys and write blobs
# ---------------------------------------------------------

resource "azurerm_role_assignment" "farm_api_blob_delegator" {
  scope                = azurerm_storage_account.farm_images.id
  role_definition_name = "Storage Blob Delegator"
  principal_id         = azurerm_user_assigned_identity.farm_api.principal_id
}

resource "azurerm_role_assignment" "farm_api_blob_contributor" {
  scope                = azurerm_storage_account.farm_images.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.farm_api.principal_id
}
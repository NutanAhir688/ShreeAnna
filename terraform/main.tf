terraform {
  required_version = ">= 1.6.0"

  backend "azurerm" {
    resource_group_name  = "shreeanna-rg"
    storage_account_name = "shreeannafarmimages"
    container_name       = "tfstate"
    key                  = "shreeanna.terraform.tfstate"
  }

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

# ---------------------------------------------------------
# LOG ANALYTICS WORKSPACE (DATA SOURCE)
# ---------------------------------------------------------

data "azurerm_log_analytics_workspace" "workspace" {
  count               = var.log_analytics_workspace_name != "" ? 1 : 0
  name                = var.log_analytics_workspace_name
  resource_group_name = azurerm_resource_group.shreeanna.name
}

# ---------------------------------------------------------
# CONTAINER APPS MANAGED ENVIRONMENT
# ---------------------------------------------------------

resource "azurerm_container_app_environment" "shreeanna" {
  name                       = var.container_app_environment_name
  location                   = azurerm_resource_group.shreeanna.location
  resource_group_name        = azurerm_resource_group.shreeanna.name
  logs_destination           = length(data.azurerm_log_analytics_workspace.workspace) > 0 ? "log-analytics" : null
  log_analytics_workspace_id = length(data.azurerm_log_analytics_workspace.workspace) > 0 ? data.azurerm_log_analytics_workspace.workspace[0].id : null

  tags = {
    project     = "ShreeAnna"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ---------------------------------------------------------
# BACKEND CONTAINER APP (.NET 10 API)
# ---------------------------------------------------------

resource "azurerm_container_app" "backend" {
  name                         = var.backend_container_app_name
  container_app_environment_id = azurerm_container_app_environment.shreeanna.id
  resource_group_name          = azurerm_resource_group.shreeanna.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.farm_api.id]
  }

  ingress {
    external_enabled = true
    target_port      = 5066
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  dynamic "registry" {
    for_each = var.dockerhub_username != "" && var.dockerhub_token != "" ? [1] : []
    content {
      server               = "docker.io"
      username             = var.dockerhub_username
      password_secret_name = "dockerhub-token"
    }
  }

  dynamic "secret" {
    for_each = var.dockerhub_token != "" ? [1] : []
    content {
      name  = "dockerhub-token"
      value = var.dockerhub_token
    }
  }

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name   = "shreeanna-api"
      image  = var.backend_image
      cpu    = 0.5
      memory = "1.0Gi"

      env {
        name  = "ASPNETCORE_ENVIRONMENT"
        value = "Development"
      }

      env {
        name  = "ASPNETCORE_URLS"
        value = "http://0.0.0.0:5066"
      }

      env {
        name  = "AzureStorage__AccountName"
        value = azurerm_storage_account.farm_images.name
      }

      env {
        name  = "AzureStorage__ContainerName"
        value = azurerm_storage_container.farm_images.name
      }

      env {
        name  = "AzureStorage__CdnBaseUrl"
        value = azurerm_storage_account.farm_images.primary_blob_endpoint
      }

      dynamic "env" {
        for_each = var.database_connection_string != "" ? [1] : []
        content {
          name  = "ConnectionStrings__DefaultConnection"
          value = var.database_connection_string
        }
      }
    }
  }

  tags = {
    project     = "ShreeAnna"
    environment = var.environment
    managed_by  = "terraform"
  }
}

# ---------------------------------------------------------
# FRONTEND CONTAINER APP (WEBSITE)
# ---------------------------------------------------------

resource "azurerm_container_app" "frontend" {
  count = var.enable_frontend && var.frontend_image != "" ? 1 : 0

  name                         = var.frontend_container_app_name
  container_app_environment_id = azurerm_container_app_environment.shreeanna.id
  resource_group_name          = azurerm_resource_group.shreeanna.name
  revision_mode                = "Single"

  ingress {
    external_enabled = true
    target_port      = 80
    transport        = "auto"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  dynamic "registry" {
    for_each = var.dockerhub_username != "" && var.dockerhub_token != "" ? [1] : []
    content {
      server               = "docker.io"
      username             = var.dockerhub_username
      password_secret_name = "dockerhub-token"
    }
  }

  dynamic "secret" {
    for_each = var.dockerhub_token != "" ? [1] : []
    content {
      name  = "dockerhub-token"
      value = var.dockerhub_token
    }
  }

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name   = "shreeanna-website"
      image  = var.frontend_image
      cpu    = 0.25
      memory = "0.5Gi"
    }
  }

  tags = {
    project     = "ShreeAnna"
    environment = var.environment
    managed_by  = "terraform"
  }
}
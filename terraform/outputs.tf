output "storage_account_name" {
  value = azurerm_storage_account.farm_images.name
}

output "storage_account_id" {
  value = azurerm_storage_account.farm_images.id
}

output "container_name" {
  value = azurerm_storage_container.farm_images.name
}

output "blob_endpoint" {
  value = azurerm_storage_account.farm_images.primary_blob_endpoint
}

output "farm_api_managed_identity_client_id" {
  value = azurerm_user_assigned_identity.farm_api.client_id
}

output "container_app_environment_name" {
  value = azurerm_container_app_environment.shreeanna.name
}

output "backend_container_app_name" {
  value = azurerm_container_app.backend.name
}

output "backend_fqdn" {
  value = azurerm_container_app.backend.ingress[0].fqdn
}

output "backend_url" {
  value = "https://${azurerm_container_app.backend.ingress[0].fqdn}"
}

output "frontend_fqdn" {
  value = length(azurerm_container_app.frontend) > 0 ? azurerm_container_app.frontend[0].ingress[0].fqdn : null
}

output "frontend_url" {
  value = length(azurerm_container_app.frontend) > 0 ? "https://${azurerm_container_app.frontend[0].ingress[0].fqdn}" : null
}
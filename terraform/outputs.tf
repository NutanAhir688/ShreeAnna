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
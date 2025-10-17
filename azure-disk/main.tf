resource "azurerm_resource_group" "rg" {
  name     = var.resource_group_name
  location = var.location
}

output "disk_resource_id" {
  value = azurerm_managed_disk.disk.id
}

# Get the AKS cluster information
data "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_cluster_name
  resource_group_name = var.aks_resource_group_name
}

# Grant the AKS kubelet identity Contributor access to the disk resource group
#resource "azurerm_role_assignment" "aks_disk_contributor" {
#  scope                = azurerm_resource_group.rg.id
 # role_definition_name = "Contributor"
 # principal_id         = data.azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
#}

# Optional: Add a dependency to ensure role assignment completes before disk creation
resource "azurerm_managed_disk" "disk" {
  name                 = var.managed_disk_name
  location             = azurerm_resource_group.rg.location
  resource_group_name  = azurerm_resource_group.rg.name
  storage_account_type = var.storage_account_type
  create_option        = "Empty"
  disk_size_gb         = var.disk_size_gb
  
#  depends_on = [azurerm_role_assignment.aks_disk_contributor]
}

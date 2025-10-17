terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.46.0"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = "4421688c-0a8d-4588-8dd0-338c5271d0af"
}

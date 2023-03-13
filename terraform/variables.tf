variable "parent_folder" {
  description = "GCP parent folder ID"
  type        = string
  nullable    = false
}

variable "org_id" {
  description = "Organization ID"
  type        = string
  nullable    = false
}

variable "project_name" {
  description = "Name of your project"
  type        = string
  nullable    = false
}

variable "firebase_web_app_name" {
  description = "Name of your firebase project"
  type        = string
  nullable    = false
}

variable "project_id" {
  description = "ID of project"
  type        = string
  nullable    = false
}

variable "terraform_project_id" {
  description = "The id of the terraform project where your terraform service account resides"
  type        = string
  nullable    = false
}

variable "billing_account" {
  description = "ID of billing account"
  type        = string
  nullable    = false
}

variable "default_region" {
  description = "Default region to create resources where applicable."
  type        = string
  default     = "europe-west2"
  nullable    = false
}
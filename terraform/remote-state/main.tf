locals {
  terraform_service_account = "terraform service account email"
}


provider "google" {
  alias = "impersonation"
  scopes = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/userinfo.email",
  ]
}

data "google_service_account_access_token" "default" {
  provider               = google.impersonation
  target_service_account = local.terraform_service_account
  scopes                 = ["userinfo-email", "cloud-platform"]
  lifetime               = "1200s"
}

provider "google" {
  project         = var.terraform_project_id
  access_token    = data.google_service_account_access_token.default.access_token
  request_timeout = "60s"
}


resource "google_storage_bucket" "default" {
  name          = "${var.bucket_name_prefix}-bucket-tfstate"
  force_destroy = false
  location      = var.location
  storage_class = "STANDARD"
  versioning {
    enabled = true
  }
}

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

provider "google-beta" {
  project         = var.terraform_project_id
  access_token    = data.google_service_account_access_token.default.access_token
  request_timeout = "60s"
}

resource "google_project" "project" {
  provider        = google-beta
  name            = var.project_name
  project_id      = var.project_id
  folder_id       = var.parent_folder
  billing_account = var.billing_account

  labels = {
    "firebase" = "enabled"
  }
}

# Activate required APIs at GCP
resource "google_project_service" "serviceusage" {
  provider                   = google-beta
  project                    = google_project.project.project_id
  service                    = "serviceusage.googleapis.com"
  disable_dependent_services = true
}

resource "google_project_service" "firebase" {
  provider                   = google-beta
  project                    = google_project.project.project_id
  service                    = "firebase.googleapis.com"
  disable_dependent_services = true
  depends_on = [
    google_project_service.serviceusage
  ]
}

resource "google_project_service" "firestore" {
  provider = google-beta
  project  = google_project.project.project_id
  service  = "firestore.googleapis.com"
  depends_on = [
    google_project_service.serviceusage
  ]
}

resource "google_project_service" "firebasestorage" {
  provider = google-beta
  project  = google_project.project.project_id
  service  = "firebasestorage.googleapis.com"
  depends_on = [
    google_project_service.serviceusage
  ]
}

resource "google_project_service" "cloudresourcemanager" {
  provider = google-beta
  project  = google_project.project.project_id
  service  = "cloudresourcemanager.googleapis.com"
  depends_on = [
    google_project_service.serviceusage
  ]
}

resource "google_project_service" "identitytoolkit" {
  provider = google-beta
  project  = google_project.project.project_id
  service  = "identitytoolkit.googleapis.com"
  depends_on = [
    google_project_service.serviceusage
  ]
}

resource "google_project_service" "iam" {
  provider = google-beta
  project  = google_project.project.project_id
  service  = "iam.googleapis.com"
  depends_on = [
    google_project_service.serviceusage
  ]
}

# Initialize firebase project
resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
  depends_on = [
    google_project_service.firebase
  ]
}

resource "google_firebase_web_app" "basic" {
  provider        = google-beta
  project         = var.project_id
  display_name    = var.firebase_web_app_name
  deletion_policy = "DELETE"

  depends_on = [google_firebase_project.default]
}

data "google_firebase_web_app_config" "basic" {
  provider   = google-beta
  web_app_id = google_firebase_web_app.basic.app_id
}

resource "google_firestore_database" "database" {
  provider                    = google-beta
  project                     = google_project.project.project_id
  name                        = "(default)"
  location_id                 = var.default_region
  type                        = "FIRESTORE_NATIVE"
  concurrency_mode            = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"

  depends_on = [google_project_service.firestore]
}

resource "google_storage_bucket" "default" {
  provider = google-beta
  project  = var.project_id
  name     = "${google_project.project.project_id}-backup"
  location = var.default_region
}

# Create admin-sdk service account
resource "google_service_account" "admin_sdk" {
  provider     = google-beta
  project      = google_project.project.project_id
  account_id   = "firebase-adminsdk-ouwu6"
  display_name = "firebase-adminsdk"
  depends_on = [
    google_project_service.iam
  ]
}

resource "google_project_iam_member" "admin-sdk-token-creator" {
  provider = google-beta
  project  = google_project.project.id
  role     = "roles/iam.serviceAccountTokenCreator"
  member   = "serviceAccount:${google_service_account.admin_sdk.email}"

}

resource "google_project_iam_member" "admin-sdk-agent" {
  provider = google-beta
  project  = google_project.project.project_id
  role     = "roles/firebase.sdkAdminServiceAgent"
  member   = "serviceAccount:${google_service_account.admin_sdk.email}"
}

resource "google_service_account_key" "admin_sdk" {
  provider           = google-beta
  service_account_id = local.terraform_service_account
  # Wait for the account being added to roles
  depends_on = [
    google_project_iam_member.admin-sdk-token-creator,
    google_project_iam_member.admin-sdk-agent,
  ]
}

# Create firebase storage and enable auth service
resource "null_resource" "activate_storage" {
  triggers = {
    bucket = data.google_firebase_web_app_config.basic.storage_bucket
  }
  provisioner "local-exec" {
    command     = "curl -X POST -H 'Authorization: Bearer ${nonsensitive(data.google_service_account_access_token.default.access_token)}' -H 'Content-Type: application/json' 'https://firebasestorage.googleapis.com/v1beta/projects/${google_project.project.project_id}/buckets/${data.google_firebase_web_app_config.basic.storage_bucket}:addFirebase'"
    interpreter = ["sh", "-c"]
  }
  depends_on = [
    google_firebase_web_app.basic,
    google_project_service.firebasestorage
  ]
}

resource "google_identity_platform_config" "identity_platform_config" {
  provider                   = google-beta
  project                    = google_project.project.project_id
  autodelete_anonymous_users = true
  depends_on = [
    google_firebase_web_app.basic,
    google_project_service.identitytoolkit
  ]
}

resource "google_identity_platform_project_default_config" "identity_project_config" {
  provider = google-beta
  project  = google_project.project.project_id

  sign_in {
    allow_duplicate_emails = false

    email {
      enabled           = true
      password_required = true
    }
  }

  depends_on = [google_identity_platform_config.identity_platform_config]
}

# Write secrets to local file
resource "local_file" "firebase_config" {
  content = jsonencode({
    firebase = {
      appId             = google_firebase_web_app.basic.app_id
      apiKey            = data.google_firebase_web_app_config.basic.api_key
      authDomain        = data.google_firebase_web_app_config.basic.auth_domain
      databaseURL       = lookup(data.google_firebase_web_app_config.basic, "database_url", "")
      storageBucket     = lookup(data.google_firebase_web_app_config.basic, "storage_bucket", "")
      messagingSenderId = lookup(data.google_firebase_web_app_config.basic, "messaging_sender_id", "")
      measurementId     = lookup(data.google_firebase_web_app_config.basic, "measurement_id", "")
    }
  })
  filename = "${path.module}/firebase-config.json"
  depends_on = [
    google_firebase_web_app.basic
  ]
}

resource "local_file" "secrets_file" {
  content = jsonencode({
    private = {
      serviceAccount = jsondecode(base64decode(google_service_account_key.admin_sdk.private_key))
      firebase = {
        backupBucket = google_storage_bucket.default.name
      }
    }
    public = {
      firebase = {
        projectId         = google_project.project.project_id
        appId             = google_firebase_web_app.basic.app_id
        apiKey            = data.google_firebase_web_app_config.basic.api_key
        authDomain        = data.google_firebase_web_app_config.basic.auth_domain
        databaseURL       = lookup(data.google_firebase_web_app_config.basic, "database_url", "")
        storageBucket     = lookup(data.google_firebase_web_app_config.basic, "storage_bucket", "")
        messagingSenderId = lookup(data.google_firebase_web_app_config.basic, "messaging_sender_id", "")
        measurementId     = lookup(data.google_firebase_web_app_config.basic, "measurement_id", "")
      }
    }
  })
  filename = "${path.module}/secrets.json"
  depends_on = [
    google_firebase_web_app.basic
  ]
}

resource "local_file" "firebaserc" {
  content = jsonencode({
    projects = {
      development = google_project.project.project_id
      production  = google_project.project.project_id
    }
  })
  filename = "${path.module}/.firebaserc"
  depends_on = [
    google_project.project
  ]
}


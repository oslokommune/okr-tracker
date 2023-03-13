# Bucket name should match the terraform state bucket of the GCP project you are working with.
# If you are creating a new project, please create a new bucket first with the main.tf file under remote-state/ 
# Or create a new bucket using the GCP console
terraform {
  backend "gcs" {
    bucket                      = "INSERT_NAME" # INSERT BUCKET NAME FROM remote-state/main.tf here!
    impersonate_service_account = "NAME_OF_SERVICE_ACCOUNT_TO_IMPERSONATE"
  }
}

variable "bucket_name_prefix" {
  description = "Variable to prepend to bucket name which will then be $bucket_name_prefix-bucket-tfstate"
  type        = string
  nullable    = false
}

variable "terraform_project_id" {
  description = "The id of the terraform project where your service account resides"
  type        = string
  nullable    = false
}

variable "location" {
  description = "The location of the bucket"
  type        = string
  nullable    = false
  default     = "EUROPE-WEST2"
}
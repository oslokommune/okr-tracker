## Terraform script to provision new firebase projects in GCP with auth and firestore

This doc will provide instructions for setting up the script to run locally. Running the script locally is the current solution, but in the future we hope to run the script from GCP.

### What does the script do?

The tf.main file creates a new project in GCP, attaches firebase, creates a firestore database and adds authentication services with email-password login. Required variables are stated in the variables file and must be filled in when running the script. The script assumes the following GCP structure

- GCP Organization
  - Folder for new projects
    - terraform-project (with service account created in the project)
    - New projects will be created at this level

Note from the structure above that the following is required knowledge when running the script:

- The organization id
- The id of the folder for new projects
- The id of the terraform project along with the email of the terraform service account
- The id of the billing account to use, blaze plan is required to successfully run the script

In addition, the IAM policy Service Account Token Creator is required to have for the user running this script in order to impersonate the terraform service account. The user should only be given this policy on the terraform account and not at the folder or organization level.

### Maintaining state

In order to maintain the state of the resources created by terraform, a back-end has been setup. The state will be stored in the GCP bucket supplied by the user. IMPORTANT: the bucket must be created before running the main.tf script, please create the bucket using the TF script provided in the remote-state folder. MAKE SURE YOU ARE PROVIDING THE CORRECT BUCKET WHEN STORING STATE SO YOU DO NOT OVERWRITE THE STATE OF ANOTHER PROJECT!!

Object versioning is activated on the state buckets, and this may save you if you should accidentally delete state. This also requires regular cleanup of old versions and as of now this is manual work until a rule has been set.

The buckets should be created under the terraform-project in order to keep all terraform state there.

This solution needs some improvement and should be worked on for future releases.

### Running the script

```console
cd terraform
terraform init # Initializes terraform
terraform plan # Preview changes
terraform apply # Apply the plan
```

See above for which variables you need. You can either input them directly as default values under variables.tf or provide them in the terminal after running the script with terraform apply. Make sure you have run terraform init before running the script. Please verify that everything is correct with the plan before typing yes to apply the script. In order to impersonate the terraform service account you need the Service Account Token Creator access on the service account, please contact your GCP admin for this permission.

### Future improvements

- Better state management
- Run the script in GCP instead of locally
- Provide randomized project-id for the user
- Divide code into modules for readability
- Specify versions for providers in terraform config

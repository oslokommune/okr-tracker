# Slugs

Cloud functions for defining slugs for organizations, departments and products.

This cloud function listens for changes and automatically creates a slug from its name and stores it in the `/slugs` collection in Firestore. If an identical slug already exists, the function appends the object's ID as suffix.

- The `/slugs` collection is continously and automatically kept up to date, and can be used for routing users to the correct object.
- The object's `slug` property is mirrored with its couterpart in the `/slugs` collection.

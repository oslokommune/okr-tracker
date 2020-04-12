# Getting started

The e2e tests use [Cypress](https://www.cypress.io/).

Google restricts bots (including Cypress) to log in using Auth2.0 so we need to bypass that. The strategy here is to create separate email/password test users in Firebase and logging these in with a password.

Here's what you need to getting started:

## Firebase Setup

Create two email/password test users on the Firebase Authentication page ('testadmin' as admin user and 'testuser' as a non-admin user). Give them email addresses (do not need to be actual addresses) and secure passwords. Take note of the passwords.

Add the users to the `users` collection in Firestore:

- For the admin user
  - Use the email address as `id`
  - Set `admin` to `true`
  - Set `displayName` to 'Test Admin'
  - Set `slug` to 'test-admin'
- For the non-admin user
  - Use the email address as `id`
  - Set `admin` to `false`
  - Set `displayName` to 'Test User'
  - Set `slug` to 'test-user'

## Update environment variables

In the .env.local file add the following lines

```
VUE_APP_TESTADMIN_USER=<testadmin email>
VUE_APP_TESTADMIN_PASSWORD=<testadmin password>
VUE_APP_TESTUSER_USER=<testuser email>
VUE_APP_TESTUSER_PASSWORD=<testuser password>
```

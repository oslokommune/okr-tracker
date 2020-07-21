# Getting started

The e2e tests use [Cypress](https://www.cypress.io/) in headless mode.

## Update environment variables

In the .env.local file add the following lines

```
VUE_APP_TESTADMIN_USER=<testadmin email>
VUE_APP_TESTADMIN_PASSWORD=<testadmin password>
VUE_APP_TESTUSER_USER=<testuser email>
VUE_APP_TESTUSER_PASSWORD=<testuser password>
```

## Run tests

Make sure that the local development environment is running:

```
npm run local
```

Then run the test:

```
npm run test:e2e
```

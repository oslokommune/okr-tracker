# Getting started

The e2e tests use [Cypress](https://www.cypress.io/) in headless mode.

## Update environment variables

In the .env.local file add the following lines

```
VITE_TESTADMIN_USER=<testadmin email>
VITE_TESTADMIN_PASSWORD=<testadmin password>
VITE_TESTUSER_USER=<testuser email>
VITE_TESTUSER_PASSWORD=<testuser password>
```

## Run tests

To run Cypress tests, make sure that your development server and Firebase emulators are running:

```
§ npm run test:e2e
```

To run the end-to-end tests in headless mode your local development server and Firebase emulator must be shut down.

```
§ npm run test:e2e:headless
```

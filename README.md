# OKR Tracker

**This application is a reporting tool for [OKRs](https://en.wikipedia.org/wiki/OKR) (objectives and key results) using [Vue.js](https://vuejs.org/) and [Google Firebase](https://firebase.google.com/) as a backend.**

For help to use this application, please see the [help page](https://okr.oslo.systems/help) (in Norwegian).

## Set up a new OKR-tracker instance

To create a new instance of the OKR-tracker, please read the [Setting up Firebase](/documentation/setting-up-firebase.md) guide.

## Connecting to an existing OKR-tracker instance

To set up your local development environment, build and deploy for an existing Firebase backend, please see our guide for [Connecting to an existing Firebase project](/documentation/connecting-to-existing-firebase.md).

## Contributing

Please see our [Guidelines](/documentation/contributing.md).

---

Retreive Firebase Functions configuration for running emulated functions locally:

```
firebase functions:config:get > .runtimeconfig.json
```

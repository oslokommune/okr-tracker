const functions = require('firebase-functions');
const config = require('../config');

const handleSlugs = require('./handleSlugs');

exports.SlugDepartment = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`departments/{documentId}`)
  .onWrite(handleSlugs);

exports.SlugOrganization = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`organizations/{documentId}`)
  .onWrite(handleSlugs);

exports.SlugProducts = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`products/{documentId}`)
  .onWrite(handleSlugs);

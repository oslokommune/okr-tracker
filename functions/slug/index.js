const functions = require('firebase-functions');
const config = require('../config');

const handleSlugs = require('./handleSlugs');

exports.SlugDepartment = functions
  .region(config.region)
  .firestore.document(`departments/{documentId}`)
  .onWrite(handleSlugs);

exports.SlugOrganization = functions
  .region(config.region)
  .firestore.document(`organizations/{documentId}`)
  .onWrite(handleSlugs);

exports.SlugProducts = functions.region(config.region).firestore.document(`products/{documentId}`).onWrite(handleSlugs);

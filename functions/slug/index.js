import functions from 'firebase-functions';
import config from '../config.js';

import handleSlugs from './handleSlugs.js';

export const slugDepartment = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`departments/{documentId}`)
  .onWrite(handleSlugs);

export const slugOrganization = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`organizations/{documentId}`)
  .onWrite(handleSlugs);

export const slugProduct = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .firestore.document(`products/{documentId}`)
  .onWrite(handleSlugs);

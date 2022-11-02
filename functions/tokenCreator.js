const admin = require('firebase-admin');
const functions = require('firebase-functions');
const jwt = require('jsonwebtoken');
const config = require('./config');

const auth = admin.auth();

/**
 * CreateCustomToken
 * @token: keycloak token
 * @returns: firebase token
 */
exports.createCustomToken = functions
  .runWith(config.runtimeOpts)
  .region(config.region)
  .https.onCall((token) => {
    const parsedToken = jwt.decode(token);
    if (!parsedToken.resource_access?.['origo-okr-tracker']?.roles?.includes('okr-tracker-user')) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'The user does not have the correct permissions, missing okr-property'
      );
    }

    const userId = parsedToken.preferred_username;
    const additionalClaims = {
      email: parsedToken.email,
      firstName: parsedToken.given_name,
      lastName: parsedToken.family_name,
    };
    return auth
      .createCustomToken(userId, additionalClaims)
      .then((customToken) => customToken)
      .catch((error) => {
        console.log(error);
      });
  });
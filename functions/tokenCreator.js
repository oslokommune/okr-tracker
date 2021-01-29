const admin = require('firebase-admin');
const functions = require('firebase-functions');
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
    console.log(token);
    const userId = token.preferred_username;
    const additionalClaims = {
      email: token.email,
      firstName: token.given_name,
      lastName: token.family_name,
    };
    return auth
      .createCustomToken(userId, additionalClaims)
      .then((customToken) => {
        return customToken;
      })
      .catch((error) => {
        console.log(error);
      });
  });

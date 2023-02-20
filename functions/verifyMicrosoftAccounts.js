const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.verifyMicrosoftAccount = functions.auth.user().onCreate(async (user) => {
  if (user.providerData.find((d) => d && d.providerId === 'microsoft.com') || user.providerData === 'microsoft.com') {
    try {
      await admin.auth().updateUser(user.uid, {
        emailVerified: true,
      });
    } catch (err) {
      console.log('err when verifying email', err);
    }
  }
});

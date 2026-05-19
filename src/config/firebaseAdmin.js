const admin = require('firebase-admin');
const env = require('./env');

let firebaseApp;

const hasServiceCredentials =
  env.firebaseProjectId && env.firebaseClientEmail && env.firebasePrivateKey;

if (hasServiceCredentials) {
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebaseProjectId,
      clientEmail: env.firebaseClientEmail,
      privateKey: env.firebasePrivateKey.replace(/\\n/g, '\n'),
    }),
  });
}

const verifyFirebaseIdToken = async (idToken) => {
  if (!firebaseApp) {
    throw new Error('Firebase Admin is not configured on server.');
  }

  return admin.auth().verifyIdToken(idToken);
};

module.exports = {
  verifyFirebaseIdToken,
};

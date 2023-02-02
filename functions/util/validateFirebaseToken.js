import { getAuth } from 'firebase-admin/auth';

const validateFirebaseIdToken = async (req, res, next) => {
  console.log('Check if request is authorized with Firebase ID token');

  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    console.error(
      'No Firebase ID token was passed as a Bearer token in the Authorization header.',
      'Make sure you authorize your request by providing the following HTTP header:',
      'Authorization: Bearer <Firebase ID Token>.'
    );
    return res.status(403).send(JSON.stringify({ message: 'Unauthorized' }));
  }

  console.log('Found "Authorization" header');

  try {
    const idToken = req.headers.authorization.split('Bearer ')[1];
    req.user = await getAuth().verifyIdToken(idToken);
    return next();
  } catch (error) {
    console.error('Error while verifying Firebase ID token:', error);
    return res.status(403).send(JSON.stringify({ message: 'Unauthorized' }));
  }
};

export default validateFirebaseIdToken;

import { getFirestore } from 'firebase-admin/firestore';

const ensureSuperAdmin = async (req, res, next) => {
  console.log('Ensuring super admin status');

  try {
    const db = getFirestore();
    const user = await db.collection('users').doc(req.user.email).get();

    if (!user?.data()?.superAdmin) {
      console.error('User is missing super admin status');

      return res.status(403).send(JSON.stringify({ message: 'Unauthorized' }));
    }

    console.log('User has super admin status');
    return next();
  } catch (error) {
    console.error('Error while verifying super admin status:', error);
    return res.status(403).send(JSON.stringify({ message: 'Unauthorized' }));
  }
};

export default ensureSuperAdmin;

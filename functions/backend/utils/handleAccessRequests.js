import AccessRequestCollection from './collectionUtils/AccessRequestCollection.js';
import UsersCollection from './collectionUtils/UsersCollection.js';
import DomainWhitelistCollection from './collectionUtils/DomainWhitelistCollection.js';

const addAccessRequest = async (db, accessRequest) => {
  try {
    const accessRequestCollection = new AccessRequestCollection(db);
    const usersCollection = new UsersCollection(db);
    const userRef = usersCollection.getDocumentRef(accessRequest.email);

    if ((await userRef.get()).exists) {
      throw new Error('toaster.request.userExists');
    }

    await accessRequestCollection.addDocument(accessRequest);

    return { code: 201, message: 'toaster.request.requested' };
  } catch (error) {
    return { code: 400, message: error.message || 'toaster.request.error' };
  }
};

export const createAccessRequest = async (db, accessRequest) => {
  const { email } = accessRequest;

  if (!email) {
    return { code: 400, message: 'toaster.request.noEmail' };
  }

  const emailDomain = email.split('@')[1].trim();
  const domainWhitelistCollection = new DomainWhitelistCollection(db);
  const usersCollection = new UsersCollection(db);

  const whitelist = await domainWhitelistCollection.listDocuments();

  if (whitelist.some((x) => x.id.trim() === emailDomain)) {
    try {
      await usersCollection.addDocument({ id: email, email });

      return { code: 201, message: 'toaster.request.userCreated' };
    } catch {
      return addAccessRequest(db, accessRequest);
    }
  }

  return addAccessRequest(db, accessRequest);
};

export const acceptAccessRequest = async (db, id) => {
  try {
    const accessRequestCollection = new AccessRequestCollection(db);
    const usersCollection = new UsersCollection(db);
    const accessReqestRef = await accessRequestCollection.getDocumentRef(id).get();

    if (accessReqestRef.exists) {
      const { email } = accessReqestRef.data();

      await usersCollection.addDocument({ id: email, email });
      await accessRequestCollection.deleteDocument(id);

      return { code: 201, message: 'toaster.request.accepted' };
    }

    return { code: 404, message: 'toaster.request.notFound' };
  } catch (error) {
    return { code: 400, message: error.message || 'toaster.request.error' };
  }
};

export const rejectAccessRequest = async (db, id) => {
  try {
    const accessRequestCollection = new AccessRequestCollection(db);
    const accessReqestRef = await accessRequestCollection.getDocumentRef(id).get();

    if (accessReqestRef.exists) {
      await accessRequestCollection.deleteDocument(id);

      return { code: 200, message: 'toaster.request.rejected' };
    }

    return { code: 404, message: 'toaster.request.notFound' };
  } catch (e) {
    return { code: 400, message: 'toaster.request.error' };
  }
};

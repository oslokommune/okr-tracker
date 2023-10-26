import { db, auth, serverTimestamp } from '@/config/firebaseConfig';
import props from './props';
import {
  validateCreateProps,
  validateUpdateProps,
  createDocument,
  updateDocument,
} from '../common';

const collection = db.collection('apiClients');

const create = async (data) => {
  data = {
    ...data,
    clientId: crypto.randomUUID(),
  };
  if (!validateCreateProps(props, data)) {
    throw new Error('Invalid data');
  }
  return createDocument(collection, data);
};

const update = async (clientRef, data) => {
  if (!clientRef) {
    throw new Error('Missing client reference');
  }
  data.description = data.description || '';
  validateUpdateProps(props, data);
  return updateDocument(clientRef, data);
};

const archive = async (clientRef) => {
  if (!clientRef) {
    throw new Error('Missing client reference');
  }
  try {
    return updateDocument(clientRef, { archived: true });
  } catch (error) {
    throw new Error(`Could not archive client ${clientRef.id}`);
  }
};

const remove = async (clientRef) => {
  if (!clientRef) {
    throw new Error('Missing client reference');
  }
  try {
    return clientRef.delete();
  } catch (error) {
    throw new Error(`Could not delete client ${clientRef.id}`);
  }
};

const createSecret = async (clientRef) => {
  if (!clientRef) {
    throw new Error('Missing client reference');
  }
  try {
    const secret = crypto.randomUUID();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedSecret = hashArray
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    await createDocument(clientRef.collection('secrets'), {
      secret: hashedSecret,
    });
    return secret;
  } catch (error) {
    throw new Error(`Could not create secret for client ${clientRef.id}`);
  }
};

const rotateSecret = async (clientRef) => {
  if (!clientRef) {
    throw new Error('Missing client reference');
  }
  try {
    const secret = await createSecret(clientRef);
    await clientRef.update({
      rotated: serverTimestamp(),
      rotatedBy: db.collection('users').doc(auth.currentUser.email),
    });
    return secret;
  } catch (error) {
    console.log(error);
    throw new Error(`Could not rotate secret for client ${clientRef.id}`);
  }
};

export default {
  collection,
  create,
  update,
  archive,
  remove,
  createSecret,
  rotateSecret,
};

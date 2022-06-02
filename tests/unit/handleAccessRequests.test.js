import { mockFirebase } from 'firestore-jest-mock';
import {
  mockCollection,
  mockDelete,
  mockDoc,
  mockSet,
} from 'firestore-jest-mock/mocks/firestore';

import {
  createAccessRequest,
  acceptAccessRequest,
  rejectAccessRequest,
} from '../../functions/backend/utils/handleAccessRequests.js';
import { DEFAULT_USER_OPTIONS } from '../../functions/backend/utils/collectionUtils/UsersCollection.js';

const createRequest = (email) => ({
  id: email,
  email,
  created: Date.now(),
});

const createUser = (email) => ({
  ...DEFAULT_USER_OPTIONS,
  id: email,
  email: email,
});

const WHITELISTED_DOMAIN = {
  id: 'origo.oslo.kommune.no',
  name: 'Oslo Origo',
};

const WHITELISTED_EMAIL = 'kim@origo.oslo.kommune.no';

const EXISTING_ACCESS_RESQUEST = createRequest('kim@non.whitelisted.domain.no');
const NEW_ACCESS_RESQUEST = createRequest('kim@new.access.req.no');
const EXISTING_USER = createUser('kim@existing.user.no');

mockFirebase({
  database: {
    requestAccess: [
      EXISTING_ACCESS_RESQUEST,
      createRequest(EXISTING_USER.email),
    ],
    domainWhitelist: [WHITELISTED_DOMAIN],
    users: [EXISTING_USER],
  },
});

const firebase = require('firebase');

const db = firebase.firestore();

afterAll(() => {
  jest.clearAllMocks();
});

describe('Create new access request or add user', () => {
  it('returns error if email is not present', async () => {
    const result = await createAccessRequest(db, {});

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 400,
        "message": "toaster.request.noEmail",
      }
    `);
  });

  it('returns error if access request exists', async () => {
    const result = await createAccessRequest(db, EXISTING_ACCESS_RESQUEST);

    expect(mockCollection).toHaveBeenCalledWith('domainWhitelist');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(EXISTING_ACCESS_RESQUEST.email);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 400,
        "message": "toaster.request.requestExists",
      }
    `);
  });

  it('returns error if user with request email exists', async () => {
    const result = await createAccessRequest(
      db,
      createRequest(EXISTING_USER.email)
    );

    expect(mockCollection).toHaveBeenCalledWith('domainWhitelist');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(EXISTING_USER.email);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 400,
        "message": "toaster.request.userExists",
      }
    `);
  });

  it('returns success message and creates access request if domain is not white listed', async () => {
    const result = await createAccessRequest(db, NEW_ACCESS_RESQUEST);

    expect(mockCollection).toHaveBeenCalledWith('domainWhitelist');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(
      NEW_ACCESS_RESQUEST.email.split('@')[1]
    );
    expect(mockDoc).toHaveBeenCalledWith(NEW_ACCESS_RESQUEST.email);
    expect(mockSet).toHaveBeenCalledWith(NEW_ACCESS_RESQUEST);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 201,
        "message": "toaster.request.requested",
      }
    `);
  });

  it('returns success message and creates user if domain is white listed', async () => {
    const result = await createAccessRequest(
      db,
      createRequest(WHITELISTED_EMAIL)
    );

    expect(mockCollection).toHaveBeenCalledWith('domainWhitelist');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(WHITELISTED_DOMAIN.id);
    expect(mockSet).toHaveBeenCalledWith(createUser(WHITELISTED_EMAIL));

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 201,
        "message": "toaster.request.userCreated",
      }
    `);
  });
});

describe('Accept access request', () => {
  it("returns error if access request doesn't exist", async () => {
    const result = await acceptAccessRequest(db, NEW_ACCESS_RESQUEST.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(NEW_ACCESS_RESQUEST.id);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 404,
        "message": "toaster.request.notFound",
      }
    `);
  });

  it('returns error if user already exists', async () => {
    const result = await acceptAccessRequest(db, EXISTING_USER.email);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(EXISTING_USER.email);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 400,
        "message": "toaster.request.userExists",
      }
    `);
  });

  it('returns success message and creates user if access request exists', async () => {
    const result = await acceptAccessRequest(db, EXISTING_ACCESS_RESQUEST.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(EXISTING_ACCESS_RESQUEST.id);
    expect(mockSet).toHaveBeenCalledWith(
      createUser(EXISTING_ACCESS_RESQUEST.email)
    );
    expect(mockDelete).toHaveBeenCalledWith();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 201,
        "message": "toaster.request.accepted",
      }
    `);
  });
});

describe('Reject access request', () => {
  it("returns error if access request doesn't exist", async () => {
    const result = await rejectAccessRequest(db, NEW_ACCESS_RESQUEST.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockDoc).toHaveBeenCalledWith(NEW_ACCESS_RESQUEST.id);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 404,
        "message": "toaster.request.notFound",
      }
    `);
  });

  it('returns success message and deletes request if access request exists', async () => {
    const result = await rejectAccessRequest(db, EXISTING_ACCESS_RESQUEST.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockDoc).toHaveBeenCalledWith(EXISTING_ACCESS_RESQUEST.id);
    expect(mockDelete).toHaveBeenCalledWith();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 200,
        "message": "toaster.request.rejected",
      }
    `);
  });
});

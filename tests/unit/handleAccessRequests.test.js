import { mockFirebase } from 'firestore-jest-mock';
import { mockCollection, mockDelete, mockDoc, mockSet, mockAdd } from 'firestore-jest-mock/mocks/firestore';

import {
  createAccessRequest,
  acceptAccessRequest,
  rejectAccessRequest,
} from '../../functions/backend/utils/handleAccessRequests.js';
import { DEFAULT_USER_OPTIONS } from '../../functions/backend/utils/collectionUtils/UsersCollection.js';

const WHITELISTED_EMAIL = 'kim@origo.oslo.kommune.no';
const EXISTING_USER_EMAIL = 'user@existing.no';

const ACCESS_RESQUEST = {
  id: '123',
  email: 'test@testesen.no',
  created: Date.now(),
};

const ACCESS_RESQUEST_WITH_EXISTING_USER_EMAIL = {
  id: '456',
  email: EXISTING_USER_EMAIL,
  created: Date.now(),
};

const WHITELISTED_DOMAIN = {
  id: 'origo.oslo.kommune.no',
  name: 'Oslo Origo',
};

const USER = {
  id: ACCESS_RESQUEST.email,
  email: ACCESS_RESQUEST.email,
  ...DEFAULT_USER_OPTIONS,
};

const EXISTING_USER = {
  id: EXISTING_USER_EMAIL,
  email: EXISTING_USER_EMAIL,
  ...DEFAULT_USER_OPTIONS,
};

const INVALID_ACCESS_RESQUEST_ID = 'not_valid';

mockFirebase({
  database: {
    requestAccess: [ACCESS_RESQUEST, ACCESS_RESQUEST_WITH_EXISTING_USER_EMAIL],
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
        "code": 500,
        "message": "toaster.request.noEmail",
      }
    `);
  });

  it('returns success message and creates access request if domain is not white listed', async () => {
    const result = await createAccessRequest(db, ACCESS_RESQUEST);

    expect(mockCollection).toHaveBeenCalledWith('domainWhitelist');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith('testesen.no');
    expect(mockAdd).toHaveBeenCalledWith(ACCESS_RESQUEST);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 200,
        "message": "toaster.request.requested",
      }
    `);
  });

  it('returns success message and creates user if domain is white listed', async () => {
    const accessRequest = { ...ACCESS_RESQUEST, email: WHITELISTED_EMAIL };
    const result = await createAccessRequest(db, accessRequest);

    expect(mockCollection).toHaveBeenCalledWith('domainWhitelist');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(WHITELISTED_DOMAIN.id);
    expect(mockSet).toHaveBeenCalledWith({ ...USER, id: WHITELISTED_EMAIL, email: WHITELISTED_EMAIL });

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 200,
        "message": "toaster.request.userCreated",
      }
    `);
  });
});

describe('Accept access request', () => {
  it("returns error if access request doesn't exist", async () => {
    const result = await acceptAccessRequest(db, INVALID_ACCESS_RESQUEST_ID);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(INVALID_ACCESS_RESQUEST_ID);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 404,
        "message": "toaster.request.notFound",
      }
    `);
  });

  it('returns error if user already exists', async () => {
    const result = await acceptAccessRequest(db, ACCESS_RESQUEST_WITH_EXISTING_USER_EMAIL.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(ACCESS_RESQUEST_WITH_EXISTING_USER_EMAIL.id);
    expect(mockDoc).toHaveBeenCalledWith(EXISTING_USER.id);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 500,
        "message": "toaster.request.userExists",
      }
    `);
  });

  it('returns success message and creates user if access request exists', async () => {
    const result = await acceptAccessRequest(db, ACCESS_RESQUEST.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockCollection).toHaveBeenCalledWith('users');
    expect(mockDoc).toHaveBeenCalledWith(ACCESS_RESQUEST.id);
    expect(mockSet).toHaveBeenCalledWith(USER);
    expect(mockDelete).toHaveBeenCalledWith();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 200,
        "message": "toaster.request.accepted",
      }
    `);
  });
});

describe('Reject access request', () => {
  it("returns error if access request doesn't exist", async () => {
    const result = await rejectAccessRequest(db, INVALID_ACCESS_RESQUEST_ID);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockDoc).toHaveBeenCalledWith(INVALID_ACCESS_RESQUEST_ID);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 404,
        "message": "toaster.request.notFound",
      }
    `);
  });

  it('returns success message and deletes request if access request exists', async () => {
    const result = await rejectAccessRequest(db, ACCESS_RESQUEST.id);

    expect(mockCollection).toHaveBeenCalledWith('requestAccess');
    expect(mockDoc).toHaveBeenCalledWith(ACCESS_RESQUEST.id);
    expect(mockDelete).toHaveBeenCalledWith();

    expect(result).toMatchInlineSnapshot(`
      Object {
        "code": 200,
        "message": "toaster.request.rejected",
      }
    `);
  });
});

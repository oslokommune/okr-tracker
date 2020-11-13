export const testOrganization = {
  name: 'Test Org',
  mission_statement: 'This is my mission statement for the test Org.',
  slug: 'test-org',
};

export const testDepartment = {
  name: 'Test Department',
  mission_statement: 'This is my mission statement for the test department.',
  slug: 'test-department',
  parentOrg: 'Test Org',
};

export const testProducts = [
  {
    name: 'Test Product One',
    mission_statement: 'This is my mission statement for the test product one.',
    edited_mission_statement: 'Edited mission statement',
    slug: 'test-product-one',
  },
  {
    name: 'Test Product Two',
    mission_statement: 'This is my mission statement for the test product two.',
    slug: 'test-product-two',
  },
  {
    name: 'Test Product Three',
    mission_statement: 'This is my mission statement for the test product three.',
    slug: 'test-product-three',
  },
];

export const testPeriod = {
  name: 'Q1 TEST',
  date: '2021-01-01 til 2021-06-31',
};

export const testObjective = {
  name: 'Test Objective',
  description: 'This is the description for the test objective.',
};

export const testKeyResult = {
  name: 'Test Key Result',
  longDescription: 'This is a long description for the test key result',
  startValue: 10,
  targetValue: 50,
  progressValue: 30,
  unit: 'TestUnit',
};

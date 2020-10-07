export default {
  name: {
    type: 'string',
    required: true,
  },
  organization: {
    type: 'object',
    required: true,
  },
  department: {
    type: 'object',
    required: true,
  },
  team: {
    type: 'object', // TODO: Add check for array
    required: false,
  },
  missionStatement: {
    type: 'string',
    required: false,
  },
  photoURL: {
    type: 'string',
    required: false,
  },
};

export default {
  name: {
    type: 'string',
    required: true,
  },
  organization: {
    type: 'reference',
    required: true,
  },
  department: {
    type: 'reference',
    required: true,
  },
  team: {
    type: 'array',
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

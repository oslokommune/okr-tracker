export default {
  type: {
    type: 'string',
    required: false,
  },
  name: {
    type: 'string',
    required: true,
  },
  format: {
    type: 'string',
    required: false,
  },
  parent: {
    type: 'reference',
    required: true,
  },
  sheetId: {
    type: 'string',
    required: true,
  },
  sheetCell: {
    type: 'string',
    required: true,
  },
  sheetName: {
    type: 'string',
    required: true,
  },
};

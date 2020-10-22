export default {
  type: {
    type: 'string',
    required: true,
  },
  name: {
    type: 'string',
    required: true,
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

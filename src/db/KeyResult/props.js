export default {
  name: {
    type: 'string',
    required: true,
  },
  objective: {
    type: 'reference',
    required: true,
  },
  parent: {
    type: 'reference',
    required: true,
  },
  startValue: {
    type: 'number',
    required: true,
  },
  targetValue: {
    type: 'number',
    required: true,
  },
  unit: {
    type: 'string',
    required: true,
  },
  notes: {
    type: 'string',
    required: false,
  },
  weight: {
    type: 'number',
    required: false,
  },
  auto: {
    type: 'boolean',
    required: false,
  },
  sheetCell: {
    type: 'string',
    required: false,
  },
  sheetId: {
    type: 'string',
    required: false,
  },
  sheetUrl: {
    type: 'string',
    required: false,
  },
  sheetName: {
    type: 'string',
    required: false,
  },
};

export default {
  view: 'compact',
  widgets: {
    itemHome: {
      progression: true,
      missionStatement: true,
      team: true,
      children: false,
    },
    objectiveHome: {
      progression: true,
      details: false,
      weights: false,
    },
    keyResultHome: {
      details: false,
      notes: true,
      weights: true,
    },
  },
  home: {
    collapse: {
      organization: {},
      department: {},
    },
  },
  homeOrganization: null,
};

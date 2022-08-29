const tabIdsHelper = (prefix) => ({
  tabButton: (index) => `${prefix}TabButton-${index}`,
  tabPanel: (index) => `${prefix}TabPanel-${index}`,
});

export default tabIdsHelper;

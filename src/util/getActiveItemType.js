const getActiveItemType = (activeItem) => {
  const { department, organization } = activeItem;

  if (!organization && !department) {
    return 'organization';
  }
  if (organization && !department) {
    return 'department';
  }
  if (organization && department) {
    return 'product';
  }

  return null;
};

export default getActiveItemType;

export function isOrganization(item) {
  return getActiveItemType(item) === 'organization';
}

export function isDepartment(item) {
  return getActiveItemType(item) === 'department';
}

export function isProduct(item) {
  return getActiveItemType(item) === 'product';
}

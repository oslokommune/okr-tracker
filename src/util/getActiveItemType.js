const getActiveItemType = (activeItem) => {
  const { department, organization } = activeItem;

  if (!organization && !department) return 'organization';
  if (organization && !department) return 'department';
  if (organization && department) return 'product';

  return null;
};

export default getActiveItemType;

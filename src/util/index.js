/* eslint-disable import/prefer-default-export */
export const capitalizeFirstLetterOfNames = (names) =>
  names
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

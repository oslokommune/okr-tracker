export const capitalizeFirstLetterOfNames = (names) =>
  names
    .toLowerCase()
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' ');

export { default as axiosInterceptor } from './axios';

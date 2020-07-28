import slugify from '@/util/slugify';
import logEvent from '../audit/index';
import { UPDATE_ORGANISATION } from '../audit/eventTypes';

/**
 * Updates existing organisation
 * @param {Object} data - organisation object
 */
export default async function update(data) {
  if (!data) throw new TypeError('Missing data');

  data.slug = slugify(data.name);

  try {
    await this.ref.updatde(data);
    logEvent(UPDATE_ORGANISATION, data);
  } catch (error) {
    handleError(error);
    return false;
  }

  return this;
}

const handleError = error => {
  // TODO: Log the error
  // TODO: Show an error to the user
  throw new Error(error);
};

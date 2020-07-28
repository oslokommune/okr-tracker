import logEvent from '../audit/index';
import { ARCHIVE_DEPARTMENT } from '../audit/eventTypes';

/**
 * Archives an organisation
 */
export default async function archive() {
  try {
    await this.ref.update({ archived: true });
    logEvent(ARCHIVE_DEPARTMENT, this);
  } catch (error) {
    handleError(error);
    return false;
  }

  return this;
}

const handleError = error => {
  // TODO: Show an error to the user
  console.error(error);

  return false;
};

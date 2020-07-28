import logEvent from '../audit/index';
import { RESTORE_DEPARTMENT } from '../audit/eventTypes';

/**
 * Restores an organisation
 */
export default async function restore() {
  try {
    await this.ref.update({ archived: false });
    logEvent(RESTORE_DEPARTMENT, this);
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

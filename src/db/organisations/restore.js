import logEvent from '../audit/index';
import { RESTORE_ORGANISATION } from '../audit/eventTypes';

/**
 * Restores an organisation
 */
export default async function restore() {
  try {
    await this.ref.update({ archived: false });
    logEvent(RESTORE_ORGANISATION, this);
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

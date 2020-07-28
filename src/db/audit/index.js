import * as EVENT from './eventTypes';

export default function logEvent(event, payload) {
  // TODO: Save the various events in the audit log

  switch (event) {
    case EVENT.UPDATE_ORGANIZATION:
      // log update event
      console.log('Organisation was updated', payload);
      break;
    case EVENT.ARCHIVE_ORGANIZATION:
      // log archive event
      console.log('Organisation was archived', payload);
      break;

    case EVENT.RESTORE_ORGANIZATION:
      // log archive event
      console.log('Organisation was restored', payload);
      break;

    case EVENT.INVITE_USER:
      // log invite event
      break;
    default:
      break;
  }

  return true;
}

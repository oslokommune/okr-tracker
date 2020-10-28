import Vue from 'vue';
import i18n from '@/locale/i18n';

const standardOption = { duration: 3500 };

export const show = (msg, options = standardOption) => {
  Vue.toasted.show(msg, options);
  return true;
};

export const error = (msg, options = standardOption) => {
  Vue.toasted.error(msg, options);
  return true;
};

const close = (e, toastObject) => {
  toastObject.goAway(0);
};

export function errorSave() {
  return error(i18n.tc('toaster.error.save'));
}

export function errorArchive(document) {
  return error(i18n.tc('toaster.error.archive', null, { document }));
}

export function errorDelete(document) {
  return error(i18n.tc('toaster.error.delete', null, { document }));
}

export function errorRestore(document) {
  return error(i18n.tc('toaster.error.restore', null, { document }));
}

export function errorAdd() {
  return error(i18n.tc('toaster.error.create'));
}

export function savedChanges() {
  return show(i18n.tc('toaster.savedChanges'));
}

export function deletedPermanently() {
  return show(i18n.tc('toaster.delete.permanently'));
}

export function revertedDeletion() {
  return show(i18n.tc('toaster.restored'));
}

export function deletedRegret(obj) {
  const { name, callback } = obj;

  if (!callback) return null;

  const options = {
    duration: 4000,
    action: [
      {
        text: i18n.tc('toaster.action.regret'),
        onClick: () => {
          callback().then(revertedDeletion);
        },
      },
      {
        text: i18n.tc('btn.close'),
        onClick: close,
      },
    ],
  };

  if (name) {
    return show(i18n.tc('toaster.delete.object', null, { name }), options);
  }
  return show(i18n.tc('toaster.deleted'), options);
}

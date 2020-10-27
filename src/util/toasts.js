import Vue from 'vue';
import i18n from '@/locale/i18n';

const standardOption = { duration: 3500 };

export const show = (msg, options = standardOption) => {
  Vue.toasted.show(msg, options);
  return true;
};

export const showError = (msg, options = standardOption) => {
  Vue.toasted.error(msg, options);
  return true;
};

const close = (e, toastObject) => {
  toastObject.goAway(0);
};

export function deleteKeyRes() {
  const options = {
    action: [
      {
        text: i18n.tc('toaster.action.regret'),
        onClick: (e, toastObject) => {
          this.updateKeyRes(this.keyResObject).then(() => {
            this.getAllData();
            toastObject.goAway(0);
          });
        },
      },
      {
        text: i18n.tc('btn.close'),
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        },
      },
    ],
  };

  show(i18n.tc('toaster.delete.keyResult'), options);
}

export function error() {
  return showError(i18n.tc('toaster.error'));
}

export function errorSave() {
  return showError(i18n.tc('toaster.error.save'));
}

export function errorArchive(document) {
  return showError(i18n.tc('toaster.error.archive', null, { document }));
}

export function errorDelete(document) {
  return showError(i18n.tc('toaster.error.delete', null, { document }));
}

export function errorRestore(document) {
  return showError(i18n.tc('toaster.error.restore', null, { document }));
}

export function errorAdd() {
  return showError(i18n.tc('toaster.error.create'));
}

export function savedChanges() {
  return show(i18n.tc('toaster.savedChanges'));
}

export function deletedPermanently() {
  return show(i18n.tc('toaster.delete.permanently'));
}

export function deletedRegret(obj) {
  const { name, callback } = obj;

  if (!callback) return;

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

export function revertedDeletion() {
  return show(i18n.tc('toaster.restored'));
}

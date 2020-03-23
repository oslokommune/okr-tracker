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
        text: i18n.tc('toaster.action.close'),
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        },
      },
    ],
  };

  show(i18n.tc('toaster.delete.keyResult'), options);
}

export function loggedIn(user) {
  show(i18n.tc('toaster.welcome', null, { user: user.displayName ? user.displayName : '' }));
}

export function successFullyAddedUsers(count) {
  show(i18n.tc('toaster.add.users', count));
}

export function deletedUser(user) {
  show(i18n.tc('toaster.delete.user', null, { user }));
}

export function toggleAdmin(user, value) {
  if (value) {
    show(i18n.tc('toaster.add.admin', null, { user: user.displayName || user.email }));
  } else {
    show(i18n.tc('toaster.removedAdmin', null, { user: user.displayName || user.email }));
  }
}

export function error() {
  return show(i18n.tc('toaster.error'));
}

export function savedChanges() {
  return show(i18n.tc('toaster.savedChanges'));
}

export function deleted() {
  return show(i18n.tc('toaster.deleted'));
}

export function addedProduct() {
  return show(i18n.tc('toaster.add.product'));
}

export function addedObjective(periodName) {
  return show(i18n.tc('toaster.add.objective', null, { object: periodName }));
}

export function addedDepartment() {
  return show(i18n.tc('toaster.add.department'));
}

export function addedProgression(callback, ref) {
  const options = {
    action: [
      {
        text: i18n.tc('toaster.addComment'),
        onClick: (e, toastObject) => {
          callback(ref);
          toastObject.goAway(0);
        },
      },
      {
        text: i18n.tc('toaster.action.close'),
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        },
      },
    ],
  };
  return show(i18n.tc('toaster.add.progression'), options);
}

export function addedKeyResult() {
  return show(i18n.tc('toaster.add.keyResult'));
}

export function uploadedPhoto() {
  return show(i18n.tc('toaster.uploadedPhoto'));
}

export function fourOhFour() {
  return show(i18n.tc('toaster.fourOhFour'));
}

export function restored() {
  return show(i18n.tc('toaster.restored'));
}

export function deletedPermanently() {
  return show(i18n.tc('toaster.delete.permanently'));
}

export function deletedRegret(obj) {
  const { name, ref, callback } = obj;

  if (!ref && !callback) return;

  const options = {
    duration: 4000,
    action: [
      {
        text: i18n.tc('toaster.action.regret'),
        onClick: callback || unDelete.bind(null, ref),
      },
      {
        text: i18n.tc('toaster.action.close'),
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

async function unDelete(ref) {
  return ref
    .update({ archived: false })
    .then(revertedDeletion)
    .catch(error);
}

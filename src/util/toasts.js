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
        text: i18n.tc('toaster.regret'),
        onClick: (e, toastObject) => {
          this.updateKeyRes(this.keyResObject).then(() => {
            this.getAllData();
            toastObject.goAway(0);
          });
        },
      },
      {
        text: i18n.tc('toaster.close'),
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        },
      },
    ],
  };

  show(i18n.tc('toaster.deletedKeyResult'), options);
}

export function loggedIn(user) {
  show(i18n.tc('toaster.welcome', null, { user: user.displayName ? user.displayName : '' }));
}

export function successFullyAddedUsers(count) {
  show(i18n.tc('toaster.addedUsers', count));
}

export function deletedUser(user) {
  show(i18n.tc('toaster.deletedUser', null, { user }));
}

export function toggleAdmin(user, value) {
  if (value) {
    show(i18n.tc('toaster.addedAdmin', null, { user: user.displayName || user.email }));
  } else {
    show(i18n.tc('toaster.removedAdmin', null, { user: user.displayName || user.email }));
  }
}

export function error() {
  return show(i18n.tc('toaster.error'));
}

export function savedChanges() {
  return show(i18n.tc('toaster.savedChanged'));
}

export function deleted() {
  return show(i18n.tc('toasted.deleted'));
}

export function addedProduct() {
  return show(i18n.tc('toaster.addedProduct'));
}

export function addedObjective(quarterName) {
  return show(i18n.tc('toaster.addedObjective', null, { object: quarterName }));
}

export function addedDepartment() {
  return show(i18n.tc('toaster.addedDepartment'));
}

export function addedProgression() {
  return show(i18n.tc('toaster.addedPorgression'));
}

export function addedKeyResult() {
  return show(i18n.tc('toaster.addedKeyResylt'));
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
  return show(i18n.tc('toaster.deletedPermanently'));
}

export function deletedRegret(obj) {
  const { name, ref, callback } = obj;

  if (!ref && !callback) return;

  const options = {
    duration: 4000,
    action: [
      {
        text: i18n.tc('toaster.regret'),
        onClick: callback || unDelete.bind(null, ref),
      },
      {
        text: i18n.tc('toaster.close'),
        onClick: close,
      },
    ],
  };

  if (name) {
    return show(i18n.tc('toaster.deletedObject', null, { name }), options);
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

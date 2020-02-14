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
        text: i18n.t('toaster.regret'),
        onClick: (e, toastObject) => {
          this.updateKeyRes(this.keyResObject).then(() => {
            this.getAllData();
            toastObject.goAway(0);
          });
        },
      },
      {
        text: 'Lukk',
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        },
      },
    ],
  };

  show(`Slettet nøkkelresultat`, options);
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
  return show('Lagt til nytt produktområde');
}

export function addedProgression() {
  return show('Lagt til ny måleverdi');
}

export function addedKeyResult() {
  return show('Lagt til nytt nøkkelresultat');
}

export function uploadedPhoto() {
  return show('Lastet opp bilde');
}

export function fourOhFour() {
  return show('Siden eksisterer ikke');
}

export function restored() {
  return show(`Gjenopprettet dokument`);
}

export function deletedPermanently() {
  return show('Slettet dokument permanent');
}

export function deletedRegret(obj) {
  const { name, ref, callback } = obj;

  if (!ref && !callback) return;

  const options = {
    duration: 4000,
    action: [
      {
        text: 'Angre',
        onClick: callback || unDelete.bind(null, ref),
      },
      {
        text: 'Lukk',
        onClick: close,
      },
    ],
  };

  if (name) {
    return show(`Slettet «${name}»`, options);
  }
  return show(`Slettet objekt`, options);
}

export function revertedDeletion() {
  return show('Gjenopprettet objekt');
}

async function unDelete(ref) {
  return ref
    .update({ archived: false })
    .then(revertedDeletion)
    .catch(error);
}

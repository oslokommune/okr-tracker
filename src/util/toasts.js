import Vue from 'vue';

const standardOption = { duration: 2200 };
const show = (msg, options = standardOption) => Vue.toasted.show(msg, options);

export function deleteKeyRes() {
  const options = {
    action: [
      {
        text: 'Angre',
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
  show(`Velkommen ${user.displayName}!`);
}

export function successFullyAddedUsers(count) {
  let str = `Lagt til ${count} `;
  str += count === 1 ? `bruker` : `brukere`;

  show(str);
}

export function deletedUser(user) {
  show(`Slettet bruker ${user.id}`);
}

export function toggleAdmin(user, value) {
  if (value) {
    show(`Gitt ${user.displayName || user.email} admintilgang`);
  } else {
    show(`Fjernet admintilgang for ${user.displayName || user.email}`);
  }
}

export function error() {
  show('Noe gikk galt!');
}

export function savedChanges() {
  show('Lagret endringer');
}

export function deleted() {
  show('Slettet objekt');
}

export function addedProduct() {
  show('Lagt til nytt produkt');
}

export function addedDepartment() {
  show('Lagt til nytt produktområde');
}

export function uploadedPhoto() {
  show('Lastet opp bilde');
}

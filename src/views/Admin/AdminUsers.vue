<template>
  <div>
    <section class="section">
      <h2 class="title-2">Brukeradministrasjon</h2>
      <p>
        Kun registrerte e-post-adresser har tilgang til systemet. Legg til eller fjern adresser her for å styre tilgang.
        Administratorer har tilgang til å redigere (og slette) produkter og produktområder samt redigere denne
        tilgangskontrollen.
      </p>
    </section>
    <hr />
    <div class="section whitelist">
      <div class="whitelist__header">
        <div class="whitelist__row">
          <div class="whitelist__cell whitelist__cell--email">E-post</div>
          <div class="whitelist__cell whitelist__cell--name">Navn</div>
          <div class="whitelist__cell whitelist__cell--admin">Admin</div>
          <div class="whitelist__cell whitelist__cell--action"></div>
        </div>
      </div>
      <div class="whitelist__body">
        <div class="whitelist__row" v-for="u in users" :key="u.id">
          <div class="whitelist__cell whitelist__cell--email">{{ u.id }}</div>
          <div class="whitelist__cell whitelist__cell--name">{{ u.displayName }}</div>
          <div class="whitelist__cell whitelist__cell--admin">
            <label class="toggle">
              <input
                class="toggle__input"
                type="checkbox"
                :checked="u.admin"
                @change="toggleAdmin(u, $event.target.checked)"
              />
              <span class="toggle__switch"></span>
            </label>
          </div>
          <div class="whitelist__cell whitelist__cell--action">
            <button v-if="user" :disabled="u.id === user.email" class="btn btn--borderless" @click="deleteUser(u)">
              Slett
            </button>
          </div>
        </div>
      </div>
    </div>

    <h3 class="title title-3">Legg til e-post-adresser</h3>
    <p>Én adresse per rad</p>
    <div class="form-group">
      <textarea rows="10" v-model="addUserList"></textarea>
    </div>
    <button @click="addEmails">Legg til</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import uniqid from 'uniqid';
import { validateEmail } from '../../util/formValidation';
import { db } from '../../config/firebaseConfig';
import * as Toast from '../../util/toasts';
import Audit from '../../db/audit';

export default {
  name: 'AdminUsers',

  data: () => ({
    addUserList: '',
  }),

  computed: {
    ...mapState(['user', 'users']),
  },

  methods: {
    addEmails() {
      const list = this.addUserList
        .trim()
        .split('\n')
        .filter(Boolean)
        .filter(validateEmail);

      if (!list.length) {
        Toast.show('Ugyldig e-postadresse');
        return;
      }

      const promises = list.map(async email => {
        return db
          .collection('users')
          .doc(email)
          .set({ admin: false, slug: uniqid() });
      });

      Promise.all(promises)
        .then(() => {
          Toast.successFullyAddedUsers(promises.length);
          Audit.addUsers(list);
          this.addUserList = '';
        })
        .catch(err => {
          this.$errorHandler('add_users', this.user.email, this.$route.path, err);
        });
    },

    deleteUser(user) {
      if (user.id === this.user.id) {
        Toast.show('Kan ikke slette deg selv');
        return;
      }

      user.ref
        .delete()
        .then(() => {
          Audit.deleteUser(user.id);
          Toast.deletedUser(user);
        })
        .catch(err => {
          this.$errorHandler('delete_user', this.user.email, this.$route.path, err);
        });
    },

    toggleAdmin(user, value) {
      user.ref
        .update({ admin: value })
        .then(() => {
          Toast.toggleAdmin(user, value);
          Audit.toggleAdmin(user.id, value);
        })
        .catch(err => {
          this.$errorHandler('toggle_admin', this.user.email, this.$route.path, err);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors';

.whitelist {
  $w: &;

  margin-bottom: 3rem;
  overflow: hidden;
  border-bottom: 1px solid $color-border;

  &__body {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 800px;
    max-height: 50vh;
    overflow-x: auto;
    overflow-y: scroll;
  }

  &__row {
    display: flex;
    align-items: center;
    border-top: 1px solid $color-border;

    &:last-child {
      border-bottom: 1px solid $color-border;
    }
  }

  &__header {
    min-width: 800px;
    overflow-x: auto;
    font-weight: 500;
    #{$w}__row {
      border: none;
    }
    #{$w}__cell {
      padding: 0.75rem 0.5rem;
    }
  }

  &__cell {
    padding: 0.25rem 0.5rem;

    &--admin {
      flex-basis: 5rem;
      flex-grow: 0;
      margin-left: auto;
    }

    &--email {
      flex-basis: 40%;
    }

    &--name {
      flex-basis: auto;
    }

    &--action {
      flex-basis: 100px;
      flex-grow: 0;
    }
  }
}
</style>

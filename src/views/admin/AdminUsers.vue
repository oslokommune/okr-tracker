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
        <div class="whitelist__row" v-for="user in users" :key="user.id">
          <div class="whitelist__cell whitelist__cell--email">{{ user.id }}</div>
          <div class="whitelist__cell whitelist__cell--name">{{ user.displayName }}</div>
          <div class="whitelist__cell whitelist__cell--admin">
            <label class="toggle">
              <input
                class="toggle__input"
                type="checkbox"
                :checked="user.admin"
                @change="toggleAdmin(user, $event.target.checked)"
              />
              <span class="toggle__switch"></span>
            </label>
          </div>
          <div class="whitelist__cell whitelist__cell--action">
            <button class="btn btn--borderless" @click="deleteUser(user)">Slett</button>
          </div>
        </div>
      </div>
    </div>

    <h3 class="title title-3">Legg til e-post-adresser</h3>
    <p>Én adresse per rad</p>
    <textarea rows="10" v-model="addUserList"></textarea>
    <button @click="addEmails">Legg til</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { validateEmail } from '@/util/formValidation';
import { db } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';

export default {
  name: 'Admin',

  data: () => ({
    addUserList: '',
  }),

  computed: {
    ...mapState(['users']),
  },

  methods: {
    addEmails() {
      const list = this.addUserList
        .trim()
        .split('\n')
        .filter(Boolean)
        .filter(validateEmail);

      const promises = list.map(email => {
        return db
          .collection('users')
          .doc(email)
          .set({ admin: false });
      });

      Promise.all(promises)
        .then(() => {
          Toast.successFullyAddedUsers(promises.length);
          this.addUserList = '';
        })
        .catch(Toast.error);
    },

    deleteUser(user) {
      user.ref
        .delete()
        .then(Toast.deletedUser)
        .catch(Toast.error);
    },

    toggleAdmin(user, value) {
      user.ref.update({ admin: value }).then(() => {
        Toast.toggleAdmin(user, value);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.whitelist {
  $w: &;

  max-height: 50vh;
  margin-bottom: 3rem;
  overflow-y: scroll;

  &__body {
    display: flex;
    flex-direction: column;
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
      flex-basis: 10rem;
    }

    &--email {
      flex-basis: 50%;
    }

    &--name {
      flex-grow: 1;
    }

    &--action {
      flex-basis: 100px;
    }
  }
}
</style>

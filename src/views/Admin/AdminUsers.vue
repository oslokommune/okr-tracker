<template>
  <div>
    <section class="section">
      <h2 class="title-2">{{ $t('admin.users.title') }}</h2>
      <p>
        {{ $t('admin.users.subtitle') }}
      </p>
    </section>
    <hr />

    <div class="search form-group">
      <label>
        <span class="form-label">{{ $t('admin.users.find') }}</span>
        <input type="text" v-model="query" data-cy="user_search_field" />
      </label>
    </div>

    <hr />

    <div class="section whitelist">
      <div class="whitelist__header">
        <div class="whitelist__row">
          <div @click="sort('id')" class="whitelist__cell whitelist__cell--email">{{ $t('admin.users.email') }}</div>
          <div @click="sort('displayName')" class="whitelist__cell whitelist__cell--name">
            {{ $t('admin.users.name') }}
          </div>
          <div @click="sort('admin')" class="whitelist__cell whitelist__cell--admin">{{ $t('general.admin') }}</div>
          <div class="whitelist__cell whitelist__cell--action"></div>
        </div>
      </div>
      <div class="whitelist__body">
        <div class="whitelist__row" v-for="u in filteredList" :key="u.id">
          <div class="whitelist__cell whitelist__cell--email">{{ u.id }}</div>
          <div class="whitelist__cell whitelist__cell--name">
            <router-link v-if="u.slug" :to="{ name: 'profile', params: { slug: u.slug } }">
              {{ u.displayName }}
            </router-link>
          </div>
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
              {{ $t('admin.users.delete') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <h3 class="title title-3">{{ $t('admin.users.addEmails') }}</h3>
    <p>{{ $t('admin.users.addEmailsHelp') }}</p>
    <div class="form-group">
      <textarea rows="10" v-model="addUserList" data-cy="email_list"></textarea>
    </div>
    <button class="btn btn--primary" @click="addEmails" data-cy="add_users_button">{{ $t('admin.users.add') }}</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import uniqid from 'uniqid';
import Fuse from 'fuse.js';
import { validateEmail } from '@/util/formValidation';
import { db } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';

export default {
  name: 'AdminUsers',

  data: () => ({
    query: '',
    addUserList: '',
    sortBy: 'displayName',
    sortAsc: true,
    filteredList: [],
    fuse: null,
    fuseSettings: {
      threshold: 0.5,
      keys: [
        {
          name: 'id',
          weight: 0.25,
        },
        {
          name: 'email',
          weight: 0.25,
        },
        {
          name: 'displayName',
          weight: 0.5,
        },
      ],
    },
  }),

  computed: {
    ...mapState(['user', 'users']),
  },

  watch: {
    users(users) {
      this.filteredList = users;
      this.fuse = new Fuse(this.filteredList, this.fuseSettings);
    },

    query(str) {
      if (str.length < 2) {
        this.filteredList = this.users;
        return;
      }
      this.filteredList = this.fuse.search(str);
    },

    sortBy() {
      this.filteredList.sort(this.compare);
    },
    sortAsc() {
      this.filteredList.sort(this.compare);
    },
  },

  mounted() {
    this.filteredList = this.users;
    this.fuse = new Fuse(this.filteredList, this.fuseSettings);
  },

  methods: {
    sort(prop) {
      if (prop === this.sortBy) {
        this.sortAsc = !this.sortAsc;
        return;
      }
      this.sortBy = prop;
    },

    filter() {
      const res = this.fuse.search(this.query);
      return res;
    },

    compare(a, b) {
      const prop = this.sortBy;
      const inverse = this.sortAsc ? 1 : -1;
      if (a[prop] > b[prop]) return 1 * inverse;
      if (a[prop] < b[prop]) return -1 * inverse;
      return 0;
    },

    addEmails() {
      const list = this.addUserList.trim().split('\n').filter(Boolean).filter(validateEmail);

      if (!list.length) {
        Toast.show('Ugyldig e-postadresse');
        return;
      }

      const promises = list.map(async email => {
        return db.collection('users').doc(email).set({ admin: false, slug: uniqid() });
      });

      Promise.all(promises)
        .then(() => {
          Toast.successFullyAddedUsers(promises.length);
          Audit.addUsers(list);
          this.addUserList = '';
        })
        .catch(err => {
          this.$errorHandler('add_users_error', err);
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
          this.$errorHandler('delete_user_error', err);
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
          this.$errorHandler('toggle_admin_error', err);
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
      cursor: pointer;
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

<template>
  <div>
    <h2 class="title-2">Users</h2>

    <div class="users" v-if="!selectedUser && !viewAddUsers">
      <div class="search">
        <label class="form__group">
          <input class="form__field" type="text" v-model="query" :placeholder="`Search ${users.length} users`" />
        </label>
      </div>

      <div class="users__list">
        <button class="users__list-item" v-for="user in filteredUsers" :key="user.id" @click="selectedUser = user">
          <span class="users__list-item-icon fa" :class="user.admin ? 'fa-user-cog' : 'fa-user'"></span>
          <span class="users__list-item-name">
            {{ user.displayName || user.id }}
          </span>
          <span class="users__list-item-chevron fa fa-chevron-right"></span>
        </button>
      </div>
      <div class="users__footer">
        <button class="btn btn--fw" @click="viewAddUsers = true">Add users</button>
      </div>
    </div>

    <edit-user v-if="selectedUser && !viewAddUsers" :selected-user="selectedUser" @close="selectedUser = null">
      <template v-slot:back>
        <div><button class="btn" @click="selectedUser = null">Back to users</button></div>
      </template>
    </edit-user>
    <add-users v-if="viewAddUsers" @close="viewAddUsers = false">
      <template v-slot:back>
        <div><button class="btn" @click="viewAddUsers = false">Back to users</button></div>
      </template>
    </add-users>
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import { db } from '@/config/firebaseConfig';

const fuseSettings = {
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
};

export default {
  data: () => ({
    users: [],
    query: '',
    selectedUser: null,
    viewAddUsers: false,
    filteredUsers: [],
    fuse: null,
  }),

  components: {
    EditUser: () => import('./EditUser.vue'),
    AddUsers: () => import('./AddUsers.vue'),
  },

  watch: {
    users: {
      immediate: true,
      handler() {
        this.filteredUsers = this.users;
        this.fuse = new Fuse(this.filteredUsers, fuseSettings);
      },
    },
    query(str) {
      if (str.length < 1) {
        this.filteredUsers = this.users;
      } else {
        this.filteredUsers = this.fuse.search(str).map(({ item }) => item);
      }
    },
  },

  firestore: {
    users: db.collection('users').orderBy('id', 'asc'),
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.search {
  padding: 0rem;
}

.form__field {
  width: 100%;
  padding: 1rem;
  font-weight: 500;
  font-size: 1rem;
  background: $color-grey-50;
  border: none;
  border-top-left-radius: 3px;
  border-top-right-radius: 3px;
}

.users,
.selected-user,
.add-users {
  display: flex;
  flex-direction: column;
  height: 32rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);
}

.users__list {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.users__list-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: $color-purple;
  font-weight: 500;
  background: none;
  border: 0;
  border-bottom: 1px solid $color-grey-100;
  cursor: pointer;

  &:hover {
    background: $color-grey-50;

    & > .users__list-item-chevron {
      opacity: 1;
    }
  }
}

.users__list-item-chevron {
  margin-left: auto;
  padding-left: 0.25rem;
  opacity: 0.25;
}

.users__list-item-icon {
  flex: 0 0 1.75rem;
  text-align: left;
}

.users__list-item-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.users__footer {
  margin-top: auto;
  padding: 1rem;
  font-size: 0.79rem;
}
</style>

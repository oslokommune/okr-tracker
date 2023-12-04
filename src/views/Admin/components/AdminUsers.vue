<template>
  <div>
    <h2 class="title-2">{{ $t('admin.users.users') }}</h2>

    <div v-if="!selectedUser && !viewAddUsers" class="users">
      <div class="search">
        <input
          v-model="query"
          class="pkt-form-input"
          type="text"
          :placeholder="$t('admin.users.search', { count: users.length })"
        />
      </div>

      <div class="users__list">
        <button
          v-for="user in filteredUsers"
          :key="user.id"
          class="users__list-item pkt-txt-14-medium"
          @click="selectedUser = user"
        >
          <pkt-icon class="icon" :name="isAdmin(user) ? 'cogwheel' : 'user'" />
          <span class="users__list-item-name">
            {{ user.displayName || user.id }}
          </span>
          <pkt-icon class="icon" name="chevron-right" />
        </button>
      </div>
      <div class="users__footer">
        <pkt-button skin="secondary" @onClick="viewAddUsers = true">
          {{ $t('admin.users.addUsers') }}
        </pkt-button>
      </div>
    </div>

    <edit-user
      v-if="selectedUser && !viewAddUsers"
      :selected-user="selectedUser"
      @close="selectedUser = null"
    >
      <template #back>
        <div>
          <pkt-button skin="secondary" @onClick="selectedUser = null">
            {{ $t('admin.users.backToUsers') }}
          </pkt-button>
        </div>
      </template>
    </edit-user>
    <add-users v-if="viewAddUsers" @close="viewAddUsers = false">
      <template #back>
        <div>
          <pkt-button skin="secondary" @onClick="viewAddUsers = false">
            {{ $t('admin.users.backToUsers') }}
          </pkt-button>
        </div>
      </template>
    </add-users>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Fuse from 'fuse.js';
import { PktButton } from '@oslokommune/punkt-vue2';
import isAdmin from '@/util/user';
import AddUsers from './AddUsers.vue';
import EditUser from './EditUser.vue';

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
  name: 'AdminUsers',

  components: {
    EditUser,
    AddUsers,
    PktButton,
  },

  data: () => ({
    query: '',
    selectedUser: null,
    viewAddUsers: false,
    filteredUsers: [],
    fuse: null,
  }),

  computed: {
    ...mapState(['users']),
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

  methods: { isAdmin },
};
</script>

<style lang="scss" scoped>
.users,
.selected-user,
.add-users {
  display: flex;
  flex-direction: column;
  background: var(--color-gray-light);
}

.add-users,
.users {
  height: 32rem;
}

.users__list {
  display: flex;
  flex-direction: column;
  overflow: auto;
}

.users__list-item {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--color-text);
  background: none;
  border: 0;
  border-bottom: 2px solid var(--color-border);
  cursor: pointer;

  &:hover .users__list-item-name {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
  }
}

.users__list-item-name {
  flex: 1 0 auto;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
  text-overflow: ellipsis;
}

.users__footer {
  margin-top: auto;
  padding: 1rem;
  font-size: 0.79rem;

  .pkt-btn {
    justify-content: center;
    width: 100%;
  }
}

.icon {
  height: 1rem;
}
</style>

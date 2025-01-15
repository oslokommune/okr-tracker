<script setup>
import { ref } from 'vue';
import { useFuse } from '@vueuse/integrations/useFuse';
import { PktButton } from '@oslokommune/punkt-vue';
import { storeToRefs } from 'pinia';
import { useAdminStore } from '@/store/admin';
import isAdmin from '@/util/user';
import AddUsers from './AddUsers.vue';
import EditUser from './EditUser.vue';

const { users } = storeToRefs(useAdminStore());

const userQuery = ref('');
const selectedUser = ref(null);
const viewAddUsers = ref(false);

const { results: searchResults } = useFuse(userQuery, users, {
  fuseOptions: {
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
  matchAllWhenSearchEmpty: true,
});
</script>

<template>
  <div>
    <h2 class="title-2">{{ $t('admin.users.users') }}</h2>

    <div v-if="!selectedUser && !viewAddUsers" class="users">
      <div class="search">
        <input
          v-model="userQuery"
          class="pkt-input pkt-input--fullwidth"
          type="text"
          :placeholder="$t('admin.users.search', { count: users.length })"
        />
      </div>

      <div class="users__list">
        <button
          v-for="{ item: user } in searchResults"
          :key="user.id"
          class="users__list-item pkt-txt-14-medium"
          @click="selectedUser = user"
        >
          <PktIcon class="icon" :name="isAdmin(user) ? 'cogwheel' : 'user'" />
          <span class="users__list-item-name">
            {{ user.displayName || user.id }}
          </span>
          <PktIcon class="icon" name="chevron-right" />
        </button>
      </div>

      <div class="users__footer">
        <PktButton
          skin="secondary"
          icon-name="plus-sign"
          variant="icon-left"
          @on-click="viewAddUsers = true"
        >
          {{ $t('admin.users.addUsers') }}
        </PktButton>
      </div>
    </div>

    <EditUser
      v-if="selectedUser && !viewAddUsers"
      :user-id="selectedUser.id"
      @close="selectedUser = null"
    >
      <template #back>
        <div>
          <PktButton skin="secondary" @on-click="selectedUser = null">
            {{ $t('admin.users.backToUsers') }}
          </PktButton>
        </div>
      </template>
    </EditUser>

    <AddUsers v-if="viewAddUsers" @close="viewAddUsers = false">
      <template #back>
        <div>
          <PktButton skin="secondary" @on-click="viewAddUsers = false">
            {{ $t('admin.users.backToUsers') }}
          </PktButton>
        </div>
      </template>
    </AddUsers>
  </div>
</template>

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

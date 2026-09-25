<script setup>
import { ref } from 'vue';
import { useFuse } from '@vueuse/integrations/useFuse';
import '@oslokommune/punkt-elements/dist/pkt-button.js';
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
  <div class="user-list">
    <h2 class="user-list__title">{{ $t('admin.users.users') }}</h2>

    <div v-if="!selectedUser && !viewAddUsers" class="user-list__body">
      <div v-if="users.length > 10">
        <input
          v-model="userQuery"
          class="pkt-input pkt-input--fullwidth"
          type="text"
          :placeholder="$t('admin.users.search', { count: users.length })"
        />
      </div>

      <div class="user-list__list">
        <button
          v-for="{ item: user } in searchResults"
          :key="user.id"
          class="user-list__button pkt-txt-16-medium"
          @click="selectedUser = user"
        >
          <pkt-icon :name="isAdmin(user) ? 'cogwheel' : 'user'" />
          <span>{{ user.displayName || user.id }}</span>
          <pkt-icon name="chevron-right" />
        </button>
      </div>

      <div class="user-list__footer">
        <pkt-button
          full-width
          skin="secondary"
          iconName="plus-sign"
          variant="icon-left"
          @click="viewAddUsers = true"
        >
          <span>{{ $t('admin.users.addUsers') }}</span>
        </pkt-button>
      </div>
    </div>

    <EditUser
      v-if="selectedUser && !viewAddUsers"
      :user-id="selectedUser.id"
      @close="selectedUser = null"
    >
      <template #back>
        <div>
          <pkt-button
            skin="tertiary"
            iconName="chevron-left"
            variant="icon-left"
            @click="selectedUser = null"
          >
            <span>{{ $t('admin.users.backToUsers') }}</span>
          </pkt-button>
        </div>
      </template>
    </EditUser>

    <AddUsers v-if="viewAddUsers" @close="viewAddUsers = false">
      <template #back>
        <pkt-button
          skin="tertiary"
          iconName="chevron-left"
          variant="icon-left"
          @click="viewAddUsers = false"
        >
          <span>{{ $t('admin.users.backToUsers') }}</span>
        </pkt-button>
      </template>
    </AddUsers>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.user-list {
  &__title {
    @include get-text('pkt-txt-18-medium');
    margin-bottom: 0.75rem;

    @include bp('tablet-up') {
      @include get-text('pkt-txt-20-medium');
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    height: 32rem;
    background: var(--color-gray-light);
  }

  &__list {
    flex: 1;
    overflow: auto;
  }

  &__button {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    width: 100%;
    padding: 0.5rem 1rem;
    color: var(--color-text);
    background: none;
    border: 0;
    border-bottom: 2px solid var(--color-border);
    cursor: pointer;

    &:hover {
      text-decoration: underline;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.3em;
    }

    .pkt-icon {
      height: 1rem;
    }

    span {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-align: left;
      text-overflow: ellipsis;
    }
  }

  &__footer {
    margin-top: auto;
    padding: 1rem;

    :deep(.pkt-btn) {
      justify-content: center;
    }
  }
}
</style>

<template>
  <div v-if="thisUser" class="selected-user">
    <slot name="back"></slot>

    <div class="selected-user__main">
      <h2 class="title-2">{{ $t('admin.users.edit') }}</h2>
      <validation-observer v-slot="{ handleSubmit }">
        <form id="user-form" @submit.prevent="handleSubmit(save)">
          <label class="form-group">
            <span class="form-label">{{ $t('fields.email') }}</span>
            <input v-model="thisUser.id" class="form__field" type="email" disabled />
          </label>

          <form-component
            v-model="thisUser.displayName"
            input-type="input"
            name="name"
            :label="$t('fields.displayName')"
            rules="required"
            type="text"
          />

          <label class="form-group--checkbox">
            <span class="form-label">{{ $t('general.superAdmin') }}</span>
            <input
              v-model="thisUser.superAdmin"
              class="form__checkbox"
              type="checkbox"
              :disabled="user.email === selectedUser.email || !user.superAdmin"
            />
          </label>

          <div class="form-group">
            <span class="form-label">Admin</span>
            <v-select
              v-model="thisUser.admin"
              multiple
              :options="organizations"
              :get-option-label="(option) => option.name"
              :disabled="!user.superAdmin"
            >
            </v-select>
          </div>
        </form>
      </validation-observer>
    </div>

    <div class="selected-user__footer button-row">
      <button
        class="btn btn--delete-user"
        :disabled="user.email === selectedUser.email || loading"
        @click="remove(selectedUser)"
      >
        <i class="icon fa fa-fw fa-trash" />
        {{ $t('btn.deleteUser') }}
      </button>
      <button class="btn btn--pri" form="user-form" :disabled="loading">
        <i class="icon fa fa-fw fa-save" />
        {{ $t('btn.saveChanges') }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import User from '@/db/User';
import { db } from '@/config/firebaseConfig';

export default {
  name: 'EditUser',

  props: {
    selectedUser: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    thisUser: null,
    loading: false,
  }),

  computed: {
    ...mapState(['user', 'organizations', 'users']),
  },

  watch: {
    selectedUser: {
      immediate: true,
      async handler() {
        this.image = null;
        this.thisUser = { ...this.selectedUser };

        if (this.selectedUser.admin?.length > 0) {
          const orgs = [];
          this.selectedUser.admin.forEach((org) => orgs.push(db.collection('organizations').doc(org).get()));
          const dataArr = await Promise.all(orgs);
          this.thisUser.admin = dataArr.map((org) => ({
            ...org.data(),
            id: org.id,
          }));
        }
      },
    },
  },

  methods: {
    async remove(user) {
      this.loading = true;
      try {
        await User.remove(user);
        this.$toasted.show(this.$t('toaster.delete.user', { user: user.displayName }));
        this.$emit('close');
      } catch {
        this.$toasted.error(this.$t('toaster.error.user', { user: user.displayName }));
      }
      this.loading = false;
    },

    async save() {
      this.loading = true;
      try {
        const saveUser = { ...this.thisUser };
        if (this.thisUser.admin?.length > 0) {
          saveUser.admin = saveUser.admin.map((org) => org.id);
        }
        await User.update(saveUser);
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (e) {
        console.log(e);
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.selected-user {
  padding: 1rem;
}

.selected-user__main {
  margin-top: 1rem;
}

.selected-user__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: auto -0.25rem -0.25rem;

  > .btn {
    margin: 0.25rem;
  }
}

.selected-user__image--flex {
  display: flex;
}

.selected-user__image--img {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  background: white;
  border-radius: 2rem;
}

.btn--pri {
  color: var(--color-text);
  background: var(--color-green);
}

.btn--delete-user {
  color: var(--color-text);
  background: transparent;
}

.button-row {
  display: flex;
  justify-content: flex-end;
}
</style>

<template>
  <div v-if="thisUser" class="selected-user">
    <slot name="back"></slot>

    <h2 class="title-2">{{ $t('admin.users.edit') }}</h2>

    <form-section>
      <form-component
        v-model="thisUser.id"
        input-type="input"
        name="id"
        :label="$t('fields.email')"
        rules="required"
        type="email"
        :disabled="true"
      />

      <form-component
        v-model="thisUser.displayName"
        input-type="input"
        name="name"
        :label="$t('fields.displayName')"
        rules="required"
        type="text"
      />

      <form-component
        v-model="thisUser.admin"
        input-type="custom-select"
        select-mode="tags"
        name="admin"
        :disabled="!user.superAdmin"
        :label="$t('general.admin')"
        value-prop="id"
        label-prop="name"
        :store-object="true"
        :options="organizations.map(({ id, name }) => ({ id, name }))"
      />

      <form-component
        v-model="thisUser.superAdmin"
        input-type="switch"
        name="superadmin"
        :label="$t('general.superAdmin')"
        :disabled="user.email === selectedUser.email || !user.superAdmin"
      />

      <template #actions="{ submit, disabled }">
        <btn-delete
          :disabled="user.email === selectedUser.email || loading"
          @on-click="remove(selectedUser)"
        />
        <btn-save :disabled="disabled || loading" @on-click="submit(save)" />
      </template>
    </form-section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import User from '@/db/User';
import { FormSection, BtnSave, BtnDelete } from '@/components/generic/form';

export default {
  name: 'EditUser',

  components: { FormSection, BtnSave, BtnDelete },

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
        this.thisUser = {
          ...this.selectedUser,
          superAdmin: this.selectedUser.superAdmin || false,
        };

        if (this.selectedUser.admin?.length) {
          this.thisUser.admin = this.selectedUser.admin
            .filter((id) => this.organizations.map((o) => o.id).includes(id))
            .map((id) => ({
              id,
              name: this.organizations.find((o) => o.id === id).name,
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

  > h2.title-2 {
    margin-top: 1.5rem;
  }
}
</style>

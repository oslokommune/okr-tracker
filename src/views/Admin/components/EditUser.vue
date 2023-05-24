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

      <toggle-button
        v-model="thisUser.superAdmin"
        name="superadmin"
        :label="$t('general.superAdmin')"
        :disabled="user.email === selectedUser.email || !user.superAdmin"
      />

      <div class="pkt-form-group">
        <span class="pkt-form-label" for="admin">
          {{ $t('general.admin') }}
          <span class="pkt-badge">{{ $t('validation.optional') }}</span>
        </span>
        <v-select
          id="admin"
          v-model="thisUser.admin"
          multiple
          :options="organizations"
          :get-option-label="(option) => option.name"
          :disabled="!user.superAdmin"
        >
        </v-select>
      </div>

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-delete
          :disabled="user.email === selectedUser.email || loading"
          @click="remove(selectedUser)"
        />
        <btn-save
          :disabled="submitDisabled || loading"
          data-cy="btn-createOrg"
          @click="handleSubmit(save)"
        />
      </template>
    </form-section>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import User from '@/db/User';
import { db } from '@/config/firebaseConfig';
import { FormSection, BtnSave, BtnDelete, ToggleButton } from '@/components/generic/form';

export default {
  name: 'EditUser',
  components: { FormSection, BtnSave, BtnDelete, ToggleButton },

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
        this.thisUser = {
          ...this.selectedUser,
          superAdmin: this.selectedUser.superAdmin || false,
        };

        if (this.selectedUser.admin?.length > 0) {
          const orgs = [];
          this.selectedUser.admin.forEach((org) =>
            orgs.push(db.collection('organizations').doc(org).get())
          );
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

  > h2.title-2 {
    margin-top: 1.5rem;
  }
}
</style>

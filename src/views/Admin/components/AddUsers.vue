<template>
  <div class="add-users">
    <slot name="back"></slot>

    <form-section>
      <form-component
        v-model="emails"
        input-type="textarea"
        name="emails"
        rules="required"
        :label="$t('admin.users.registerUsersText')"
        class="add-users__input"
      />
      <template #actions="{ submit, disabled }">
        <btn-save
          :disabled="disabled || loading"
          :text="$t('admin.users.registerUsersButton')"
          @on-click="submit(save)"
        />
      </template>
    </form-section>
  </div>
</template>

<script>
import { email } from '@vee-validate/rules';
import User from '@/db/User';
import { BtnSave, FormSection } from '@/components/generic/form';

export default {
  name: 'AddUsers',

  components: {
    BtnSave,
    FormSection,
  },

  data: () => ({
    emails: '',
    loading: false,
  }),

  methods: {
    async save() {
      this.loading = true;
      const list = this.emails.trim().split('\n').filter(Boolean).filter(email);

      if (!list.length) {
        this.$toasted.error(this.$t('toaster.error.email'));
        this.loading = false;
        return;
      }

      try {
        await User.addUsers(list);
        this.$emit('close');
        this.$toasted.show(
          this.$tc('toaster.add.users', list.length, { count: list.length })
        );
      } catch (error) {
        this.$toasted.error(this.$tc('toaster.error.users', list.length));
        throw new Error(error);
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.add-users {
  gap: 1rem;
  padding: 1rem;
}
</style>

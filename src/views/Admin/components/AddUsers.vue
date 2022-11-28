<template>
  <div class="add-users">
    <slot name="back"></slot>

    <div class="add-users__body">
      <p>{{ $t('admin.users.registerUsersText') }}</p>
      <textarea v-model="emails" class="add-users__input form-field" />
    </div>
    <div class="add-users__footer">
      <button class="btn btn--fw" :disabled="loading" @click="save">
        {{ $t('admin.users.registerUsersButton') }}
      </button>
    </div>
  </div>
</template>

<script>
import User from '@/db/User';
import { validateEmail } from '@/util';

export default {
  name: 'AddUsers',

  data: () => ({
    emails: '',
    loading: false,
  }),

  methods: {
    async save() {
      this.loading = true;
      const list = this.emails.trim().split('\n').filter(Boolean).filter(validateEmail);

      if (!list.length) {
        this.$toasted.error(this.$t('toaster.error.email'));
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
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.add-users__body {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 1rem 0;
}

.add-users__input {
  flex-grow: 1;
  margin-top: 0.5rem;
  padding: 1rem;
}

.add-users__footer {
  margin-top: auto;
}
</style>

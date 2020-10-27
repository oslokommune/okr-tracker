<template>
  <div class="add-users">
    <slot name="back"></slot>

    <div class="add-users__body">
      <p>{{ $t('admin.users.registerUsersText') }}</p>
      <textarea class="add-users__input form-field" v-model="emails"></textarea>
    </div>
    <div class="add-users__footer">
      <button class="btn btn--fw" @click="save" :disabled="loading">{{ $t('admin.users.registerUsersButton') }}</button>
    </div>
  </div>
</template>

<script>
import User from '@/db/User';
import validateEmail from '@/util/validateEmail';
import * as Toast from '@/util/toasts';

export default {
  data: () => ({
    emails: '',
    loading: false,
  }),

  methods: {
    async save() {
      this.loading = true;
      const list = this.emails.trim().split('\n').filter(Boolean).filter(validateEmail);

      if (!list.length) {
        Toast.showError('Ugyldig e-postadresse');
        return;
      }

      try {
        await User.addUsers(list);
        this.$emit('close');
        Toast.show(`Successfully added ${list.length} users`);
      } catch (error) {
        Toast.showError(`Could not add users`);
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

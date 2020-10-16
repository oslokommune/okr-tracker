<template>
  <div class="add-users">
    <slot name="back"></slot>

    <div class="add-users__body">
      <p>Enter email addresses <br />(one address per line):</p>
      <textarea class="add-users__input form-field" v-model="emails"></textarea>
    </div>
    <div class="add-users__footer">
      <button class="btn btn--fw" @click="save" :disabled="loading">Register users</button>
    </div>
  </div>
</template>

<script>
import User from '@/db/User';
import validateEmail from '@/util/validateEmail';

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
        this.$toasted.show('Ugyldig e-postadresse');
        return;
      }

      try {
        await User.addUsers(list);
        this.$emit('close');
        this.$toasted.show(`Successfully added ${list.length} users`);
      } catch (error) {
        this.$toasted.show(`Could not add users`);
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

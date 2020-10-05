<template>
  <div class="selected-user">
    <slot name="back"></slot>

    <div class="selected-user__main">
      <h2 class="title-2">Edit user</h2>
      <form id="user-form" @submit.prevent="save(thisUser)">
        <label class="form-group">
          <span class="form-label">Email</span>
          <input class="form__field" type="email" v-model="thisUser.id" disabled />
        </label>

        <label class="form-group">
          <span class="form-label">Display name</span>
          <input class="form__field" type="text" v-model="thisUser.displayName" />
        </label>

        <label class="form-group--checkbox">
          <span class="form-label">Admin</span>
          <input
            class="form__checkbox"
            type="checkbox"
            v-model="thisUser.admin"
            :disabled="user.email === selectedUser.email"
          />
        </label>
      </form>
    </div>

    <div class="selected-user__footer">
      <button class="btn" form="user-form">Save changes</button>
      <button class="btn btn--danger" @click="remove(selectedUser)" :disabled="user.email === selectedUser.email">
        Remove user
      </button>
    </div>
  </div>
</template>

<script>
import User from '@/db/User';
import { mapState } from 'vuex';

export default {
  props: {
    selectedUser: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    thisUser: null,
  }),

  computed: {
    ...mapState(['user']),
  },

  methods: {
    remove(user) {
      User.remove(user);
      this.$emit('close');
    },
    save: User.update,
  },

  watch: {
    selectedUser: {
      immediate: true,
      handler() {
        this.thisUser = this.selectedUser;
      },
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
</style>

<template>
  <div class="selected-user">
    <slot name="back"></slot>

    <div class="selected-user__main">
      <h2 class="title-2">{{ $t('admin.users.edit') }}</h2>
      <form id="user-form" @submit.prevent="save(thisUser)">
        <label class="form-group">
          <span class="form-label">{{ $t('fields.email') }}</span>
          <input class="form__field" type="email" v-model="thisUser.id" disabled />
        </label>

        <label class="form-group">
          <span class="form-label">{{ $t('fields.displayName') }}</span>
          <input class="form__field" type="text" v-model="thisUser.displayName" />
        </label>

        <label class="form-group--checkbox">
          <span class="form-label">{{ $t('general.admin') }}</span>
          <input
            class="form__checkbox"
            type="checkbox"
            v-model="thisUser.admin"
            :disabled="user.email === selectedUser.email"
          />
        </label>
      </form>
      <div>
        <span class="form-label">{{ $t('admin.users.image') }}</span>
        <div class="image">
          <img :src="selectedUser.photoURL" class="image__image" v-if="selectedUser.photoURL" />
          <input type="file" @input="setImage" accept="image/png, image/jpeg" class="image__field" />
          <button v-if="selectedUser.photoURL" class="btn" @click="deleteImage" :disabled="loading">
            {{ $t('btn.deleteImage') }}
          </button>
        </div>
      </div>
    </div>

    <div class="selected-user__footer">
      <button class="btn" form="user-form" :disabled="loading">{{ $t('btn.saveChanges') }}</button>
      <button
        class="btn btn--danger"
        @click="remove(selectedUser)"
        :disabled="user.email === selectedUser.email || loading"
      >
        {{ $t('btn.deleteUser') }}
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
    image: null,
    loading: false,
  }),

  computed: {
    ...mapState(['user']),
  },

  methods: {
    remove(user) {
      this.loading = true;
      User.remove(user);
      this.$emit('close');
      this.loading = false;
    },
    setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
      this.uploadImage();
    },
    async uploadImage() {
      this.loading = true;
      try {
        const url = await User.uploadImage(this.user.id, this.image);
        this.image = null;
        this.thisUser.photoURL = url;
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
    },
    async deleteImage() {
      this.loading = true;
      try {
        this.thisUser.photoURL = null;
        this.image = null;
        await this.save(this.thisUser);
        await User.deleteImage(this.user.id);
      } catch (error) {
        // throw new Error(error);
      }

      this.loading = false;
    },
    async save(user) {
      this.loading = true;
      try {
        this.image = null;
        await User.update(user);
        this.$toasted.show('Success');
      } catch {
        this.$toasted.show('Failed');
      }

      this.loading = false;
    },
  },

  watch: {
    selectedUser: {
      immediate: true,
      handler() {
        this.image = null;
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

.image {
  display: flex;
}

.image__image {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  background: white;
  border-radius: 2rem;
}
</style>

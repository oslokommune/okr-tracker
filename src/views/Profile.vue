<template>
  <div v-if="user">
    <header class="product-header">
      <div class="container">
        <div class="product-header__container">
          <div class="product-header__name" contenteditable @blur="updateName">
            <h1 class="title-1" ref="name">{{ user.displayName }}</h1>
          </div>

          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="`Profilbilde for ${user.name}`"
            class="product-header__profile-image"
          />
          <image-uploader
            class="image-uploader"
            :max-width="250"
            :max-height="250"
            :quality="0.6"
            :auto-rotate="true"
            output-format="blob"
            accept="image/*"
            do-not-resize="['gif', 'svg']"
            :preview="false"
            @input="setImage"
            @onUpload="uploadPhoto"
          ></image-uploader>
        </div>
      </div>
    </header>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { storage, usersCollection } from '../config/firebaseConfig';

export default {
  name: 'Profile',

  data: () => ({
    uploading: false,
  }),

  computed: {
    ...mapState(['user']),
  },

  methods: {
    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    async uploadPhoto() {
      this.uploading = true;
      const storageRef = storage.ref(`photos/${this.user.email}`);
      const userRef = usersCollection.doc(this.user.email);

      const snapshot = await storageRef.put(this.file);

      const photoURL = await snapshot.ref.getDownloadURL().then(url => url);
      await userRef.update({ photoURL });

      this.user.photoURL = photoURL;
      this.uploading = false;
    },

    updateName() {
      const displayName = this.$refs.name.innerHTML;
      const userRef = usersCollection.doc(this.user.email);
      userRef.update({ displayName });
    },
  },
};
</script>

<style lang="scss" scoped>
.uploading {
  opacity: 0.2;
}

.image-uploader {
  transform: translate(-6px, 16.5rem);
}

.product-header__name {
  margin: -1rem -1rem 0;
  padding: 1rem 1rem 0;

  .title-1 {
    &::after {
      bottom: 0.4rem;
      display: inline-flex;
      align-content: center;
      align-items: center;
      margin-left: 1.5rem;
      padding: 0.4rem 0.75rem 0.25rem;
      font-weight: normal;
      font-size: 1rem;
      border: 1px solid white;
      transform: translateY(-0.25rem);
      opacity: 0.45;
      content: 'Endre';
    }
  }

  &:hover {
    background: rgba(white, 0.2);

    .title-1::after {
      opacity: 0;
    }
  }
}

.display-name {
}
</style>

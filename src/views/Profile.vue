<template>
  <div v-if="user" class="container content">
    <h1 class="title title-1 display-name" ref="name" contenteditable @blur="updateName">{{ user.displayName }}</h1>

    <img :src="user.photoURL" :alt="`Profilbilde for ${user.displayName}`" :class="{ uploading }" />

    <image-uploader
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

.display-name {
  margin: 1rem -1rem;
  padding: 1rem;

  &:hover {
    background: #eeeeee;
  }
}
</style>

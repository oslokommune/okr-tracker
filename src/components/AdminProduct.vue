<template>
  <div v-if="product">
    <!-- <pre>{{ product }}</pre> -->
    <p>Navn</p>
    <input type="text" v-model="product.name" />

    <img v-if="product.photoURL" :src="product.photoURL" />

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

    <p>Mission statement</p>
    <textarea rows="4" v-model="product.mission_statement"></textarea>

    <p>Team</p>
    <input type="text" />

    <button @click="saveObject">Lagre</button>
    <button @click="deleteObject">Slett</button>
  </div>
</template>

<script>
import { storage } from '../config/firebaseConfig';

export default {
  data: () => ({
    product: null,
  }),

  props: {
    docref: { type: Object, required: true },
  },

  async mounted() {
    this.product = await this.docref.get().then(d => d.data());
  },

  watch: {
    async docref() {
      this.product = await this.docref.get().then(d => d.data());
    },
  },

  methods: {
    saveObject() {
      this.docref.update(this.product);
    },
    deleteObject() {
      this.docref.delete();
      this.product = null;
    },

    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    async uploadPhoto() {
      this.uploading = true;
      const storageRef = storage.ref(`products/${this.docref.id}`);

      const snapshot = await storageRef.put(this.file);
      const photoURL = await snapshot.ref.getDownloadURL();
      await this.docref.update({ photoURL });

      this.product.photoURL = photoURL;
      this.uploading = false;
    },
  },
};
</script>

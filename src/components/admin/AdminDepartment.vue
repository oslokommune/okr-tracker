<template>
  <div v-if="obj">
    <p>Navn</p>
    <input type="text" v-model="obj.name" />

    <img v-if="obj.photoURL" :src="obj.photoURL" />

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
    <textarea rows="4" v-model="obj.mission_statement"></textarea>

    <button @click="saveObject">Lagre</button>
    <button @click="deleteObject">Slett</button>
  </div>
</template>

<script>
import { storage } from '@/config/firebaseConfig';

export default {
  data: () => ({
    obj: null,
    file: null,
  }),
  props: {
    docref: { type: Object, required: true },
  },
  async mounted() {
    this.obj = await this.docref.get().then(d => d.data());
  },

  watch: {
    async docref(newDocref) {
      this.obj = null;
      this.obj = await newDocref.get().then(d => d.data());
    },
  },

  methods: {
    saveObject() {
      this.docref.update(this.obj);
    },
    deleteObject() {
      this.docref.update({ archived: true }).then(() => {
        this.obj = null;
      });
    },

    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    async uploadPhoto() {
      this.uploading = true;
      const storageRef = storage.ref(`departments/${this.docref.id}`);

      const snapshot = await storageRef.put(this.file);
      const photoURL = await snapshot.ref.getDownloadURL();
      await this.docref.update({ photoURL });

      this.obj.photoURL = photoURL;
      this.uploading = false;
    },
  },
};
</script>

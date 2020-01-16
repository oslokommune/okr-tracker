<template>
  <div v-if="department">
    <h2 class="title title-2">Administrer produktområde</h2>

    <div class="section">
      <label class="form-field">
        <span class="form-label">Navn</span>
        <input type="text" v-model="department.name" @input="updateSlug" />
      </label>

      <label>
        <span class="form-group">Slug</span>
        <input type="text" v-model="department.slug" disabled />
      </label>

      <label class="form-field">
        <span class="form-label">Bilde</span>
        <img v-if="department.photoURL" :src="department.photoURL" />

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
      </label>

      <label class="form-field">
        <span class="form-label">Mission statement</span>
        <textarea rows="4" v-model="department.mission_statement"></textarea>
      </label>
    </div>

    <button class="btn" @click="saveObject">Lagre</button>
    <button class="btn btn--borderless" @click="deleteObject">Slett</button>
  </div>
</template>

<script>
import { storage } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';
import slugify from '@/util/slugify';

export default {
  data: () => ({
    department: null,
    file: null,
  }),
  props: {
    docref: { type: Object, required: true },
  },
  async mounted() {
    this.department = await this.docref.get().then(d => d.data());
  },

  watch: {
    async docref(newDocref) {
      this.department = null;
      this.department = await newDocref.get().then(d => d.data());
    },
  },

  methods: {
    saveObject() {
      this.docref
        .update(this.department)
        .then(Toast.savedChanges)
        .catch(Toast.error);
    },
    deleteObject() {
      this.docref
        .update({ archived: true })
        .then(() => {
          this.department = null;
        })
        .then(Toast.deleted)
        .catch(Toast.error);
    },

    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    async uploadPhoto() {
      if (!this.file) return;
      this.uploading = true;
      const storageRef = storage.ref(`departments/${this.docref.id}`);

      const snapshot = await storageRef.put(this.file).catch(Toast.error);
      Toast.uploadedPhoto();

      const photoURL = await snapshot.ref.getDownloadURL();
      await this.docref.update({ photoURL }).catch(Toast.error);
      Toast.savedChanges();

      this.department.photoURL = photoURL;
      this.uploading = false;
    },

    updateSlug() {
      this.department.slug = slugify(this.department.name);
    },
  },
};
</script>

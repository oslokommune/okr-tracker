<template>
  <div v-if="department">
    <h2 class="title title-2">Administrer produktområde</h2>

    <div class="section">
      <div class="form-group">
        <label class="form-field">
          <span class="form-label">Navn</span>
          <input type="text" v-model="department.name" @input="updateSlug" maxlength="64" />
        </label>

        <label>
          <span class="form-label">Slug</span>
          <input type="text" v-model="department.slug" disabled />
        </label>

        <label class="form-field">
          <span class="form-label">Bilde</span>
          <img v-if="department.photoURL" :src="department.photoURL" />

          <image-uploader
            :max-width="450"
            :max-height="450"
            :quality="0.9"
            :auto-rotate="true"
            output-format="blob"
            accept="image/*"
            do-not-resize="['gif', 'svg']"
            :preview="false"
            @input="setImage"
          ></image-uploader>
        </label>

        <label class="form-field">
          <span class="form-label">Mission statement</span>
          <textarea rows="4" v-model="department.missionStatement" @input="dirty = true" maxlength="320"></textarea>
        </label>
      </div>
    </div>

    <button class="btn" :disabled="!dirty" @click="saveObject">Lagre</button>
    <button class="btn btn--borderless" @click="deleteObject">Slett</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { storage } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import slugify from '@/util/slugify';

export default {
  name: 'AdminDepartment',

  data: () => ({
    department: null,
    file: null,
    dirty: false,
  }),
  props: {
    docref: { type: Object, required: true },
  },
  async created() {
    this.department = await this.docref
      .get()
      .then(d => d.data())
      .catch(err => {
        this.$errorHandler('get_department_error', err);
      });
  },

  computed: {
    ...mapState(['user']),
  },

  watch: {
    async docref(newDocref) {
      this.department = null;
      this.department = await newDocref
        .get()
        .then(d => d.data())
        .catch(err => {
          this.$errorHandler('get_department_error', err);
        });
    },
  },

  methods: {
    saveObject() {
      this.docref
        .update({ edited: new Date(), editedBy: this.user.ref, ...this.department })
        .then(() => {
          this.dirty = false;
          Audit.updateDepartment(this.docref);
          Toast.savedChanges();
        })
        .catch(err => {
          this.$errorHandler('update_department_error', err);
        });
    },
    deleteObject() {
      this.docref
        .update({ edited: new Date(), editedBy: this.user.ref, archived: true })
        .then(() => {
          this.department = null;
        })
        .then(Toast.deleted)
        .catch(err => {
          this.$errorHandler('archive_department_error', err);
        });
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

      const snapshot = await storageRef.put(this.file).catch(err => {
        this.$errorHandler('upload_photo_department_error', err);
      });
      Toast.uploadedPhoto();

      const photoURL = await snapshot.ref.getDownloadURL();
      await this.docref.update({ photoURL }).catch(err => {
        this.$errorHandler('upload_photo_department_error', err);
      });
      Toast.savedChanges();

      this.department.photoURL = photoURL;
      this.uploading = false;
    },

    updateSlug() {
      this.dirty = true;
      this.department.slug = slugify(this.department.name);
    },
  },
};
</script>

<template>
  <div v-if="organization">
    <h2 class="title title-2">Administrer organisasjon</h2>

    <div class="section">
      <div class="form-group">
        <label class="form-field">
          <span class="form-label">Navn</span>
          <input type="text" v-model="organization.name" @input="updateSlug" />
        </label>

        <label>
          <span class="form-label">Slug</span>
          <input type="text" v-model="organization.slug" disabled />
        </label>

        <label class="form-field">
          <span class="form-label">Bilde</span>
          <img v-if="organization.photoURL" :src="organization.photoURL" />

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
          <textarea rows="4" v-model="organization.missionStatement" @input="dirty = true"></textarea>
        </label>
      </div>
    </div>
    <button class="btn" :disabled="!dirty" @click="saveObject">Lagre</button>
    <!-- <button class="btn btn--borderless" @click="deleteObject">Slett</button> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { storage } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import slugify from '@/util/slugify';

export default {
  name: 'AdminOrganization',

  data: () => ({
    organization: null,
    file: null,
    dirty: false,
  }),
  props: {
    docref: { type: Object, required: true },
  },

  async created() {
    this.organization = await this.docref
      .get()
      .then(d => d.data())
      .catch(err => {
        this.$errorHandler('get_organization_error', err);
      });
  },

  computed: {
    ...mapState(['user']),
  },

  watch: {
    async docref(newDocref) {
      this.organization = null;
      this.organization = await newDocref
        .get()
        .then(d => d.data())
        .catch(err => {
          this.$errorHandler('get_organization_error', err);
        });
    },
  },

  methods: {
    saveObject() {
      this.docref
        .update({ edited: new Date(), editedBy: this.user.ref, ...this.organization })
        .then(() => {
          this.dirty = false;
          Audit.updateOrganization(this.docref);
          Toast.savedChanges();
        })
        .catch(err => {
          this.$errorHandler('update_organization_error', err);
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
      const storageRef = storage.ref(`organizations/${this.docref.id}`);

      const snapshot = await storageRef.put(this.file).catch(err => {
        this.$errorHandler('upload_photo_organization_error', err);
      });
      Toast.uploadedPhoto();

      const photoURL = await snapshot.ref.getDownloadURL();
      await this.docref.update({ photoURL }).catch(err => {
        this.$errorHandler('upload_photo_organization_error', err);
      });
      Toast.savedChanges();

      this.organization.photoURL = photoURL;
      this.uploading = false;
    },

    updateSlug() {
      this.dirty = true;
      this.organization.slug = slugify(this.organization.name);
    },
  },
};
</script>

<template>
  <div v-if="product" class="section">
    <h2 class="title title-2">Administrer produkt</h2>

    <CalloutArchivedRestore v-if="product.archived" :docref="docref"></CalloutArchivedRestore>

    <div class="section form-group">
      <label class="form-field">
        <span class="form-label">Produktnavn</span>
        <input ref="nameref" type="text" v-model="product.name" @input="updateSlug" />
      </label>

      <label class="form-field">
        <span class="form-label">Slug</span>
        <input type="text" v-model="product.slug" disabled />
      </label>

      <label class="form-field">
        <span class="form-label">Bilde</span>
        <img v-if="product.photoURL" :src="product.photoURL" />

        <image-uploader
          :max-width="250"
          :max-height="250"
          :quality="0.6"
          :auto-rotate="true"
          output-format="blob"
          accept="image/*"
          do-not-resize="['gif']"
          :preview="false"
          @input="setImage"
          @onUpload="uploadPhoto"
        ></image-uploader>
      </label>

      <div class="form-field">
        <label>
          <span class="form-label">Mission statement</span>
          <textarea rows="4" v-model="product.mission_statement"></textarea>
        </label>
      </div>

      <div class="form-field">
        <span class="form-label">Team</span>
        <v-select class="objective__select" label="displayName" multiple v-model="product.team" :options="users">
          <template v-slot:option="option">
            {{ option.displayName || option.id }}
            <span v-if="option.displayName !== option.id">({{ option.id }})</span>
          </template>
        </v-select>
      </div>
    </div>
    <div class="section">
      <button class="btn" @click="saveObject">Lagre</button>
      <button v-if="isAdmin()" class="btn btn--borderless" @click="deleteObject">Slett</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { storage } from '../../../config/firebaseConfig';
import slugify from '../../../util/slugify';
import * as Toast from '../../../util/toasts';
import CalloutArchivedRestore from '../../../components/Callouts/CalloutArchivedRestore.vue';

export default {
  name: 'AdminProduct',

  data: () => ({
    product: null,
  }),

  computed: {
    ...mapState(['users', 'user']),
  },

  components: {
    CalloutArchivedRestore,
  },

  props: {
    docref: { type: Object, required: true },
  },

  watch: {
    async docref(ref) {
      this.product = null;
      ref
        .get()
        .then(getProductfromRef.bind(this))
        .catch(this.$errorHandler);
    },
  },

  async mounted() {
    this.docref.onSnapshot(getProductfromRef.bind(this));
  },

  methods: {
    async saveObject() {
      const teamList = this.product.team;
      this.product.team = teamList.map(d => d.ref);
      this.docref
        .update({ edited: new Date(), edited_by: this.user.ref, ...this.product })
        .then(Toast.savedChanges)
        .catch(this.$errorHandler);
      this.product.team = teamList;
    },

    isAdmin() {
      return this.user && this.user.admin;
    },

    async deleteObject() {
      await this.docref
        .update({ edited: new Date(), edited_by: this.user.ref, archived: true })
        .then(Toast.deletedRegret)
        .catch(this.$errorHandler);

      this.product = null;
    },

    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    updateSlug() {
      this.product.slug = slugify(this.product.name);
    },

    async uploadPhoto() {
      if (!this.file) return;

      this.uploading = true;
      const storageRef = await storage.ref(`products/${this.docref.id}`);

      const snapshot = await storageRef.put(this.file).catch(this.$errorHandler);

      Toast.uploadedPhoto();

      const photoURL = await snapshot.ref.getDownloadURL();
      await this.docref.update({ photoURL }).catch(this.$errorHandler);

      Toast.savedChanges();

      this.product.photoURL = photoURL;
      this.uploading = false;
    },
  },
};

async function getProductfromRef(snapshot) {
  this.product = snapshot.data();

  const team = this.product.team || [];
  const promises = team.map(d => d.get());
  const userRefs = await Promise.all(promises).catch(this.$errorHandler);

  this.product.team = userRefs
    .map(user => ({ id: user.id, ref: user.ref, ...user.data() }))
    .map(user => {
      user.displayName = user.displayName || user.id;
      return user;
    });
}
</script>

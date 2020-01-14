<template>
  <div v-if="product">
    <h2 class="title title-2">Administrer produkt</h2>

    <div class="section">
      <label class="form-group">
        <span class="form-label">Produktnavn</span>
        <input ref="nameref" type="text" v-model="product.name" @input="updateSlug" />
      </label>

      <label class="form-group">
        <span class="form-label">Slug</span>
        <input type="text" v-model="product.slug" disabled />
      </label>

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

      <div class="form-group">
        <label>
          <span class="form-label">Mission statement</span>
          <textarea rows="4" v-model="product.mission_statement"></textarea>
        </label>
      </div>

      <div class="form-group">
        <span class="form-label">Team</span>
        <v-select
          class="form-group objective__select"
          label="displayName"
          multiple
          v-model="product.team"
          :options="users"
        >
          <template v-slot:option="option">
            {{ option.displayName || option.id }}
            <span v-if="option.displayName !== option.id">({{ option.id }})</span>
          </template>
        </v-select>
      </div>
    </div>
    <button @click="saveObject">Lagre</button>
    <button @click="deleteObject">Slett</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { storage } from '@/config/firebaseConfig';
import slugify from '@/util/slugify';

export default {
  data: () => ({
    product: null,
  }),

  computed: {
    ...mapState(['users']),
  },

  props: {
    docref: { type: Object, required: true },
  },

  watch: {
    async docref(ref) {
      this.product = null;
      ref.get().then(getProductfromRef.bind(this));
    },
  },

  async mounted() {
    this.docref.onSnapshot(getProductfromRef.bind(this));
  },

  methods: {
    async saveObject() {
      const teamList = this.product.team;
      this.product.team = teamList.map(d => d.ref);
      await this.docref.update(this.product);
      this.product.team = teamList;
    },
    deleteObject() {
      this.docref.update({ archived: true });
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

async function getProductfromRef(snapshot) {
  this.product = snapshot.data();

  const team = this.product.team || [];
  const promises = team.map(d => d.get());
  const userRefs = await Promise.all(promises);

  this.product.team = userRefs
    .map(user => ({ id: user.id, ref: user.ref, ...user.data() }))
    .map(user => {
      user.displayName = user.displayName || user.id;
      return user;
    });
}
</script>

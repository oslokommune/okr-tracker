<template>
  <div v-if="product">
    <!-- <pre>{{ product }}</pre> -->
    <p>Navn</p>
    <input ref="nameref" type="text" v-model="product.name" @input="updateSlug" />

    <p>Slug</p>
    <input type="text" v-model="product.slug" disabled />

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
          {{ option.displayName || option.email }}
          <span v-if="option.displayName !== option.email">({{ option.email }})</span>
        </template>
      </v-select>
    </div>

    <button @click="saveObject">Lagre</button>
    <button @click="deleteObject">Slett</button>
  </div>
</template>

<script>
import { storage, usersCollection } from '../config/firebaseConfig';
import slugify from '../util/slugify';

export default {
  data: () => ({
    product: null,
    users: [],
  }),

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

    usersCollection.onSnapshot(snapshot => {
      this.users = snapshot.docs
        .map(user => ({ email: user.id, ref: user.ref, ...user.data() }))
        .map(user => {
          user.displayName = user.displayName || user.email;
          return user;
        });
    });
  },

  methods: {
    async saveObject() {
      const teamList = this.product.team;
      this.product.team = teamList.map(d => d.ref);
      await this.docref.update(this.product);
      this.product.team = teamList;
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
    .map(user => ({ email: user.id, ref: user.ref, ...user.data() }))
    .map(user => {
      user.displayName = user.displayName || user.email;
      return user;
    });
}
</script>

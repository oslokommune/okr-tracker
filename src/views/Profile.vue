<template>
  <div v-if="user">
    <header class="page-header">
      <div class="container">
        <div class="page-header__container">
          <div class="page-header__name" contenteditable @blur="updateName">
            <h1 class="title-1" ref="name">{{ user.displayName }}</h1>
          </div>

          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            :alt="`Profilbilde for ${user.name}`"
            class="page-header__profile-image"
          />
        </div>
      </div>
    </header>

    <div class="container container--sidebar">
      <section class="section page-menu content--sidebar">
        <label class="form-field">
          <span class="form-label">Endre bilde</span>
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
        </label>
      </section>

      <main class="content--main">
        <section v-if="user.admin" class="section">
          <h2 class="title title-2">Admin</h2>
          <p>Har administratortilgang</p>
        </section>
        <section class="section">
          <h2 class="title title-2">Mine produkter</h2>
          <ul>
            <li v-for="product in products" :key="product.id">
              <router-link :to="{ name: 'product', params: { slug: product.slug } }">{{ product.name }}</router-link>
            </li>
          </ul>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { storage } from '@/config/firebaseConfig';
import { myProductsListener, isDashboardUser } from '@/util/db';

export default {
  name: 'Profile',

  data: () => ({
    uploading: false,
    products: [],
  }),

  beforeRouteEnter(to, from, next) {
    if (isDashboardUser()) {
      next(false);
    } else {
      next();
    }
  },

  computed: {
    ...mapState(['user', 'nest']),
  },

  mounted() {
    myProductsListener().then(list => {
      this.products = list;
    });
  },

  methods: {
    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    async uploadPhoto() {
      this.uploading = true;
      const storageRef = storage.ref(`photos/${this.user.id}`);

      const snapshot = await storageRef.put(this.file);
      const photoURL = await snapshot.ref.getDownloadURL().then(url => url);
      await this.user.ref.update({ photoURL });

      this.user.photoURL = photoURL;
      this.uploading = false;
    },

    updateName() {
      const displayName = this.$refs.name.innerHTML;
      this.user.ref.update({ displayName });
    },
  },
};
</script>

<style lang="scss" scoped>
.uploading {
  opacity: 0.2;
}

.page-header__name {
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
</style>

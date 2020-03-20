<template>
  <div v-if="getUser">
    <PageHeader :data="getUser"></PageHeader>
    <div class="container container--sidebar">
      <section class="section page-menu content--sidebar">
        <label v-if="$route.name === 'me'" class="form-field">
          <span class="form-label">{{ $t('profile.changePicture') }}</span>
          <image-uploader
            class="image-uploader"
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
      </section>
      <main class="content--main">
        <section v-if="$route.name === 'me'" class="section">
          <h2 class="title title-2">{{ $t('profile.name') }}</h2>
          <form @submit.prevent="submitDisplayName()">
            <label class="form-field form-field--small">
              <div class="form-login">
                <input class="field" v-model="displayName" maxlength="32" />
                <button class="btn">
                  {{ $t('btn.save') }}
                </button>
              </div>
            </label>
          </form>
        </section>
        <section v-if="getUser.admin" class="section">
          <h2 class="title title-2">{{ $t('general.admin') }}</h2>
          <p>{{ $t('profile.hasAdmin') }}</p>
        </section>
        <section class="section">
          <h2 class="title title-2">{{ $t('profile.products') }}</h2>
          <ul class="grid-system">
            <li v-for="product in products" :key="product.id">
              <router-link :to="{ name: 'product', params: { slug: product.slug } }">
                <div clasS="product">
                  <img class="product__image" :src="product.photoURL || '/placeholder-user.svg'" :alt="product.name" />
                  <div class="product__title">
                    <h1>{{ getDepartment(product) }}</h1>
                    <h1 class="product__h2">{{ product.name }}</h1>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>
        </section>
        <section class="section">
          <h2 class="title title-2">{{ $t('profile.audit') }}</h2>
          <div class="flex-system">
            <div v-if="!feed.length">
              {{ $t('profile.noActivity') }}
            </div>
            <div v-for="event in feed" :key="event.id">
              <NewsfeedCard class="flex-system__card" :event-data="event" />
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { isDashboardUser, findUser, userProductsListener, getAllDepartments, getAuditFromUser } from '@/db/db';
import PageHeader from '@/components/PageHeader.vue';
import NewsfeedCard from '@/views/Home/components/NewsfeedCard.vue';
import * as Toast from '@/util/toasts';
import { storage } from '@/config/firebaseConfig';
import i18n from '@/locale/i18n';

export default {
  name: 'User',

  data: () => ({
    products: [],
    dataUser: null,
    unsubscribe: null,
    departments: [],
    feed: [],
    displayName: '',
    uploading: false,
    file: null,
  }),

  components: {
    PageHeader,
    NewsfeedCard,
  },

  metaInfo() {
    return {
      title: `${this.displayName} |  ${i18n.t('general.project')}`,
    };
  },

  computed: {
    ...mapState(['user']),
    getUser() {
      if (this.$route.name === 'profile') return this.dataUser;
      if (this.$route.name === 'me') return this.user;
      return null;
    },

    dName() {
      return this.getUser.name || this.getUser.displayName || this.getUser.id;
    },
  },

  methods: {
    getDepartment(product) {
      let foundDep = '';
      this.departments.forEach(dep => {
        if (dep.id === product.ref.parent.parent.id) {
          foundDep = dep.name;
        }
      });
      return foundDep;
    },

    async getData() {
      if (this.$route.name === 'profile') {
        await findUser(this.$route.params.slug).then(list => {
          this.dataUser = list;
        });
      }

      this.displayName = this.dName;

      userProductsListener(this.getUser).then(list => {
        this.products = list;
      });

      await getAllDepartments().then(list => {
        this.departments = list;
      });

      this.feed = await getAuditFromUser(this.getUser.id);
    },

    submitDisplayName() {
      this.getUser.ref
        .update({
          displayName: this.displayName,
        })
        .then(Toast.savedChanges);
    },

    setImage(file) {
      this.hasImage = true;
      this.file = file;
      this.uploadPhoto();
    },

    async uploadPhoto() {
      if (!this.file) return;
      this.uploading = true;

      const storageRef = storage.ref(`photos/${this.user.id}`);

      const snapshot = await storageRef.put(this.file).catch(() => {
        this.$errorHandler('upload_photo_profile_error');
      });
      const photoURL = await snapshot.ref
        .getDownloadURL()
        .then(url => url)
        .catch(() => {
          this.$errorHandler('upload_photo_profile_error');
        });

      await this.user.ref.update({ photoURL }).catch(() => {
        this.$errorHandler('upload_photo_profile_error');
      });

      this.user.photoURL = photoURL;
      this.uploading = false;

      Toast.uploadedPhoto();
      return photoURL;
    },
  },

  beforeRouteEnter(to, from, next) {
    if (isDashboardUser()) {
      next(false);
    } else {
      next();
    }
  },

  watch: {
    user() {
      this.getData();
    },
    $route(to) {
      if (to.name === 'profile') this.getData();
      if (to.name === 'me') this.getData();
    },
  },

  async mounted() {
    if (!this.user) return;
    this.getData();
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.product {
  display: flex;
  flex-direction: row;
  color: $color-purple;

  &__image {
    width: 4rem;
    height: 4rem;
    border: 0.4rem solid white;
    border-radius: 0.8rem;

    -moz-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
    -webkit-box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
    box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.99);
  }

  &__title {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 1rem;
  }

  &__h2 {
    margin: 0.25rem 0 0;
    font-weight: 500;
    font-size: 1.35rem;
    line-height: 1.15;
  }
}

.flex-system {
  display: flex;
  flex-direction: column;
  grid-gap: 1rem;
  max-width: 500px;
  margin: 2rem 0;

  &__card {
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 0.2rem 0.3rem rgba(0, 0, 0, 0.2);
  }
}

.grid-system {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin: 2rem 0;

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}

.form-login {
  display: flex;
  max-width: 400px;
}
</style>

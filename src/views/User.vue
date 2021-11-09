<template>
  <div v-if="thisUser" class="container">
    <div class="main">
      <h1 class="title-1">{{ thisUser.displayName || thisUser.id }}</h1>

      <div class="user">
        <div class="user__image">
          <img
            class="user__image-size"
            :src="thisUser.photoURL || '/placeholder-user.svg'"
            :alt="thisUser.displayName || user.id"
          />

          <template v-if="me">
            <input type="file" accept="image/png, image/jpeg" @input="setImage" />
            <div class="user__image-buttons">
              <button class="btn btn--pri" :disabled="!image || loading" @click="uploadImage">
                {{ $t('btn.upload') }}
              </button>
              <button class="btn" :disabled="!thisUser.photoURL" @click="deleteImage">
                {{ $t('btn.deleteImage') }}
              </button>
            </div>
          </template>
        </div>

        <div class="user__info">
          <validation-observer v-if="me" v-slot="{ handleSubmit }">
            <form id="updateUser" @submit.prevent="handleSubmit(save)">
              <form-component
                v-model="thisUser.displayName"
                input-type="input"
                name="name"
                :label="$t('fields.name')"
                rules="required"
                type="text"
                @edited-data="edit"
              />
            </form>
          </validation-observer>

          <label v-if="thisUser.uid" class="form-group">
            <span class="form-label">{{ $t('fields.uid') }}</span>
            <input v-model="thisUser.uid" class="form__field" type="email" disabled />
          </label>

          <label v-if="me" class="form-group">
            <span class="form-label">{{ $t('user.position.title') }}</span>
            <v-select
              v-model="thisUser.position"
              :options="jobPositions"
              :get-option-label="(option) => $t(`user.position.${option}`)"
              @input="edit"
            >
            </v-select>
          </label>

          <label v-if="me" class="form-group">
            <span class="form-label">{{ $t('user.selectLanguage') }}</span>
            <v-select
              v-model="thisUser.preferences.lang"
              :options="languages"
              :get-option-label="(option) => $t(`languages.${option}`)"
              @input="edit"
            >
            </v-select>
          </label>

          <div v-if="me" class="user__info-btn">
            <button class="btn btn--sec" form="updateUser" :disabled="loading || !changes">{{ $t('btn.save') }}</button>
          </div>

          <hr class="divider" />

          <template v-if="user.superAdmin">
            <h2 class="title-2">
              <i class="fas fa-user-shield" />
              {{ $t('user.superAdmin') }}
            </h2>
            <div>
              {{ $t('user.hasSuperAdmin') }}
            </div>
          </template>

          <template v-if="user.admin && user.admin.length > 0">
            <h2 class="title-2">
              <i class="fas fa-user-shield" />
              {{ $t('user.admin') }}
            </h2>
            <div>
              {{ $t('user.hasAdmin') }}
            </div>
          </template>

          <div class="product__header">
            <h2 class="title-2">{{ $t('user.products') }}</h2>
            <ul class="grid-system">
              <li v-for="product in products" :key="product.id">
                <router-link class="product" :to="{ name: 'ItemHome', params: { slug: product.slug } }">
                  <div class="product__parent">{{ product.department.name }}</div>
                  <div class="product__name">
                    <i class="product__icon fa fa-cube" />
                    {{ product.name }}
                  </div>
                </router-link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import User from '@/db/User';
import { jobPositions } from '@/config/jobPositions';

export default {
  name: 'User',

  data: () => ({
    user: null,
    products: [],
    audit: [],
    image: null,
    loading: false,
    changes: false,
    thisUser: null,
    languages: ['nb-NO', 'en-US'],
    jobPositions,
  }),

  computed: {
    me() {
      return this.$store.state.user.id === this.user.id;
    },
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        const userRef = db.doc(`users/${id}`);
        const productsRef = db
          .collection('products')
          .where('team', 'array-contains', userRef)
          .where('archived', '==', false);
        const auditRef = db.collection('audit').where('user', '==', userRef).orderBy('timestamp', 'desc').limit(10);

        this.$bind('user', userRef);
        this.$bind('products', productsRef, { maxRefDepth: 1 });
        this.$bind('audit', auditRef, { maxRefDepth: 1 });
      },
    },
    user: {
      immediate: true,
      handler() {
        if (this.user) {
          this.thisUser = { ...this.user, id: this.user.id };
        }
      },
    },
  },

  created() {
    const { id } = this.$route.params;

    if (!id) {
      this.$router.push({ name: 'User', params: { id: this.$store.state.user.id } });
    }
  },

  methods: {
    edit() {
      this.changes = true;
    },
    setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
    },

    async uploadImage() {
      this.loading = true;
      try {
        const url = await User.uploadImage(this.thisUser.id, this.image);
        this.image = null;
        this.thisUser.photoURL = url;
        await this.save();
      } catch (error) {
        console.error(error);
      }
      this.loading = false;
      this.changes = false;
    },

    async save() {
      this.loading = true;
      try {
        await User.update(this.thisUser);
        await this.$router.go();
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        console.error(error);
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
      this.changes = false;
    },

    async deleteImage() {
      this.loading = true;
      try {
        this.thisUser.photoURL = null;
        this.image = null;
        await this.save(this.thisUser);
        await User.deleteImage(this.user.id);
      } catch (error) {
        console.log('Error ', error);
        throw new Error(error.message);
      }

      this.loading = false;
      this.changes = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.main {
  width: span(12);
  padding: 1.5rem 0;

  @media screen and (min-width: bp(m)) {
    width: span(9);
    margin-left: span(2, 1);
  }
}

.user {
  display: flex;
  flex-direction: column;
  width: 100%;

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
  }
}

.user__image {
  align-self: flex-start;
  width: span(12);
  margin-bottom: 0.5rem;

  padding: 1rem;
  background: white;
  box-shadow: 0 2px 3px rgba(black, 0.1);

  @media screen and (min-width: bp(m)) {
    width: span(3, 0, span(8));
  }

  @media screen and (min-width: bp(l)) {
    width: span(3, 0, span(6));
  }

  &-size {
    width: 100%;
  }
}

.user__info-btn {
  margin-top: 1rem;
}

.user__info {
  width: span(12);

  margin-left: span(0, 1);
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 3px rgba(black, 0.1);

  @media screen and (min-width: bp(m)) {
    width: span(6, 0, span(8));
    margin-left: span(0, 1, span(8));
  }

  @media screen and (min-width: bp(l)) {
    width: span(4, 0, span(6));
    margin-left: span(0, 1, span(6));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(4, 0, span(6));
    margin-left: span(0, 1, span(6));
  }
}

.product {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  color: var(--color-text);
  text-decoration: none;
  border: 1px solid var(--color-grey-100);

  &:hover {
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.product__icon {
  margin-right: 0.5rem;
}

.product__parent {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 0.25rem;
  color: var(--color-grey-600);
  font-size: 0.85rem;
}

.product__name {
  font-weight: 500;
}

.grid-system {
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
  margin: 1rem 0 2rem;
}

.user__image-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
}

.product__header {
  margin-top: 1rem;
}
</style>

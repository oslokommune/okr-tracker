<template>
  <div class="user" v-if="user">
    <div class="main">
      <h1 class="title-1">{{ user.displayName || user.id }}</h1>

      <div class="main__user">
        <div class="main__user--image">
          <img
            class="main__user--image-size"
            :src="user.photoURL || '/placeholder-user.svg'"
            :alt="user.displayName || user.id"
          />

          <template v-if="me">
            <input type="file" @input="setImage" accept="image/png, image/jpeg" />
            <button class="btn btn--pri" @click="uploadImage">{{ $t('btn.upload') }}</button>
          </template>
        </div>

        <div class="main__user--info">
          <validation-observer v-if="me" v-slot="{ handleSubmit }">
            <form id="updateUser" @submit.prevent="handleSubmit(save)">
              <form-component
                input-type="input"
                name="name"
                :label="$t('fields.name')"
                rules="required"
                v-model="updatedUser.displayName"
                type="text"
              />
            </form>
          </validation-observer>

          <template v-if="user.admin">
            <h2 class="title-2">
              <i class="fas fa-user-shield"></i>
              Admin
            </h2>
            <div>
              {{ $t('profile.hasAdmin') }}
            </div>
          </template>

          <h2 class="title-2">{{ $t('profile.products') }}</h2>
          <ul class="grid-system">
            <li v-for="product in products" :key="product.id">
              <router-link :to="{ name: 'ItemHome', params: { slug: product.slug } }">
                <div class="product">
                  <div class="product__title">
                    <h1>{{ product.department.name }}</h1>
                    <h1 class="product__h2">{{ product.name }}</h1>
                  </div>
                </div>
              </router-link>
            </li>
          </ul>

          <div v-if="me" class="main__user--info-btn">
            <button class="btn btn--sec" form="updateUser" :disabled="loading">{{ $t('btn.save') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="side">
      <h2 class="title-2">Audit</h2>
      <table>
        <tr v-for="event in audit" :key="event.id">
          <td>{{ formatDate(event.timestamp) }}</td>
          <td>{{ event.event }}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import { format } from 'date-fns';
import User from '@/db/User';
import * as Toast from '@/util/toasts';

export default {
  name: 'User',
  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
  },

  data: () => ({
    user: null,
    products: [],
    audit: [],
    image: null,
    loading: false,
    updatedUser: null,
  }),

  computed: {
    me() {
      return this.$store.state.user.id === this.user.id;
    },
  },

  methods: {
    formatDate(date) {
      return format(date.toDate(), 'dd/MM/yyyy HH:mm');
    },
    setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
    },
    async uploadImage() {
      try {
        const url = await User.uploadImage(this.updatedUser.id, this.image);
        this.image = null;
        this.updatedUser.photoURL = url;
      } catch (error) {
        console.error(error);
      }
    },
    async save() {
      this.loading = true;
      try {
        await User.update(this.updatedUser);
        Toast.savedChanges();
      } catch (error) {
        console.error(error);
        Toast.error();
      }

      this.loading = false;
    },
  },

  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        const userRef = db.doc(`users/${id}`);
        const productsRef = db.collection('products').where('team', 'array-contains', userRef);
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
          this.updatedUser = { ...this.user, id: this.user.id };
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.user {
  display: flex;
  flex-wrap: wrap;
}

.main {
  width: span(12);
  padding-top: 1.5rem;

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.side {
  position: relative;
  width: span(12);
  margin-top: 0.5rem;

  @media screen and (min-width: bp(l)) {
    width: span(3, 0, span(10));
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}

.main__user {
  display: flex;
  width: 100%;
}

.main__user--image {
  align-self: flex-start;
  width: span(4);
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

.main__user--info-btn {
  margin-top: 1rem;
}

.main__user--info {
  width: span(8);

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
  flex-direction: row;
  color: $color-purple;

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

.grid-system {
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  margin: 2rem 0;
  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}
</style>

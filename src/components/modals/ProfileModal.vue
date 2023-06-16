<template>
  <modal-wrapper v-if="user" variant="wide" @close="$emit('close')">
    <template #header>
      {{ $t('user.profile') }}
    </template>

    <div class="modal__main--flex">
      <div class="column">
        <user-profile-form
          v-if="me || $store.state.user.superAdmin"
          :user="user"
          :loading="loading"
          @save="save"
        />

        <template v-else>
          <div class="form-group">
            <span class="form-label">{{ $t('fields.name') }}</span>
            <span class="form-value">{{ user.displayName }}</span>
          </div>
          <div class="form-group">
            <span class="form-label">{{ $t('user.position.title') }}</span>
            <span class="form-value">
              {{
                user.position
                  ? $t(`user.position.${user.position}`)
                  : $t('user.position.member')
              }}
            </span>
          </div>
        </template>
      </div>

      <div class="column">
        <h2 class="title-2">
          {{ $t('user.products') }}
        </h2>
        <ul v-if="products.length > 0">
          <li v-for="product in products" :key="product.id">
            <div class="profileModal__info">
              <h2 class="title-2">{{ product.department.name }}</h2>
              <div>{{ product.name }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </modal-wrapper>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import User from '@/db/User';
import UserProfileForm from '@/components/forms/UserProfileForm.vue';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProfileModal',

  components: {
    ModalWrapper,
    UserProfileForm,
  },

  props: {
    myProfile: {
      type: Boolean,
      required: false,
      default: false,
    },

    id: {
      type: String,
      required: true,
    },
  },

  data: () => ({
    user: null,
    products: [],
    audit: [],
    image: null,
    loading: false,
  }),

  computed: {
    me() {
      return this.$store.state.user?.id === this.user?.id;
    },
  },

  watch: {
    id: {
      immediate: true,
      async handler(id) {
        const userRef = await db.doc(`users/${id}`);
        const productsRef = await db
          .collection('products')
          .where('team', 'array-contains', userRef)
          .where('archived', '==', false);
        const auditRef = await db
          .collection('audit')
          .where('user', '==', userRef)
          .orderBy('timestamp', 'desc')
          .limit(10);

        this.$bind('user', userRef);
        this.$bind('products', productsRef, { maxRefDepth: 1 });
        this.$bind('audit', auditRef, { maxRefDepth: 1 });
      },
    },
  },

  methods: {
    async save(user) {
      this.loading = true;
      try {
        await User.update(user);
        await this.$router.go();
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        console.error(error);
        this.$toasted.error(this.$t('toaster.error.save'));
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.profileModal__info {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
}

.modal__main--flex {
  display: flex;
  flex-basis: 100%;
  flex-direction: column;

  @include bp('phablet-up') {
    flex-direction: row;
  }
}

.column {
  display: flex;
  flex: 1 1 50%;
  flex-direction: column;

  @include bp('phablet-up') {
    padding-left: 3rem;
  }

  &:first-of-type {
    padding-left: 0;
  }

  > .title-2 {
    margin-bottom: 1rem;
  }
}

.form-group {
  display: block;
  margin: 1rem 0;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
}

.form-value {
  font-weight: 500;
}
</style>

<template>
  <modal-wrapper v-if="user" @close="close">
    <form id="updateUser" class="modal__main--flex">
      <div class="column">
        <h2 class="title-2">
          {{ $t('user.profile') }}
        </h2>
        <validation-observer v-slot="{ handleSubmit }">
          <span class="form-label">{{ $t('fields.name') }}</span>
          <input
            v-model="thisUser.displayName"
            rules="required"
            :disabled="!me"
          />
        </validation-observer>
        <label class="form-group">
          <span class="form-label">{{ $t('user.position.title') }}</span>
          <v-select
            v-if="me || $store.state.user.superAdmin"
            v-model="thisUser.position"
            :options="jobPositions"
            :get-option-label="(option) => $t(`user.position.${option}`)"
          >
          </v-select>
          <div v-else>
            <span>
              {{
                thisUser && thisUser.position
                  ? thisUser.position
                  : $t('user.position.member')
              }}
            </span>
          </div>
        </label>

        <button
          v-if="me || $store.state.user.superAdmin"
          class="btn btn--pri profileModal__save-button"
          form="updateUser"
          :disabled="loading"
        >
          {{ $t('btn.save') }}
        </button>
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
    </form>
  </modal-wrapper>
</template>
<script>
import { mapActions } from 'vuex';
import { db, auth } from '@/config/firebaseConfig';
import User from '@/db/User';
import { jobPositions } from '@/config/jobPositions';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProfileModal',

  components: {
    ModalWrapper,
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
    changes: false,
    thisUser: null,
    languages: ['nb-NO', 'en-US'],
    jobPositions,
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
    user: {
      immediate: true,
      handler() {
        if (this.user) {
          this.thisUser = { ...this.user, id: this.user.id };
        }
      },
    },
  },

  methods: {
    ...mapActions(['reset_state']),

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

    async signOut() {
      await auth.signOut();
      await this.reset_state();
    },

    edit() {
      this.changes = true;
    },

    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="scss" scoped>
.profileModal__info {
  padding-top: 0.6rem;
  padding-bottom: 0.6rem;
}

.modal__main--flex {
  display: flex;
  flex-basis: 100%;
  flex-direction: column;

  @media screen and (min-width: bp(s)) {
    flex-direction: row;
  }
}

.column {
  display: flex;
  flex: 1 1 50%;
  flex-direction: column;

  @media screen and (min-width: bp(s)) {
    padding-left: 3rem;
  }

  &:first-of-type {
    margin-left: 1rem;
    padding-left: 0;
  }

  > .title-2 {
    margin-bottom: 1rem;
  }
}

.profileModal__save-button {
  align-self: end;
  margin-top: 1rem;
}
</style>

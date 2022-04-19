<template>
  <div v-if="user" class="modal__main--flex">
    <div class="column">
      <h2 class="widget__title title-2">{{ $t('user.profile') }}</h2>
      <validation-observer v-slot="{ handleSubmit }">
        <form id="updateUser" @submit.prevent="handleSubmit(save)">
          <span class="form-label">{{ $t('fields.name') }}</span>
          <input v-model="thisUser.displayName" rules="required" @input="edit" class="form__field" />
        </form>
      </validation-observer>
      <label class="form-group">
        <span class="form-label">{{ $t('user.position.title') }}</span>
        <v-select
          v-model="thisUser.position"
          :options="jobPositions"
          :get-option-label="(option) => $t(`user.position.${option}`)"
          class=""
          @input="edit"
        >
        </v-select>
      </label>
      <label class="form-group">
        <span class="form-label">{{ $t('user.language') }}</span>
        <v-select
          v-model="thisUser.preferences.lang"
          :options="languages"
          :get-option-label="(option) => $t(`languages.${option}`)"
          @input="edit"
        >
        </v-select>
      </label>
      <button
        class="btn btn--sec profileModal__save-button"
        form="updateUser"
        :disabled="loading || !changes"
      >
        {{ $t('btn.save') }}
      </button>

      <hr class="divider" />

      <h3 class="widget__title title-2">
        {{ me ? $t('user.myProducts') : $t('user.products') }}
      </h3>

      <ul v-if="products.length > 0">
        <li v-for="product in products" :key="product.id">
          <div class="profileModal__label">{{ product.department.name }}</div>
          <div class="product">{{ product.name }}</div>
        </li>
      </ul>

      <hr class="divider" />

      <h3 class="widget__title title-2">
        {{ $t('user.access') }}
      </h3>

      <template v-if="user.superAdmin">
        <h2 class="title-2">{{ $t('user.superAdmin') }}</h2>
        <div>{{ $t('user.hasSuperAdmin') }}</div>
      </template>

      <template v-if="user.admin && user.admin.length > 0">
        <h2 class="title-2">{{ $t('user.admin') }}</h2>
        <div>{{ $t('user.hasAdmin') }}</div>
      </template>

      <hr class="divider" />

      <theme-toggle />

      <hr class="divider" />

      <h3 class="widget__title title-2">
        {{ $t('general.administration') }}
      </h3>

      <div class="sidebar__group sidebar__bottom button-col">
        <router-link v-if="user.admin" :to="{ name: 'Admin' }" class="btn btn--ter button-link">
          <span>{{ $t('general.admin') }}</span>
        </router-link>
        <router-link :to="{ name: 'Help' }" class="btn btn--ter button-link">
          <span>{{ $t('general.help') }}</span>
        </router-link>
        <router-link :to="{ name: 'Api' }" class="btn btn--ter button-link">
          <span>{{ $t('general.api') }}</span>
        </router-link>
        <button class="btn btn--ter btn--icon btn--icon-pri button-link" @click="signOut">
          <span class="">{{ $t('general.signOut') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
  import { mapActions } from 'vuex';
  import { db, auth } from '@/config/firebaseConfig';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import User from '@/db/User';
  import { jobPositions } from '@/config/jobPositions';

  export default {
    name: 'UserProfileMenu',

    components: {
      ThemeToggle,
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
  @use '@/styles/typography';

  .profileModal__label {
    display: inline-block;
    margin: 0.8rem 0 0.5rem 0;
    color: var(--color-grey-300);
    font-weight: 500;
    font-size: typography.$font-size-2;
    letter-spacing: -0.03rem;
  }

  .profileModal__input {
    width: 100%;
    padding: 0.7rem;
    background: var(--color-grey-50);
    border-radius: 0;
  }

  .modal__main--flex {
    display: flex;
    flex-basis: 100%;
    flex-direction: column;
    width: 100%;
    /* max-width: 600px; */
    max-height: calc(100vh - 90px);
    padding: 0 0 0 3rem;
    overflow: auto;
    color: var(--color-text);
    background: white;
    border-radius: 1px;
    box-shadow: 0 0.25rem 0.45rem rgba(black, 0.5);

    @media screen and (min-width: bp(s)) {
      flex-direction: row;
    }

    scrollbar-width: none; /* Hide scrollbar styles Firefox */
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: flex;
    }
  }

  .column {
    display: flex;
    flex-direction: column;
    flex-grow: 2;
    padding: 0 1.5rem 0 0;
  }

  .profileModal__save-button {
    align-self: end;
    margin-top: 1rem;
  }

  .product {
    margin-bottom: 1rem;
    padding: 0.75rem 0.75rem 0.6rem 0.75rem;
    color: var(--color-text);
    font-weight: 500;
    border: 1px solid black;
    border-radius: 0px;
  }

  .divider {
    margin: 1.5rem 0;
    border: 0;
    border-top: 1px solid var(--color-grey-100);
  }

  .button-link {
    padding-left: 0;
    color: var(--color-text);
    background: transparent;
    border-style: none;

    &:hover {
      text-decoration: underline;
    }
  }

  .desktop-only {
    @media screen and (min-width: bp(m)) {
      display: none;
    }
  }
</style>

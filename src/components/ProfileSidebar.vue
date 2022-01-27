<template>
  <div :class="{ overlay: isOpen }" @click.self="close">
    <transition name="slide">
      <div v-if="isOpen" class="sidebar">
        <div class="sidebar__content">
            <span class="widget__title sidebar__h2">{{ $t('user.profile') }}</span>

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

          <h3 class="widget__title sidebar__h2">
            {{ $t('user.myProducts')}}
          </h3>

          <ul v-if="products.length > 0">
            <li v-for="product in products" :key="product.id">
              <div class="product">{{ product.department.name }}</div>
              <div class="product">{{ product.name }}</div>
            </li>
          </ul>

          <hr class="divider" />

          <h2 class="widget__title sidebar__h2">
            {{ $t('user.access') }}
          </h2>

          <template v-if="me && user.superAdmin">
            <h2 class="title-3">{{ $t('user.superAdmin') }}</h2>
            <div>{{ $t('user.hasSuperAdmin') }}</div>
          </template>

          <template v-if="me && user.admin && user.admin.length > 0">
            <h2 class="">{{ $t('user.admin') }}</h2>
            <div>{{ $t('user.hasAdmin') }}</div>
          </template>

          <template>
            <hr class="divider" />
            <theme-toggle />
            <hr class="divider" />

            <h2 class="widget__title">
              {{ $t('general.admin') }}
            </h2>

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
          </template>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
  import { mapActions } from 'vuex';
  import { db, auth } from '@/config/firebaseConfig';
  import ThemeToggle from '@/components/ThemeToggle.vue';
  import User from '@/db/User';
  import { jobPositions } from '@/config/jobPositions';

  export default {
    name: 'ProfileSidebar',

    components: {
      ThemeToggle,
    },

    props: {
      isOpen: {
        type: Boolean,
        required: true,
      },
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
  @use 'sass:math';

  $header-height: 4em;

  .margin-top-1 {
    margin-top: 1rem;
  }

  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 200;
    display: flex;
    flex-direction: row;
    width: calc(100vw - 4rem);
    max-width: 36rem;
    height: 100vh;
    color: var(--color-black);
  }

  .sidebar__content {
    $width: calc(100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: $width;
    padding: 5.5rem 2rem 2rem 2rem;
    overflow-y: auto;
    background-color: var(--color-white) !important;
    border-right: 1px solid #ffffff0f;
    box-shadow: 6px -1px 10px rgba(0, 0, 0, 0.1);

    scrollbar-width: none; /* Hide scrollbar styles Firefox */
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .sidebar__h2 {
    padding-bottom: 1rem;
  }

  .slide-enter-active,
  .slide-leave-active {
    transition: left 0.25s ease-in-out;
  }

  .slide-enter,
  .slide-leave-to {
    left: -504px;
  }

  .sidebar__item {
    width: 100%;
    padding: 0.5rem 1.5rem;
    color: var(--color-text-secondary);
    font-weight: 400;
    font-size: typography.$font-size-4;
    white-space: unset;
    border-radius: 0;

    &:hover {
      color: var(--color-text);
      background-color: var(--color-secondary);
    }

    &.active {
      color: var(--color-secondary);

      &:hover {
        color: var(--color-text);
      }
    }
  }

  .sidebar__item--side {
    color: var(--color-text-secondary);
  }

  .closeBtn {
    position: fixed;
    top: 1rem;
    right: 1.5rem;
    z-index: 1002;
    display: block;
    float: right;
    font-size: 1.5rem;
  }

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
</style>

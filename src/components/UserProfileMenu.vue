<template>
  <div v-if="user" class="user-menu-dropdown">
    <div class="user-menu-dropdown__header">
      <div class="user-profile">
        <h1 class="title-2">{{ user.displayName }}</h1>
        <ul class="user-profile__access">
          <template v-if="user.superAdmin">
            <li v-tooltip.bottom="$t('user.hasSuperAdmin')">
              {{ $t('user.superAdmin') }}
            </li>
          </template>
          <template v-if="user.admin && user.admin.length > 0">
            <li v-tooltip.bottom="$t('user.hasAdmin')">{{ $t('user.admin') }}</li>
          </template>
        </ul>
      </div>

      <pkt-button
        size="small"
        skin="tertiary"
        variant="icon-left"
        icon-name="exit"
        :text="$t('general.signOut')"
        @onClick="signOut"
      />
    </div>

    <div class="user-menu-dropdown__body">
      <div class="user-profile-form">
        <h2 class="title-2">{{ $t('user.profile') }}</h2>

        <user-profile-form :user="user" :loading="loading" @save="save" />
      </div>

      <div class="user-products">
        <h2 class="title-2">{{ $t('user.myProducts') }}</h2>

        <ul v-if="products.length > 0" class="user-products__list">
          <li v-for="product in products" :key="product.id">
            <h3 class="title-4">{{ product.department.name }}</h3>
            <span class="products-list__name">{{ product.name }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="user-menu-dropdown__footer">
      <template v-for="link in links">
        <pkt-button
          v-if="link.show !== undefined ? link.show : true"
          :key="`link_${link.key}`"
          size="small"
          skin="tertiary"
          variant="icon-left"
          :name="link.key"
          :icon-name="link.icon"
          :text="link.text"
          role="link"
          @onClick="navigate($event, link.route)"
        />
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { db, auth } from '@/config/firebaseConfig';
import User from '@/db/User';
import { PktButton } from '@oslokommune/punkt-vue2';
import UserProfileForm from '@/components/forms/UserProfileForm.vue';

export default {
  name: 'UserProfileMenu',

  components: {
    PktButton,
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
    handleNavigation: {
      type: Function,
      required: false,
      default: null,
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

    links() {
      return [
        {
          key: 'admin',
          text: this.$t('general.admin'),
          icon: 'cogwheel',
          route: { name: 'Admin' },
          show: !!this.user?.admin,
        },
        {
          key: 'api',
          text: this.$t('general.api'),
          icon: 'crane',
          route: { name: 'Api' },
        },
        {
          key: 'help',
          text: this.$t('general.help'),
          icon: 'question',
          route: { name: 'Help' },
        },
      ];
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
    ...mapActions(['reset_state']),

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

    async signOut(event) {
      if (this.handleNavigation) {
        this.handleNavigation(event);
      }
      await auth.signOut();
      await this.reset_state();
    },

    navigate(event, route) {
      this.$router.push(route).catch((error) => {
        if (error.name !== 'NavigationDuplicated') {
          throw error;
        }
      });
      if (this.handleNavigation) {
        this.handleNavigation(event);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

$-dropdown-max-height: calc(100vh - 3.5rem);

.user-menu-dropdown {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100vw;
  height: $-dropdown-max-height;

  @each $bp, $width in (s: 80, m: 60, l: 50, xl: 40, xxl: 30) {
    @media screen and (min-width: bp(#{$bp})) {
      width: #{$width}vw;
      height: auto;
      max-height: $-dropdown-max-height;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background-color: var(--color-yellow);

    .pkt-btn {
      &:hover {
        background-color: var(--color-yellow-50);
        border-color: var(--color-yellow-50);
      }
      &:focus {
        color: var(--color-grayscale-70);
        background-color: var(--color-yellow-50);
      }
    }
  }

  &__body {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 1rem;
    padding: 0 1.5rem;
    overflow-y: auto;

    @media screen and (min-width: bp(s)) {
      flex-direction: row;
      gap: 4rem;
    }

    .title-2 {
      margin-bottom: 1rem;
    }
  }

  &__footer {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid var(--color-grayscale-20);

    button[name='admin'] {
      margin-right: auto;
    }
  }
}

.user-profile {
  display: flex;
  flex-direction: column;

  &__access {
    display: flex;
    gap: 0.2rem;
    font-weight: 500;
    font-size: typography.$font-size-0;

    li:not(:last-of-type):after {
      content: '/';
    }
  }
}

.user-profile-form {
  flex: 1;
}

.user-products {
  flex: 1;

  &__list {
    li {
      margin-bottom: 1.25rem;
    }

    &__name {
      font-size: typography.$font-size-1;
    }
  }
}
</style>

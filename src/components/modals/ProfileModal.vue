<template>
  <modal-wrapper v-if="user" @close="$emit('close')">
    <template #header>
      {{ $t('user.profile') }}
    </template>

    <div class="modal__main--flex">
      <div class="column">
        <form-section v-if="me || $store.state.user.superAdmin">
          <form-component
            v-model="thisUser.displayName"
            input-type="input"
            name="name"
            :label="$t('fields.name')"
            rules="required"
          />

          <form-component
            v-model="thisUser.position"
            input-type="select"
            name="position"
            :label="$t('user.position.title')"
            rules="required"
            select-label="label"
            :select-options="userPositionOptions"
            :select-reduce="(option) => option.position"
            type="text"
          />

          <template #actions="{ handleSubmit, submitDisabled }">
            <btn-save :disabled="submitDisabled || loading" @click="handleSubmit(save)" />
          </template>
        </form-section>

        <template v-else>
          <div class="form-group">
            <span class="form-label">{{ $t('fields.name') }}</span>
            <span>{{ user.displayName }}</span>
          </div>
          <div class="form-group">
            <span class="form-label">{{ $t('user.position.title') }}</span>
            <span>
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
import { mapActions } from 'vuex';
import { db, auth } from '@/config/firebaseConfig';
import User from '@/db/User';
import { jobPositions } from '@/config/jobPositions';
import { FormSection, BtnSave } from '@/components/generic/form';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'ProfileModal',

  components: {
    ModalWrapper,
    FormSection,
    BtnSave,
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
    userPositionOptions() {
      return this.jobPositions.map((position) => ({
        position,
        label: this.$t(`user.position.${position}`),
      }));
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
    padding-left: 0;
  }

  > .title-2 {
    margin-bottom: 1rem;
  }
}

::v-deep .v-select {
  flex-grow: 1;
}
</style>

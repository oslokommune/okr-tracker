<template>
  <div v-if="activeItem" class="wrapper">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-product" @submit.prevent="handleSubmit(update)">
        <div class="form-group">
          <span class="form-label">Produkteier</span>
          <v-select
            v-model="activeItem.productowner"
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <div class="form-group">
          <span class="form-label">Team lead</span>
          <v-select
            v-model="activeItem.teamlead"
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <div class="form-group">
          <span class="form-label">Tech Lead</span>
          <v-select
            v-model="activeItem.teamlead"
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <div class="form-group">
          <span class="form-label">Design</span>
          <v-select
            v-model="activeItem.design"
            multiple
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <div class="form-group">
          <span class="form-label">Utvkling</span>
          <v-select
            v-model="activeItem.developers"
            multiple
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <div class="form-group">
          <span class="form-label">Others</span>
          <v-select
            v-model="activeItem.team"
            multiple
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-product" :disabled="loading">
        <i class="icon fa fa-fw fa-save" />
        {{ $t('btn.saveChanges') }}
      </button>
    </div>
  </div>
</template>

<script>
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { mapState } from 'vuex';

export default {
  name: 'ItemAdminTeam',

  data: () => ({
    users: [],
    loading: false,
  }),

  computed: {
    ...mapState(['activeItem']),
  },

  firestore: {
    users: db.collection('users'),
  },

  methods: {
    async update() {
      this.loading = true;
      try {
        const { id } = this.activeItem;

        const team = this.activeItem.team.map((user) => db.collection('users').doc(user.id));

        const data = { team };

        Product.update(id, data);
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.save'));
        throw new Error(e);
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss">

.wrapper {
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}
</style>

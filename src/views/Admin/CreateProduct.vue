<template>
  <div>
    <h1 class="title-1">{{ $t('admin.product.create') }}</h1>

    <div class="container">
      <validation-observer v-slot="{ handleSubmit }">
        <form id="createProduct" @submit.prevent="handleSubmit(save)">
          <form-component
            v-model="name"
            input-type="input"
            name="name"
            :label="$t('fields.name')"
            rules="required"
            type="text"
          />

          <form-component
            v-model="missionStatement"
            input-type="textarea"
            name="missionStatement"
            :label="$t('fields.missionStatement')"
            rules="required"
          />

          <form-component
            v-model="department"
            input-type="select"
            name="department"
            :label="$t('admin.product.parentDepartment')"
            select-label="name"
            rules="required"
            :select-options="departments"
          />

          <div class="form-group">
            <span class="form-label">{{ $t('general.teamMembers') }}</span>
            <v-select
              v-model="team"
              multiple
              :options="users"
              :get-option-label="option => option.displayName || option.id"
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
        <button class="btn btn--icon btn--pri" form="createProduct" :disabled="loading">
          <i class="icon fa fa-fw fa-save" />
          {{ $t('btn.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Product from '@/db/Product';
import { mapState } from 'vuex';
import findSlugAndRedirect from '@/util/findSlugAndRedirect';

export default {
  name: 'CreateProduct',

  data: () => ({
    name: '',
    missionStatement: '',
    department: null,
    team: [],
    users: [],
    loading: false,
  }),

  computed: {
    ...mapState(['departments']),
  },

  firestore: {
    users: db.collection('users'),
  },

  methods: {
    async save() {
      this.loading = true;
      const { name, missionStatement, department, team } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        department: db.collection('departments').doc(department.id),
        organization: db.collection('organizations').doc(department.organization.id),
        team: team.map(({ id }) => db.collection('users').doc(id)),
        archived: false,
      };

      try {
        const productRef = await Product.create(data);

        await findSlugAndRedirect(productRef);

        this.$toasted.show(this.$t('toaster.add.product'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.product'));
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors';

.container {
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(s)) {
    width: span(8);
    padding: 1.5rem;
  }

  @media screen and (min-width: bp(m)) {
    width: span(5, 0, span(9));
    padding: 1.5rem;
  }

  @media screen and (min-width: bp(l)) {
    width: span(4, 0, span(10));
    padding: 1.5rem;
  }
}
</style>

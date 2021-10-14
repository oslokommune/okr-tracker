<template>
  <div>
    <h1 class="title-1">{{ $t('admin.product.create') }}</h1>

    <div class="create-container">
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
        <button class="btn btn--icon btn--pri" form="createProduct" :disabled="loading">
          <i class="icon fa fa-fw fa-save" />
          {{ $t('btn.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import Product from '@/db/Product';
import { findSlugAndRedirect } from '@/util';

export default {
  name: 'CreateProduct',

  data: () => ({
    name: '',
    missionStatement: '',
    department: null,
    team: [],
    loading: false,
  }),

  computed: {
    ...mapState(['departments', 'users']),
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
        slack: [],
      };

      try {
        const productRef = await Product.create(data);

        await findSlugAndRedirect(productRef);

        this.$toasted.show(this.$t('toaster.add.product'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.product'));
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div class="container">
    <div class="create-container">
      <h1 class="title-1">{{ $t('admin.department.create') }}</h1>

      <validation-observer v-slot="{ handleSubmit }">
        <form id="createDepartment" @submit.prevent="handleSubmit(save)">
          <form-component
            v-model="name"
            input-type="input"
            name="name"
            :label="$t('fields.name')"
            rules="required"
            type="text"
            data-cy="dep-name"
          />

          <form-component
            v-model="missionStatement"
            input-type="textarea"
            name="missionStatement"
            :label="$t('fields.missionStatement')"
            rules="required"
            data-cy="dep-missionStatement"
          />

          <form-component
            v-model="organization"
            input-type="select"
            name="organization"
            :label="$t('admin.department.parentOrganisation')"
            select-label="name"
            rules="required"
            :select-options="organizations"
            data-cy="dep-parentOrg"
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
        <button class="btn btn--icon btn--pri" form="createDepartment" :disabled="loading" data-cy="btn-createDep">
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
import Department from '@/db/Department';
import { findSlugAndRedirect } from '@/util';

export default {
  name: 'CreateDepartment',

  data: () => ({
    name: '',
    missionStatement: '',
    organization: null,
    loading: false,
    team: [],
  }),

  computed: {
    ...mapState(['organizations', 'users']),
  },

  methods: {
    async save() {
      const { name, missionStatement, organization, team } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        organization: db.collection('organizations').doc(organization.id),
        archived: false,
        team: team.map(({ id }) => db.collection('users').doc(id)),
        slack: [],
      };

      this.loading = true;

      try {
        const depRef = await Department.create(data);

        await findSlugAndRedirect(depRef);

        this.$toasted.show(this.$t('toaster.add.department'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.department'));
        throw new Error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

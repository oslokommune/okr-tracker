<template>
  <div>
    <h1 class="title-1">{{ $t('admin.organization.create') }}</h1>

    <div class="create-container">
      <validation-observer v-slot="{ handleSubmit }">
        <form id="createOrganization" @submit.prevent="handleSubmit(save)">
          <form-component
            v-model="name"
            input-type="input"
            name="name"
            rules="required"
            :label="$t('fields.name')"
            type="text"
            data-cy="org-name"
          />

          <form-component
            v-model="missionStatement"
            input-type="textarea"
            name="missionStatement"
            :label="$t('fields.missionStatement')"
            rules="required"
            data-cy="org-missionStatement"
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
        <button class="btn btn--icon btn--pri" form="createOrganization" :disabled="loading" data-cy="btn-createOrg">
          <i class="icon fa fa-fw fa-save" />
          {{ $t('btn.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Organization from '@/db/Organization';
import { db } from '@/config/firebaseConfig';
import { findSlugAndRedirect } from '@/util';

export default {
  name: 'CreateOrganization',

  data: () => ({
    name: '',
    missionStatement: '',
    loading: false,
    team: [],
  }),

  computed: {
    ...mapState(['users']),
  },

  methods: {
    async save() {
      const { name, missionStatement, team } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        archived: false,
        team: team.map(({ id }) => db.collection('users').doc(id)),
        slack: [],
      };

      this.loading = true;

      try {
        const orgRef = await Organization.create(data);
        await findSlugAndRedirect(orgRef);
        this.$toasted.show(this.$t('toaster.add.organization'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.organization'));
        throw new Error(error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

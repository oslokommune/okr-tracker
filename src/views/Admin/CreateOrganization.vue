<template>
  <page-layout breakpoint="tablet">
    <div class="card">
      <h1 class="title-1">{{ $t('admin.organization.create') }}</h1>

      <form-section>
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

        <div class="pkt-form-group">
          <span class="pkt-form-label" for="teamMembers">
            {{ $t('general.teamMembers') }}
            <span class="pkt-badge">{{ $t('validation.optional') }}</span>
          </span>
          <v-select
            id="teamMembers"
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

        <template #actions="{ handleSubmit, submitDisabled }">
          <btn-save
            :text="$t('btn.create')"
            :disabled="submitDisabled || loading"
            data-cy="btn-createOrg"
            @click="handleSubmit(save)"
          />
        </template>
      </form-section>
    </div>
  </page-layout>
</template>

<script>
import { mapState } from 'vuex';
import Organization from '@/db/Organization';
import { db } from '@/config/firebaseConfig';
import { findSlugAndRedirect } from '@/util';
import { FormSection, BtnSave } from '@/components/generic/form';

export default {
  name: 'CreateOrganization',
  components: { FormSection, BtnSave },

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

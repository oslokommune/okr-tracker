<template>
  <page-layout breakpoint="tablet">
    <div class="card">
      <h1 class="title-1">{{ $t('admin.department.create') }}</h1>

      <form-section>
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
          :select-options="organizationOptions"
          data-cy="dep-parentOrg"
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
            data-cy="btn-createDep"
            @click="handleSubmit(save)"
          />
        </template>
      </form-section>
    </div>
  </page-layout>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import Department from '@/db/Department';
import { findSlugAndRedirect } from '@/util';
import { FormSection, BtnSave } from '@/components/generic/form';

export default {
  name: 'CreateDepartment',
  components: { FormSection, BtnSave },

  data: () => ({
    name: '',
    missionStatement: '',
    organization: null,
    loading: false,
    team: [],
  }),

  computed: {
    ...mapState(['organizations', 'users', 'user']),

    organizationOptions() {
      return this.user.superAdmin
        ? this.organizations
        : this.organizations.filter((o) => this.user.admin.includes(o.id));
    },
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

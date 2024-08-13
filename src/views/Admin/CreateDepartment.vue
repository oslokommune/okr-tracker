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
        />

        <form-component
          v-model="missionStatement"
          input-type="textarea"
          name="missionStatement"
          :label="$t('fields.missionStatement')"
          rules="required"
        />

        <form-component
          v-model="organization"
          input-type="custom-select"
          name="organization"
          :label="$t('admin.department.parentOrganisation')"
          value-prop="id"
          label-prop="name"
          :store-object="true"
          rules="required"
          :options="organizationOptions"
        />

        <form-component
          v-model="team"
          input-type="custom-select"
          select-mode="tags"
          name="team"
          :label="$t('general.teamMembers')"
          value-prop="id"
          :tag-label="(o) => o.displayName || o.id"
          :option-label="(o) => (o.displayName ? `${o.displayName} (${o.id})` : o.id)"
          :store-object="true"
          :options="users"
        />

        <template #actions="{ submit, disabled }">
          <btn-save
            :text="$t('btn.create')"
            :disabled="disabled || loading"
            @on-click="submit(save)"
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
      const organizations = this.user.superAdmin
        ? this.organizations
        : this.organizations.filter((o) => this.user.admin.includes(o.id));

      return organizations.map(({ id, name }) => ({ id, name }));
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

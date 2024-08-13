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
        />

        <form-component
          v-model="missionStatement"
          input-type="textarea"
          name="missionStatement"
          :label="$t('fields.missionStatement')"
          rules="required"
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

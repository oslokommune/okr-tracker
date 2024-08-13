<template>
  <page-layout breakpoint="tablet">
    <div class="card">
      <h1 class="title-1">{{ $t('admin.product.create') }}</h1>

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
          v-model="department"
          input-type="custom-select"
          name="department"
          :label="$t('admin.product.parentDepartment')"
          value-prop="id"
          label-prop="name"
          :store-object="true"
          rules="required"
          :options="departmentOptions"
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
import Product from '@/db/Product';
import { findSlugAndRedirect } from '@/util';
import { FormSection, BtnSave } from '@/components/generic/form';

export default {
  name: 'CreateProduct',
  components: { FormSection, BtnSave },

  data: () => ({
    name: '',
    missionStatement: '',
    department: null,
    team: [],
    loading: false,
  }),

  computed: {
    ...mapState(['departments', 'users', 'user']),

    departmentOptions() {
      const departments = this.user.superAdmin
        ? this.departments
        : this.departments.filter((d) => this.user.admin.includes(d.organization.id));

      return departments.map(({ id, organization, name }) => ({
        id,
        organization_id: organization.id,
        name,
      }));
    },
  },

  methods: {
    async save() {
      this.loading = true;
      const { name, missionStatement, department, team } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        department: db.collection('departments').doc(department.id),
        organization: db.collection('organizations').doc(department.organization_id),
        team: team.map(({ id }) => db.collection('users').doc(id)),
        archived: false,
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

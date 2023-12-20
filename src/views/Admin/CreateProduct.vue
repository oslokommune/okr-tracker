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
          input-type="select"
          name="department"
          :label="$t('admin.product.parentDepartment')"
          select-label="name"
          rules="required"
          :select-options="departmentOptions"
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
      return this.user.superAdmin
        ? this.departments
        : this.departments.filter((d) => this.user.admin.includes(d.organization.id));
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
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <div>
    <h1 class="title-1">{{ $t('admin.department.create') }}</h1>

    <div class="container">
      <validation-observer v-slot="{ handleSubmit }">
        <form id="createDepartment" @submit.prevent="handleSubmit(save)">
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
            input-type="select"
            name="organization"
            :label="$t('admin.department.parentOrganisation')"
            select-label="name"
            rules="required"
            :select-options="organizations"
          />
        </form>
      </validation-observer>

      <div class="button-row">
        <button class="btn btn--icon btn--pri" form="createDepartment" :disabled="loading">
          <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Department from '@/db/Department';
import { mapState } from 'vuex';
import findSlugAndRedirect from '@/util/findSlugAndRedirect';

export default {
  name: 'CreateDepartment',

  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
  },

  data: () => ({
    name: '',
    missionStatement: '',
    organization: null,
    loading: false,
  }),

  computed: {
    ...mapState(['organizations']),
  },

  methods: {
    findSlugAndRedirect,
    async save() {
      const { name, missionStatement, organization } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        organization: db.collection('organizations').doc(organization.id),
        archived: false,
      };

      this.loading = true;

      try {
        await Department.create(data).then(this.findSlugAndRedirect);
        this.$toasted.show(this.$t('toaster.add.department'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.department'));
        throw new Error(error);
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

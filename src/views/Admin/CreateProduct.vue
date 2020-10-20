<template>
  <div>
    <h1 class="title-1">Create new product</h1>

    <div class="container">
      <validation-observer v-slot="{ handleSubmit }">
        <form id="createProduct" @submit.prevent="handleSubmit(save)">
          <form-component input-type="input" name="name" label="Name" rules="required" type="text" v-model="name" />

          <form-component
            input-type="textarea"
            name="missionStatement"
            label="Mission statement"
            rules="required"
            v-model="missionStatement"
          />

          <form-component
            input-type="select"
            name="department"
            label="Parent department"
            select-label="name"
            rules="required"
            v-model="department"
            :select-options="departments"
          />

          <div class="form-group">
            <span class="form-label">Team members</span>
            <v-select
              multiple
              v-model="team"
              :options="users"
              :get-option-label="option => option.displayName || option.id"
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
          <span class="icon fa fa-fw fa-save"></span> Create
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Product from '@/db/Product';
import { extend } from 'vee-validate';
import { required } from 'vee-validate/dist/rules';
import { mapState } from 'vuex';
import findSlugAndRedirect from '@/util/findSlugAndRedirect';

extend('required', required);

export default {
  data: () => ({
    name: '',
    missionStatement: '',
    department: null,
    team: [],
    users: [],
    loading: false,
  }),

  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
  },

  computed: {
    ...mapState(['departments']),
  },

  firestore: {
    users: db.collection('users'),
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
        await Product.create(data).then(findSlugAndRedirect);
      } catch {
        this.$toasted.show('Could not create product');
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

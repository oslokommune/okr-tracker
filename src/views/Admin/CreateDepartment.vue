<template>
  <div>
    <h1 class="title-1">Create new department</h1>

    <div class="container">
      <form>
        <label class="form-group">
          <span class="form-label">Name</span>
          <input class="form__field" type="text" v-model="name" />
        </label>
        <label class="form-group">
          <span class="form-label">Mission statement</span>
          <textarea class="form__field" v-model="missionStatement" rows="4"></textarea>
        </label>
        <div class="form-group">
          <span class="form-label">Parent organization</span>
          <v-select label="name" v-model="organization" :options="organizations" :clearable="false"></v-select>
        </div>
      </form>

      <div class="button-row">
        <button class="btn btn--icon btn--pri" @click="save"><span class="icon fa fa-fw fa-save"></span> Create</button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Department from '@/db/Department';
import { mapState } from 'vuex';

export default {
  data: () => ({
    name: '',
    missionStatement: '',
    organization: null,
  }),

  computed: {
    ...mapState(['organizations']),
  },

  methods: {
    async save() {
      const { name, missionStatement, organization } = this;
      const data = {
        name: name.trim(),
        missionStatement: missionStatement.trim(),
        organization: db.collection('organizations').doc(organization.id),
        archived: false,
      };

      try {
        await Department.create(data);
      } catch (error) {
        this.$toasted.show('Could not create department');
        throw new Error(error);
      }
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

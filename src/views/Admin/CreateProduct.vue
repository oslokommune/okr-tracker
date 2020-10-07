<template>
  <div>
    <h1 class="title-1">Create new product</h1>

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
          <span class="form-label">Parent department</span>
          <v-select label="name" v-model="department" :options="departments" :clearable="false"></v-select>
        </div>
        <div class="form-group">
          <span class="form-label">Team members</span>
          <v-select label="displayName" multiple v-model="team" :options="users">
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
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
import Product from '@/db/Product';
import { mapState } from 'vuex';
import findSlugAndRedirect from '@/util/findSlugAndRedirect';

export default {
  data: () => ({
    name: '',
    missionStatement: '',
    department: null,
    team: [],
    users: [],
  }),

  computed: {
    ...mapState(['departments']),
  },

  firestore: {
    users: db.collection('users'),
  },

  methods: {
    async save() {
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

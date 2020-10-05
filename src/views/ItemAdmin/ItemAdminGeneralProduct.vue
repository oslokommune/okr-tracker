<template>
  <div v-if="activeItem">
    <form @submit.prevent="update" id="form">
      <label class="form-group">
        <span class="form-label">Name</span>
        <input class="form__field" type="text" v-model="activeItem.name" />
      </label>
      <label class="form-group">
        <span class="form-label">Slug</span>
        <input class="form__field" type="text" v-model="activeItem.slug" disabled />
      </label>
      <label class="form-group">
        <span class="form-label">Mission statement</span>
        <textarea class="form__field" v-model="activeItem.missionStatement" rows="4"></textarea>
      </label>
      <div class="form-group">
        <span class="form-label">Parent department</span>
        <v-select label="name" v-model="activeItem.department" :options="departments" :clearable="false"></v-select>
      </div>
      <div class="form-group">
        <span class="form-label">Team members</span>
        <v-select label="displayName" multiple v-model="activeItem.team" :options="users">
          <template #option="option">
            {{ option.displayName || option.id }}
            <span v-if="option.displayName !== option.id">({{ option.id }})</span>
          </template>
        </v-select>
      </div>
    </form>

    <div v-if="activeItem.archived" class="archived">
      <h2 class="title-2">Archived</h2>
      <p>
        This object is archived. By permanently deleting this object, all of its related KPIs, objectives, key results
        and progress will forever be gone.
      </p>
      <div class="button-row">
        <button class="btn btn--icon" @click="restore">
          <span class="icon fa fa-fw fa-recycle"></span> Restore product
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep">
          <span class="icon fa fa-fw fa-trash"></span> Permanently delete
        </button>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" for="form">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!activeItem.archived">
        <span class="icon fa fa-fw fa-trash"></span> Archive product
      </button>
    </div>
  </div>
</template>

<script>
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { mapState } from 'vuex';

export default {
  data: () => ({
    users: [],
  }),
  computed: {
    ...mapState(['activeItem', 'departments']),
  },

  firestore: {
    users: db.collection('users'),
  },
  methods: {
    async update() {
      try {
        const { id, name, missionStatement } = this.activeItem;

        const team = this.activeItem.team.map(user => db.collection('users').doc(user.id));
        const department = db.collection('departments').doc(this.activeItem.department.id);

        Product.update(id, { name, team, missionStatement, department });
        this.$toasted.show('Saved successfully');
      } catch {
        this.$toasted.show('Could not save changes');
      }
    },
    async archive() {
      try {
        await Product.archive(this.activeItem.id);
        this.$toasted.show('Archived');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not archive product');
      }
    },

    async restore() {
      try {
        await Product.restore(this.activeItem.id);
        this.$toasted.show('Restored');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not restore product');
      }
    },

    async deleteDeep() {
      try {
        await Product.deleteDeep(this.activeItem.id);
        this.$toasted.show('Permanently deleted product');
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not delete product');
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.button-row {
  display: flex;
  flex-wrap: wrap;
  margin: 2.5rem -0.25rem -0.25rem;

  > .btn {
    margin: 0.25rem;
  }
}
</style>

<template>
  <div v-if="activeItem">
    <form>
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
        <span class="form-label">Parent organization</span>
        <v-select label="name" v-model="activeItem.organization" :options="organizations" :clearable="false"></v-select>
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
          <span class="icon fa fa-fw fa-recycle"></span> Restore department
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep">
          <span class="icon fa fa-fw fa-trash"></span> Permanently delete
        </button>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" @click="update">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!activeItem.archived">
        <span class="icon fa fa-fw fa-trash"></span> Archive department
      </button>
    </div>
  </div>
</template>

<script>
import Department from '@/db/Department';
import { db } from '@/config/firebaseConfig';
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['activeItem', 'organizations']),
  },

  methods: {
    async update() {
      console.log('update');
      try {
        const { id, name, missionStatement } = this.activeItem;

        const organization = await db.collection('organizations').doc(this.activeItem.organization.id);

        await Department.update(id, { name, missionStatement, organization });
        this.$toasted.show('Saved successfully');
      } catch (error) {
        console.error(error);
        this.$toasted.show('Could not save changes');
      }
    },
    async archive() {
      try {
        await Department.archive(this.activeItem.id);
        this.$toasted.show('Archived');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not archive department');
      }
    },

    async restore() {
      try {
        await Department.restore(this.activeItem.id);
        this.$toasted.show('Restored');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not restore department');
      }
    },

    async deleteDeep() {
      try {
        await Department.deleteDeep(this.activeItem.id);
        this.$toasted.show('Permanently deleted department');
        this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not delete department');
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

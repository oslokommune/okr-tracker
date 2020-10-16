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

    <div class="form-group">
      <span class="form-label">Image</span>
      <img v-if="activeItem.photoURL" :src="activeItem.photoURL" class="image" />
      <input type="file" class="btn" @input="setImage" accept="image/png, image/jpeg" />
    </div>

    <div v-if="activeItem.archived" class="archived">
      <h2 class="title-2">Archived</h2>
      <p>
        This object is archived. By permanently deleting this object, all of its related KPIs, objectives, key results
        and progress will forever be gone.
      </p>
      <div class="button-row">
        <button class="btn btn--icon" @click="restore" :disabled="loading">
          <span class="icon fa fa-fw fa-recycle"></span> Restore department
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep" :disabled="loading">
          <span class="icon fa fa-fw fa-trash"></span> Permanently delete
        </button>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" @click="update" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" :disabled="loading" v-if="!activeItem.archived">
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
  data: () => ({
    image: null,
    loading: false,
  }),
  computed: {
    ...mapState(['activeItem', 'organizations']),
  },

  methods: {
    async update() {
      this.loading = true;
      try {
        const { id, name, missionStatement } = this.activeItem;

        const organization = await db.collection('organizations').doc(this.activeItem.organization.id);
        const data = { name, missionStatement, organization };
        if (this.image) {
          data.photoURL = await Department.uploadImage(id, this.image);
        }

        await Department.update(id, data);
        this.$toasted.show('Saved successfully');
      } catch (error) {
        console.error(error);
        this.$toasted.show('Could not save changes');
      }

      this.loading = false;
    },

    async setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
    },

    async archive() {
      this.loading = true;
      try {
        await Department.archive(this.activeItem.id);
        this.$toasted.show('Archived');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not archive department');
      }

      this.loading = false;
    },

    async restore() {
      this.loading = true;
      try {
        await Department.restore(this.activeItem.id);
        this.$toasted.show('Restored');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not restore department');
      }

      this.loading = false;
    },

    async deleteDeep() {
      this.loading = true;
      try {
        await Department.deleteDeep(this.activeItem.id);
        this.$toasted.show('Permanently deleted department');
        this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not delete department');
      }

      this.loading = false;
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

.image {
  width: 10rem;
  height: 10rem;
  margin: 1rem 0;
  object-fit: cover;
  border-radius: 3px;
}
</style>

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
    </form>

    <div class="form-group">
      <span class="form-label">Image</span>
      <img v-if="activeItem.photoURL" :src="activeItem.photoURL" class="image" />
      <input type="file" class="btn" @input="setImage" accept="image/png, image/jpeg" />
    </div>

    <div v-if="activeItem.archived" class="archived">
      <h2 class="title-2">Archived</h2>
      <p>
        This object is archived. By permanently deleting this object, all of its related departments, products, KPIs,
        objectives, key results and progress will forever be gone.
      </p>
      <div class="button-row">
        <button class="btn btn--icon" @click="restore">
          <span class="icon fa fa-fw fa-recycle"></span> Restore organization
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
        <span class="icon fa fa-fw fa-trash"></span> Archive organization
      </button>
    </div>
  </div>
</template>

<script>
import Organization from '@/db/Organization';
import { mapState } from 'vuex';

export default {
  data: () => ({
    image: null,
  }),

  computed: {
    ...mapState(['activeItem']),
  },

  methods: {
    async update() {
      try {
        const { id, name, missionStatement } = this.activeItem;

        const data = { name, missionStatement };
        if (this.image) {
          data.photoURL = await Organization.uploadImage(id, this.image);
        }

        await Organization.update(id, data);
        this.$toasted.show('Saved successfully');
      } catch (error) {
        console.error(error);
        this.$toasted.show('Could not save changes');
      }
    },

    async setImage({ target }) {
      const { files } = target;
      if (files.length !== 1) return;
      const [image] = files;
      this.image = image;
    },

    async archive() {
      try {
        await Organization.archive(this.activeItem.id);
        this.$toasted.show('Archived');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not archive organization');
      }
    },

    async restore() {
      try {
        await Organization.restore(this.activeItem.id);
        this.$toasted.show('Restored');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not restore organization');
      }
    },

    async deleteDeep() {
      try {
        await Organization.deleteDeep(this.activeItem.id);
        this.$toasted.show('Permanently deleted organization');
        this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not delete organization');
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

.image {
  width: 10rem;
  height: 10rem;
  margin: 1rem 0;
  object-fit: cover;
  border-radius: 3px;
}
</style>

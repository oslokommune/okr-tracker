<template>
  <div v-if="activeItem">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-product" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          label="Name"
          rules="required"
          v-model="activeItem.name"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">Slug</span>
          <input class="form__field" type="text" v-model="activeItem.slug" disabled />
        </label>

        <form-component
          input-type="textarea"
          name="missionStatement"
          label="Mission Statement"
          rules="required"
          v-model="activeItem.missionStatement"
          type="text"
        />

        <div class="form-group">
          <span class="form-label">Parent department</span>
          <v-select label="name" v-model="activeItem.department" :options="departments" :clearable="false"></v-select>
        </div>
        <div class="form-group">
          <span class="form-label">Team members</span>
          <v-select
            multiple
            v-model="activeItem.team"
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
          <span class="icon fa fa-fw fa-recycle"></span> Restore product
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep" :disabled="loading">
          <span class="icon fa fa-fw fa-trash"></span> Permanently delete
        </button>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-product" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> Save changes
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!activeItem.archived" :disabled="loading">
        <span class="icon fa fa-fw fa-trash"></span> Archive product
      </button>
    </div>
  </div>
</template>

<script>
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { mapState } from 'vuex';
import FormComponent from '../../components/FormComponent.vue';

export default {
  components: { FormComponent },

  data: () => ({
    users: [],
    image: null,
    loading: false,
  }),
  computed: {
    ...mapState(['activeItem', 'departments']),
  },

  firestore: {
    users: db.collection('users'),
  },
  methods: {
    async update() {
      this.loading = true;
      try {
        const { id, name, missionStatement } = this.activeItem;

        const team = this.activeItem.team.map(user => db.collection('users').doc(user.id));
        const department = db.collection('departments').doc(this.activeItem.department.id);

        const data = { name, team, missionStatement, department };

        if (this.image) {
          data.photoURL = await Product.uploadImage(id, this.image);
        }

        Product.update(id, data);
        this.$toasted.show('Saved successfully');
      } catch (error) {
        console.log(error);
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
        await Product.archive(this.activeItem.id);
        this.$toasted.show('Archived');
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        console.log(error);
        this.$toasted.show('Could not archive product');
      }
      this.loading = false;
    },

    async restore() {
      this.loading = true;
      try {
        await Product.restore(this.activeItem.id);
        this.$toasted.show('Restored');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not restore product');
      }
      this.loading = false;
    },

    async deleteDeep() {
      this.loading = true;
      try {
        await Product.deleteDeep(this.activeItem.id);
        this.$toasted.show('Permanently deleted product');
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.$toasted.show('Could not delete product');
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

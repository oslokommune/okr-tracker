<template>
  <div v-if="activeItem">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-department" @submit.prevent="handleSubmit(update)">
        <form-component
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          v-model="activeItem.name"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.slug') }}</span>
          <input class="form__field" type="text" v-model="activeItem.slug" disabled />
        </label>

        <form-component
          input-type="textarea"
          name="missionStatement"
          :label="$t('fields.missionStatement')"
          rules="required"
          v-model="activeItem.missionStatement"
        />

        <div class="form-group">
          <span class="form-label">{{ $t('admin.department.parentOrganisation') }}</span>
          <v-select
            label="name"
            v-model="activeItem.organization"
            :options="organizations"
            :clearable="false"
          ></v-select>
        </div>
      </form>
    </validation-observer>

    <div class="form-group">
      <span class="form-label">{{ $t('admin.department.picture') }}</span>
      <img v-if="activeItem.photoURL" :src="activeItem.photoURL" class="image" />
      <input type="file" class="btn" @input="setImage" accept="image/png, image/jpeg" />
    </div>

    <div v-if="activeItem.archived" class="archived">
      <h2 class="title-2">{{ $t('archivedRestore.heading') }}</h2>
      <p>{{ $t('archivedRestore.message') }}</p>
      <div class="button-row">
        <button class="btn btn--icon" @click="restore" :disabled="loading">
          <span class="icon fa fa-fw fa-recycle"></span> {{ $t('archivedRestore.btn.restore') }}
        </button>
        <button class="btn btn--icon btn--danger" @click="deleteDeep" :disabled="loading">
          <span class="icon fa fa-fw fa-trash"></span> {{ $t('archivedRestore.btn.delete') }}
        </button>
      </div>
    </div>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-department" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" :disabled="loading" v-if="!activeItem.archived">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import Department from '@/db/Department';
import { db } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';
import { mapState } from 'vuex';
import FormComponent from '../../components/FormComponent.vue';

export default {
  data: () => ({
    image: null,
    loading: false,
  }),
  computed: {
    ...mapState(['activeItem', 'organizations']),
  },
  components: { FormComponent },

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
        Toast.savedChanges();
      } catch (error) {
        console.error(error);
        Toast.showError('Could not save changes');
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
        const restoreCallback = await Department.restore.bind(null, this.activeItem.id);
        Toast.deletedRegret({ name: this.activeItem.name, callback: restoreCallback });
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.showError('Could not archive department');
      }

      this.loading = false;
    },

    async restore() {
      this.loading = true;
      try {
        await Department.restore(this.activeItem.id);
        Toast.revertedDeletion();
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.showError('Could not restore department');
      }

      this.loading = false;
    },

    async deleteDeep() {
      this.loading = true;
      try {
        await Department.deleteDeep(this.activeItem.id);
        Toast.deletedPermanently();
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.showError('Could not delete department');
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

<template>
  <div v-if="activeItem">
    <archived-restore v-if="activeItem.archived" :delete-deep="deleteDeep" :restore="restore"></archived-restore>

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

export default {
  data: () => ({
    loading: false,
  }),
  computed: {
    ...mapState(['activeItem', 'organizations']),
  },
  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
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
        Toast.savedChanges();
      } catch (error) {
        Toast.errorSave();
        throw new Error(error.message);
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
        this.activeItem.archived = true;
        await Department.archive(this.activeItem.id);
        const restoreCallback = await Department.restore.bind(null, this.activeItem.id);
        Toast.deletedRegret({ name: this.activeItem.name, callback: restoreCallback });
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        Toast.errorArchive(this.activeItem.name);
        this.activeItem.archived = false;
        throw new Error(error.message);
      }

      this.loading = false;
    },

    async restore() {
      this.loading = true;
      try {
        await Department.restore(this.activeItem.id);
        Toast.revertedDeletion();
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        Toast.errorRestore(this.activeItem.name);
        throw new Error(error.message);
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
      } catch (error) {
        Toast.errorDelete(this.activeItem.name);
        throw new Error(error.message);
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.image {
  width: 10rem;
  height: 10rem;
  margin: 1rem 0;
  object-fit: cover;
  border-radius: 3px;
}
</style>

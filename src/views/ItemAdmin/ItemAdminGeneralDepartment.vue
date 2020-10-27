<template>
  <div v-if="activeItem">
    <archived-restore v-if="activeItem.archived" :deleteDeep="deleteDeep" :restore="restore"></archived-restore>

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
import { mapState } from 'vuex';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import FormComponent from '@/components/FormComponent.vue';

export default {
  data: () => ({
    image: null,
    loading: false,
  }),
  computed: {
    ...mapState(['activeItem', 'organizations']),
  },
  components: { FormComponent, ArchivedRestore },

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
        this.activeItem.archived = true;
        await Department.archive(this.activeItem.id);
        this.$toasted.show('Archived');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        this.activeItem.archived = false;
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
        await this.$router.push('/');
        this.$toasted.show('Permanently deleted department');
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.show('Could not delete department');
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

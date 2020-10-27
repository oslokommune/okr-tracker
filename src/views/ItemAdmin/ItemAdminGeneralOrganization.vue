<template>
  <div v-if="activeItem">
    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-organization" @submit.prevent="handleSubmit(update)">
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
      </form>
    </validation-observer>

    <div class="form-group">
      <span class="form-label">{{ $t('admin.organization.picture') }}</span>
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
      <button class="btn btn--icon btn--pri" form="update-organization">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!activeItem.archived">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import Organization from '@/db/Organization';
import * as Toast from '@/util/toasts';
import { mapState } from 'vuex';
import FormComponent from '../../components/FormComponent.vue';

export default {
  components: { FormComponent },
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
        Toast.savedChanges();
      } catch (error) {
        console.error(error);
        Toast.showError('Could not save changes');
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
        const restoreCallback = await Organization.restore.bind(null, this.activeItem.id);
        Toast.deletedRegret({ name: this.activeItem.name, callback: restoreCallback });
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.showError('Could not archive organization');
      }
    },

    async restore() {
      try {
        await Organization.restore(this.activeItem.id);
        Toast.revertedDeletion();
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.showError('Could not restore organization');
      }
    },

    async deleteDeep() {
      try {
        await Organization.deleteDeep(this.activeItem.id);
        Toast.deletedPermanently();
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.showError('Could not delete organization');
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

<template>
  <div v-if="activeItem">
    <archived-restore v-if="activeItem.archived" :delete-deep="deleteDeep" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-organization" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="activeItem.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
          data-cy="org-name"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.slug') }}</span>
          <input v-model="activeItem.slug" class="form__field" type="text" disabled />
        </label>

        <form-component
          v-model="activeItem.missionStatement"
          input-type="textarea"
          name="missionStatement"
          :label="$t('fields.missionStatement')"
          rules="required"
        />
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-organization" :disabled="loading">
        <i class="icon fa fa-fw fa-save" />
        {{ $t('btn.saveChanges') }}
      </button>
      <button v-if="!activeItem.archived" class="btn btn--icon btn--danger" :disabled="loading" @click="archive">
        <i class="icon fa fa-fw fa-trash" />
        {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import Organization from '@/db/Organization';
import { mapState } from 'vuex';
import { toastArchiveAndRevert } from '@/util/toastUtils';

export default {
  name: 'ItemAdminGeneralOrganization',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
  },

  data: () => ({
    loading: false,
  }),

  computed: {
    ...mapState(['activeItem']),
  },

  methods: {
    async update() {
      this.loading = true;
      try {
        const { id, name, missionStatement } = this.activeItem;

        const data = { name, missionStatement };

        await Organization.update(id, data);
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.save'));
        throw new Error(error.message);
      }

      this.loading = false;
    },

    async archive() {
      this.loading = true;

      try {
        this.activeItem.archived = true;
        await Organization.archive(this.activeItem.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.activeItem.name, callback: restoreCallback });

        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.archive', { document: this.activeItem.name }));
        this.activeItem.archived = false;
        throw new Error(error.message);
      }

      this.loading = false;
    },

    async restore() {
      this.loading = true;

      try {
        await Organization.restore(this.activeItem.id);
        this.$toasted.show(this.$t('toaster.restored'));
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.restore', { document: this.activeItem.name }));
        throw new Error(error.message);
      }

      this.loading = false;
    },

    async deleteDeep() {
      this.loading = true;

      try {
        await Organization.deleteDeep(this.activeItem.id);
        this.$toasted.show(this.$t('toaster.delete.permanently'));
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.delete', { document: this.activeItem.name }));
        throw new Error(error.message);
      }

      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>

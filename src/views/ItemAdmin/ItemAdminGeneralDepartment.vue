<template>
  <div v-if="activeItem">
    <archived-restore v-if="activeItem.archived" :delete-deep="deleteDeep" :restore="restore"></archived-restore>

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-department" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="activeItem.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
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

        <div class="form-group">
          <span class="form-label">{{ $t('admin.department.parentOrganisation') }}</span>
          <v-select
            v-model="activeItem.organization"
            label="name"
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
      <button v-if="!activeItem.archived" class="btn btn--icon btn--danger" :disabled="loading" @click="archive">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import Department from '@/db/Department';
import { db } from '@/config/firebaseConfig';
import { mapState } from 'vuex';

export default {
  name: 'ItemAdminGeneralDepartment',

  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
  },

  data: () => ({
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

        await Department.update(id, data);
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
        await Department.archive(this.activeItem.id);
        this.$toasted.show(this.$t('toaster.delete.object', { name: this.activeItem.name }), {
          action: [
            {
              text: this.$t('toaster.action.regret'),
              onClick: () => {
                this.restore();
              },
            },
            {
              text: this.$t('btn.close'),
              onClick: (e, toastObject) => {
                toastObject.goAway(0);
              },
            },
          ],
        });
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
        await Department.restore(this.activeItem.id);
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
        await Department.deleteDeep(this.activeItem.id);
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

<style lang="scss" scoped>
.image {
  width: 10rem;
  height: 10rem;
  margin: 1rem 0;
  object-fit: cover;
  border-radius: 3px;
}
</style>

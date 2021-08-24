<template>
  <div v-if="activeItem" class="wrapper">
    <archived-restore v-if="activeItem.archived" :delete-deep="deleteDeep" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-item" @submit.prevent="handleSubmit(update)">
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

        <div v-if="type === 'department'" class="form-group">
          <span class="form-label">{{ $t('admin.department.parentOrganisation') }}</span>
          <v-select v-model="activeItem.organization" label="name" :options="organizations" :clearable="false" />
        </div>

        <div v-else-if="type === 'product'" class="form-group">
          <span class="form-label">{{ $t('admin.product.parentDepartment') }}</span>
          <v-select v-model="activeItem.department" label="name" :options="departments" :clearable="false"></v-select>
        </div>

        <div class="form-group">
          <span class="form-label">{{ $t('general.teamMembers') }}</span>
          <v-select
            v-model="activeItem.team"
            multiple
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
          >
            <template #option="option">
              {{ option.displayName || option.id }}
              <span v-if="option.displayName !== option.id">({{ option.id }})</span>
            </template>
          </v-select>
        </div>

        <label class="form-group">
          <span class="form-label">{{ $t('fields.secret') }}</span>
          <span class="form-help" v-html="$t('admin.apiSecret')"></span>
          <input v-model="activeItem.secret" type="text" class="form__field" />
        </label>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-item" :disabled="loading">
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
import { mapState } from 'vuex';
import Organization from '@/db/Organization';
import Department from '@/db/Department';
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { toastArchiveAndRevert } from '@/util/toastUtils';

export default {
  name: 'ItemAdminGeneral',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
  },

  data: () => ({
    loading: false,
    users: [],
  }),

  computed: {
    ...mapState(['activeItem', 'organizations', 'departments']),

    type() {
      const { department, organization } = this.activeItem;
      if (organization && department) return 'product';
      if (organization) return 'department';
      return 'organization';
    },
  },

  firestore: {
    users: db.collection('users'),
  },

  methods: {
    async update() {
      this.loading = true;
      try {
        const { id, name, missionStatement, secret } = this.activeItem;

        const team = this.activeItem.team.map((user) => db.collection('users').doc(user.id));

        if (this.type === 'organization') {
          const data = { name, missionStatement, secret: secret === undefined ? '' : secret, team };

          await Organization.update(id, data);
        } else if (this.type === 'department') {
          const organization = await db.collection('organizations').doc(this.activeItem.organization.id);
          const data = { name, missionStatement, organization, secret: secret === undefined ? '' : secret, team };

          await Department.update(id, data);
        } else {
          const department = db.collection('departments').doc(this.activeItem.department.id);
          const data = { name, team, missionStatement, department, secret: secret === undefined ? '' : secret };

          await Product.update(id, data);
        }
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

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.wrapper {
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}
</style>

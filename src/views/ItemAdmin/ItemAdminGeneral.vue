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
          @edited-data="edit"
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
          @edited-data="edit"
        />

        <div v-if="type === 'department'" class="form-group">
          <span class="form-label">{{ $t('admin.department.parentOrganisation') }}</span>
          <v-select
            v-model="activeItem.organization"
            label="name"
            :options="organizations"
            :clearable="false"
            @input="edit"
          />
        </div>

        <div v-else-if="type === 'product'" class="form-group">
          <span class="form-label">{{ $t('admin.product.parentDepartment') }}</span>
          <v-select
            v-model="activeItem.department"
            label="name"
            :options="departments"
            :clearable="false"
            @input="edit"
          ></v-select>
        </div>

        <div class="form-group">
          <span class="form-label">{{ $t('general.teamMembers') }}</span>
          <v-select
            v-model="activeItem.team"
            multiple
            :options="users"
            :get-option-label="(option) => option.displayName || option.id"
            @input="edit"
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
          <input v-model="activeItem.secret" type="text" class="form__field" @input="edit" />
        </label>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri btn--icon-pri" form="update-item" :disabled="loading || !changes">
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
import { toastArchiveAndRevert } from '@/util';

export default {
  name: 'ItemAdminGeneral',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
  },

  data: () => ({
    loading: false,
    changes: false,
  }),

  computed: {
    ...mapState(['activeItem', 'organizations', 'departments', 'users']),

    type() {
      const { department, organization } = this.activeItem;
      if (organization && department) return 'product';
      if (organization) return 'department';
      return 'organization';
    },
  },

  methods: {
    edit() {
      this.changes = true;
    },
    async update() {
      this.loading = true;
      try {
        const { id, name, missionStatement, secret } = this.activeItem;

        const team = this.activeItem.team.map((user) => db.collection('users').doc(user.id));

        if (this.type === 'organization') {
          const data = { name, missionStatement, secret: secret === undefined ? '' : secret, team, id };

          await Organization.update(id, data);
        } else if (this.type === 'department') {
          const organization = await db.collection('organizations').doc(this.activeItem.organization.id);
          const data = { name, missionStatement, organization, secret: secret === undefined ? '' : secret, team, id };

          await Department.update(id, data);
        } else {
          const department = db.collection('departments').doc(this.activeItem.department.id);
          const data = { name, team, missionStatement, department, secret: secret === undefined ? '' : secret, id };

          await Product.update(id, data);
        }
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.save'));
        throw new Error(error.message);
      } finally {
        this.loading = false;
        this.changes = false;
      }
    },

    async archive() {
      this.loading = true;

      try {
        this.activeItem.archived = true;
        this.activeItem.slack = [];

        if (this.type === 'organization') {
          await Organization.archive(this.activeItem.id);
        } else if (this.type === 'department') {
          await Department.archive(this.activeItem.id);
        } else if (this.type === 'product') {
          await Product.archive(this.activeItem.id);
        }

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.activeItem.name, callback: restoreCallback });

        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.archive', { document: this.activeItem.name }));
        this.activeItem.archived = false;
        throw new Error(error.message);
      } finally {
        this.loading = false;
        this.changes = false;
      }
    },

    async restore() {
      this.loading = true;

      try {
        if (this.type === 'organization') {
          await Organization.restore(this.activeItem.id);
        } else if (this.type === 'department') {
          await Department.restore(this.activeItem.id);
        } else if (this.type === 'product') {
          await Product.restore(this.activeItem.id);
        }

        this.$toasted.show(this.$t('toaster.restored'));
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.restore', { document: this.activeItem.name }));
        throw new Error(error.message);
      } finally {
        this.loading = false;
        this.changes = false;
      }
    },

    async deleteDeep() {
      this.loading = true;

      try {
        if (this.type === 'organization') {
          await Organization.deleteDeep(this.activeItem.id);
        } else if (this.type === 'department') {
          await Department.deleteDeep(this.activeItem.id);
        } else if (this.type === 'product') {
          await Product.deleteDeep(this.activeItem.id);
        }

        this.$toasted.show(this.$t('toaster.delete.permanently'));
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.delete', { document: this.activeItem.name }));
        throw new Error(error.message);
      } finally {
        this.loading = false;
        this.changes = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.wrapper {
  padding: 2rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  @media screen and (min-width: bp(l)) {
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}
</style>

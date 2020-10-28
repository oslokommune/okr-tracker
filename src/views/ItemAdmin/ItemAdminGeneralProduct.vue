<template>
  <div v-if="activeItem">
    <archived-restore v-if="activeItem.archived" :delete-deep="deleteDeep" :restore="restore"></archived-restore>

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-product" @submit.prevent="handleSubmit(update)">
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
          type="text"
        />

        <div class="form-group">
          <span class="form-label">{{ $t('admin.product.parentDepartment') }}</span>
          <v-select label="name" v-model="activeItem.department" :options="departments" :clearable="false"></v-select>
        </div>
        <div class="form-group">
          <span class="form-label">{{ $t('general.teamMembers') }}</span>
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

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-product" :disabled="loading">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button class="btn btn--icon btn--danger" @click="archive" v-if="!activeItem.archived" :disabled="loading">
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import * as Toast from '@/util/toasts';
import { mapState } from 'vuex';

export default {
  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
  },

  data: () => ({
    users: [],
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

        Product.update(id, data);
        Toast.savedChanges();
      } catch {
        Toast.errorSave();
      }
      this.loading = false;
    },

    async archive() {
      this.loading = true;
      try {
        this.activeItem.archived = true;
        await Product.archive(this.activeItem.id);
        const restoreCallback = await Product.restore.bind(null, this.activeItem.id);
        Toast.deletedRegret({ name: this.activeItem.name, callback: restoreCallback });
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.errorArchive(this.activeItem.name);
        this.activeItem.archived = false;
      }
      this.loading = false;
    },

    async restore() {
      this.loading = true;
      try {
        await Product.restore(this.activeItem.id);
        Toast.revertedDeletion();
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.errorRestore(this.activeItem.id);
      }
      this.loading = false;
    },

    async deleteDeep() {
      this.loading = true;
      try {
        await Product.deleteDeep(this.activeItem.id);
        Toast.deletedPermanently();
        await this.$router.push('/');
        // TODO: Refresh store and sidebar navigation tree
      } catch {
        Toast.errorDelete(this.activeItem.name);
      }
      this.loading = false;
    },
  },
};
</script>

<style lang="scss" scoped></style>

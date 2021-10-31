<template>
  <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
  <div v-else-if="objective" class="details">
    <archived-restore v-if="objective.archived" :delete-deep="deleteDeep" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-objective" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="objective.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
          @edited-data="edit"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.description') }}</span>
          <input v-model="objective.description" class="form__field" type="text" @input="edit"/>
        </label>

        <form-component
          v-model.number="objective.weight"
          input-type="input"
          name="weight"
          :label="$t('fields.weight')"
          rules="required|decimal|positiveNotZero"
          type="text"
          @edited-data="edit"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.icon') }}</span>
          <v-select v-model="objective.icon" class="form-field" :options="icons" @input="edit">
            <template #selected-option="{ label }">
              <span class="selected-icon fa fa-fw" :class="`fa-${label}`"></span>
              {{ label }}
            </template>
            <template #option="option">
              <i :class="`fas fa-fw fa-${option.label}`" />&nbsp;
              <span>{{ option.label }}</span>
            </template>
            <template #no-options="{}">{{ $t('select.noIcons') }}</template>
          </v-select>
        </label>

        <validation-provider v-slot="{ errors }" rules="required" name="period">
          <label class="form-group">
            <span class="form-label">{{ $t('fields.period') }}</span>
            <v-select
              v-model="objective.period"
              label="name"
              :options="periods"
              :clearable="false"
              @input="changedPeriod = true"
              @edited-data="edit"
            >
              <template #option="option"> {{ option.name }} </template>
            </v-select>
            <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
          </label>
        </validation-provider>
      </form>
    </validation-observer>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-objective" :disabled="loading || !changes">
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
      </button>
      <button
        v-if="!objective.archived"
        class="btn btn--icon btn--danger btn--icon-pri"
        :disabled="loading"
        @click="archive"
      >
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import Objective from '@/db/Objective';
import icons from '@/config/icons';
import { toastArchiveAndRevert } from '@/util';

export default {
  name: 'ItemAdminObjective',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ContentLoaderOkrDetails: () => import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
  },

  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data: () => ({
    objective: null,
    periods: [],
    changedPeriod: false,
    loading: false,
    changes: false,
    icons,
    isLoadingDetails: false,
  }),

  watch: {
    data: {
      immediate: true,
      async handler() {
        this.isLoadingDetails = true;
        const parent = await db
          .collection('slugs')
          .doc(this.data.parent.slug)
          .get()
          .then((snapshot) => snapshot.data().reference);
        this.$bind('periods', db.collection('periods').where('parent', '==', parent));
        this.objective = { ...this.data, id: this.data.id };
        this.isLoadingDetails = false;
      },
    },
  },

  methods: {
    edit() {
      this.changes = true;
    },
    async update() {
      this.loading = true;
      try {
        const { id, name, description, weight, icon, period } = this.objective;
        const data = {
          name,
          icon: icon || '',
          description: description || '',
          weight: weight || 1,
          period: db.collection('periods').doc(period.id),
        };

        await Objective.update(id, data);

        if (this.changedPeriod) {
          await this.$router.push({ query: {} });
          await this.$router.push({ query: { type: 'objective', id } });
        }

        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
      this.changes = false;
    },
    async archive() {
      this.loading = true;
      try {
        await this.$router.push({ query: { type: 'period', id: this.objective.period.id } });
        await Objective.archive(this.objective.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.objective.name, callback: restoreCallback });
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.archive', { document: this.objective.name }));
      }

      this.loading = false;
      this.changes = false;
    },

    async restore() {
      try {
        await Objective.restore(this.objective.id);
        this.objective.archived = false;
        this.$toasted.show(this.$t('toaster.restored'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.restore', { document: this.objective.id }));
      }
    },

    async deleteDeep() {
      try {
        await this.$router.push({ query: { type: 'period', id: this.objective.period.id } });
        await Objective.deleteDeep(this.objective.id);
        this.$toasted.show(this.$t('toaster.delete.permanently'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.delete', { document: this.objective.name }));
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/styles/_colors.scss';

.selected-icon {
  display: inline-block;
  margin-right: 0.5rem;
}

.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  @media screen and (min-width: bp(l)) {
    align-self: flex-start;
    width: span(3, 0, span(10));
    margin-top: 0;
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
</style>

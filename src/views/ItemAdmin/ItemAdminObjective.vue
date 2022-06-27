<template>
  <content-loader-okr-details
    v-if="isLoadingDetails"
  ></content-loader-okr-details>
  <div v-else-if="objective" class="details">
    <archived-restore v-if="objective.archived" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-objective" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="objective.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.description') }}</span>
          <input
            v-model="objective.description"
            class="form__field"
            type="text"
          />
        </label>

        <form-component
          v-model.number="objective.weight"
          input-type="input"
          name="weight"
          :label="$t('fields.weight')"
          rules="required|decimal|positiveNotZero"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('fields.icon') }}</span>
          <v-select v-model="objective.icon" :options="icons">
            <template #selected-option="{ label }">
              <span
                class="selected-icon fa fa-fw"
                :class="`fa-${label}`"
              ></span>
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
            >
              <template #option="option"> {{ option.name }} </template>
            </v-select>
            <span v-if="errors[0]" class="form-field--error">{{
              errors[0]
            }}</span>
          </label>
        </validation-provider>
      </form>
    </validation-observer>

    <div class="button-row">
      <button
        v-if="!objective.archived"
        class="btn btn--icon btn--archive"
        :disabled="loading"
        @click="archive"
      >
        <span class="icon fa fa-fw fa-trash"></span> {{ $t('btn.delete') }}
      </button>
      <button
        class="btn btn--icon btn--pri btn--icon-pri"
        form="update-objective"
        :disabled="loading"
      >
        <span class="icon fa fa-fw fa-save"></span> {{ $t('btn.saveChanges') }}
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
    ContentLoaderOkrDetails: () =>
      import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
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
        this.$bind(
          'periods',
          db.collection('periods').where('parent', '==', parent)
        );
        this.objective = { ...this.data, id: this.data.id };
        this.isLoadingDetails = false;
      },
    },
  },

  methods: {
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
    },
    async archive() {
      this.loading = true;
      try {
        await this.$router.push({
          query: { type: 'period', id: this.objective.period.id },
        });
        await Objective.archive(this.objective.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({
          name: this.objective.name,
          callback: restoreCallback,
        });
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.objective.name })
        );
      }

      this.loading = false;
    },

    async restore() {
      try {
        await Objective.restore(this.objective.id);
        this.objective.archived = false;
        this.$toasted.show(this.$t('toaster.restored'));
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.objective.id })
        );
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.selected-icon {
  display: inline-block;
  margin-right: 0.5rem;
}

.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

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

  .btn--pri {
    color: var(--color-text);
    background: var(--color-green);
  }

  .btn--archive {
    color: var(--color-text);
    background: transparent;
  }

  .button-row {
    display: flex;
    justify-content: flex-end;
  }
}
</style>

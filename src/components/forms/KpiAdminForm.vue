<template>
  <div v-if="localKpi">
    <edit-goals-modal
      v-if="showEditGoalsModal"
      :kpi="kpi"
      @close="showEditGoalsModal = false"
    />

    <form-section error-summary>
      <form-component
        v-model="localKpi.name"
        input-type="input"
        name="name"
        :label="$t('fields.name')"
        rules="required"
        type="text"
      />

      <form-component
        v-model="localKpi.description"
        input-type="textarea"
        name="description"
        :label="$t('fields.description')"
      />

      <div class="display-settings">
        <form-component
          v-model="localKpi.format"
          input-type="select"
          name="format"
          :label="$t('kpi.format')"
          rules="required"
          select-label="label"
          :select-options="formats"
          :select-reduce="(option) => option.id"
          type="text"
        />
        <form-component
          v-model="localKpi.startValue"
          input-type="select"
          name="startValue"
          :label="$t('kpi.startValue')"
          rules="required"
          select-label="label"
          :select-options="startValues"
          :select-reduce="(option) => option.id"
          type="text"
        />
        <form-component
          v-model="localKpi.preferredTrend"
          input-type="select"
          name="preferredTrend"
          :label="$t('kpi.preferredTrend')"
          rules="required"
          select-label="label"
          :select-options="trendOptions"
          :select-reduce="(option) => option.id"
          type="text"
        />
      </div>

      <hr class="pkt-hr" />

      <validation-provider rules="required" name="kpiType">
        <div class="pkt-form-group">
          <span class="pkt-form-label">{{ $t('fields.kpitype') }}</span>
          <div
            v-for="{ id, label, description } in types"
            :key="id"
            class="pkt-form-group pkt-form-group--row"
          >
            <input
              :id="kpi.id + '-' + id"
              v-model="localKpi.kpiType"
              type="radio"
              class="pkt-form-check-input pkt-form-check-input--tile"
              name="radio-group"
              :value="id"
            />
            <label class="pkt-form-label" :for="kpi.id + '-' + id">
              {{ label }}
              <span class="description">
                {{ description }}
              </span>
            </label>
          </div>

          <pkt-alert v-if="localKpi.kpiType === 'ri' && localKpi.kpiType !== kpi.kpiType">
            {{ $t('kpi.help.resultIndicatorWarning') }}
          </pkt-alert>
        </div>
      </validation-provider>

      <hr class="pkt-hr" />

      <div v-if="kpi" class="goal-section">
        <div class="pkt-form-group">
          <span class="pkt-form-label">
            {{ $t('kpi.goals.goals') }}
            <span class="pkt-badge">{{ $t('validation.optional') }} </span>
          </span>
          <div class="goal-section__content-wrapper">
            <span>{{ $t('kpi.goals.help') }}</span>
            <pkt-button
              type="button"
              skin="secondary"
              @onClick="showEditGoalsModal = true"
            >
              {{ $t(hasGoal ? 'kpi.goals.edit' : 'kpi.goals.set') }}
            </pkt-button>
          </div>
        </div>
        <hr class="pkt-hr" />
      </div>

      <i18n path="kpi.help.updates" tag="p">
        <template #readMoreLink>
          <router-link :to="{ name: 'Help', hash: '#kpi-er' }" target="_blank">{{
            $t('kpi.help.readMoreHere')
          }}</router-link>
        </template>
      </i18n>

      <toggle-button
        v-model="localKpi.auto"
        name="auto"
        :label="$t('kpi.automation.radio')"
      >
        <p class="google-sheets-info">
          {{ $t('sheets.infoText') }}<br />
          <strong>{{ serviceAccountAddress }}</strong>
        </p>

        <google-sheets-form-group
          :sheet-id="localKpi.sheetId"
          :sheet-url.sync="localKpi.sheetUrl"
          :sheet-name.sync="localKpi.sheetName"
          :sheet-cell.sync="localKpi.sheetCell"
        />
      </toggle-button>

      <hr class="pkt-hr" />

      <form-component
        v-model="localKpi.updateFrequency"
        input-type="select"
        name="updateFrequency"
        :label="$t('kpi.updateFrequency.label')"
        rules="required"
        select-label="label"
        :select-options="updateFrequencies"
        :select-reduce="(option) => option.id"
        type="text"
      >
        <template #help>
          {{ $t('kpi.updateFrequency.help') }}
        </template>
      </form-component>

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-delete v-if="kpi" :disabled="loading" @click="$emit('delete')" />
        <btn-save
          :disabled="submitDisabled || loading"
          @click="handleSubmit(submitForm)"
        />
      </template>
    </form-section>
  </div>
</template>

<script>
import { functions } from '@/config/firebaseConfig';
import { PktButton } from '@oslokommune/punkt-vue2';
import {
  kpiFormats,
  kpiStartValues,
  kpiTypes,
  kpiTrendOptions,
  kpiUpdateFrequencies,
} from '@/util/kpiHelpers';
import { FormSection, ToggleButton, BtnDelete, BtnSave } from '@/components/generic/form';
import EditGoalsModal from '@/components/modals/EditGoalsModal.vue';
import GoogleSheetsFormGroup from './partials/GoogleSheetsFormGroup.vue';

export default {
  name: 'KpiAdminForm',

  components: {
    FormSection,
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
    PktButton,
    ToggleButton,
    BtnSave,
    BtnDelete,
    EditGoalsModal,
    GoogleSheetsFormGroup,
  },

  props: {
    kpi: {
      required: true,
      type: Object,
    },
    loading: {
      required: false,
      type: Boolean,
      default: false,
    },
    hasGoal: {
      required: true,
      type: Boolean,
      default: false,
    },
  },

  data: () => ({
    localKpi: null,
    formats: kpiFormats(),
    startValues: kpiStartValues(),
    trendOptions: kpiTrendOptions(),
    types: kpiTypes(),
    updateFrequencies: kpiUpdateFrequencies(),
    showEditGoalsModal: false,
    serviceAccountAddress: import.meta.env.VITE_SHEETS_SERVICE_ACCOUNT,
  }),

  mounted() {
    const {
      auto,
      description,
      format,
      kpiType,
      name,
      preferredTrend,
      sheetCell,
      sheetId,
      sheetName,
      sheetUrl,
      startValue,
      updateFrequency,
    } = this.kpi;

    // For backwards compatibility, check for any previously configured sheet
    // details if the `auto` property doesn't exist on the model.
    const sheetsConfigured = Boolean((sheetId || sheetUrl) && sheetName && sheetCell);

    this.localKpi = {
      auto: auto || (auto === undefined && sheetsConfigured),
      description,
      format,
      kpiType,
      name,
      preferredTrend,
      sheetCell,
      sheetName,
      sheetUrl: sheetUrl || '',
      startValue: startValue || 'zero',
      updateFrequency,
    };
  },

  methods: {
    submitForm() {
      this.$emit('save', this.localKpi, () => {
        if (this.localKpi.auto) {
          this.testConnection();
        }
      });
    },

    async testConnection() {
      try {
        await functions.httpsCallable('fetchKpiDataTrigger')(this.kpi.id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;

.goal-section {
  &__content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;

    @include bp('tablet-up') {
      flex-direction: row;
      gap: 2rem;
    }

    > span {
      flex: 1 1 auto;
    }
  }

  button {
    flex: 0 0 auto;
    align-self: flex-end;
  }
}

::v-deep .display-settings {
  display: grid;
  grid-column-gap: 0.5rem;
  grid-template-columns: repeat(2, 1fr);

  > * {
    grid-column: 1 / 3;

    @include bp('phablet-up') {
      grid-column: unset;

      .pkt-form-group {
        margin-bottom: 0;
      }
    }
  }

  > *:last-child {
    grid-column: 1 / 3;

    .pkt-form-group {
      margin-bottom: 1.5rem;
    }
  }

  @include bp('phablet-up') {
    flex-direction: row;
    gap: 1.5rem;
  }
}

.google-sheets-info {
  margin: 1.25rem 0 2rem;
}
</style>

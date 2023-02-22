<template>
  <div v-if="localKpi">
    <edit-goals-modal
      v-if="showEditGoalsModal"
      :kpi="kpi"
      @close="showEditGoalsModal = false"
    />

    <form-section>
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

      <div class="kpi-format-and-trend">
        <form-component
          v-model="localKpi.format"
          input-type="select"
          name="format"
          :label="$t('kpi.display')"
          rules="required"
          select-label="label"
          :select-options="formats"
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

      <validation-provider v-slot="{ errors }" rules="required" name="kpiType">
        <div class="form-group">
          <span class="form-label">{{ $t('fields.kpitype') }}</span>
          <span v-if="errors[0]" class="form-field--error">
            {{ errors[0] }}
          </span>
          <div
            v-for="{ id, label, description } in types"
            :key="id"
            class="ods-form-group descriptive-radio"
          >
            <input
              :id="kpi.id + '-' + id"
              v-model="localKpi.kpiType"
              type="radio"
              class="ods-form-radio"
              name="radio-group"
              :value="id"
            />
            <label class="ods-form-label" :for="kpi.id + '-' + id">
              <span class="title">{{ label }}</span>
            </label>
            <label class="description" :for="kpi.id + '-' + id">
              {{ description }}
            </label>
          </div>
        </div>
      </validation-provider>

      <hr class="pkt-hr" />

      <div v-if="kpi" class="goal-section">
        <h3>{{ $t('kpi.goals.goals') }}</h3>
        <div class="goal-section__content-wrapper">
          <span>{{ $t('kpi.goals.help') }}</span>
          <button
            class="btn btn--sec"
            @click="
              $event.preventDefault();
              showEditGoalsModal = true;
            "
          >
            {{ $t(hasGoal ? 'kpi.goals.edit' : 'kpi.goals.set') }}
          </button>
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
          <span class="form-help" v-html="$t('kpi.updateFrequency.help')"></span>
        </template>
      </form-component>

      <template #actions="{ handleSubmit, submitDisabled }">
        <btn-delete
          v-if="kpi"
          :disabled="loading"
          :icon-only="true"
          @click="$emit('delete')"
        />
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
import {
  kpiFormats,
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
.goal-section {
  h3 {
    margin-bottom: 1rem;
    color: var(--color-text);
  }

  &__content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;

    @media screen and (min-width: bp(s)) {
      flex-direction: row;
      gap: 2rem;
    }
  }

  button {
    align-self: flex-end;

    @media screen and (min-width: bp(s)) {
      align-self: inherit;
    }
  }
}
</style>

<style lang="scss">
#kpiFormat,
#preferredTrend {
  flex-direction: column;
}

.kpi-format-and-trend {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: stretch;

  > span {
    flex: 1;
  }
}

.google-sheets-info {
  margin: 1.25rem 0 2rem;
}
</style>

<template>
  <div>
    <edit-goals-modal
      v-if="showEditGoalsModal"
      :kpi="localKpi"
      @close="showEditGoalsModal = false"
    />

    <validation-observer v-slot="{ handleSubmit }" tag="form">
      <form-component
        v-model="localKpi.name"
        input-type="input"
        name="name"
        :label="$t('fields.name')"
        rules="required"
        type="text"
      />

      <label class="form-group">
        <span class="form-label">{{ $t('fields.description') }}</span>
        <textarea v-model="localKpi.description" class="form__field" rows="4" />
      </label>

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

      <hr class="ods-hr" />

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
              :id="localKpi.id + '-' + id"
              v-model="localKpi.kpiType"
              type="radio"
              class="ods-form-radio"
              name="radio-group"
              :value="id"
            />
            <label class="ods-form-label" :for="localKpi.id + '-' + id">
              <span class="title">{{ label }}</span>
            </label>
            <label class="description" :for="localKpi.id + '-' + id">
              {{ description }}
            </label>
          </div>
        </div>
      </validation-provider>

      <hr class="ods-hr" />

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
            {{ $t('kpi.goals.set') }}
          </button>
        </div>

        <hr class="ods-hr" />
      </div>

      <i18n path="kpi.help.updates" tag="p">
        <template #readMoreLink>
          <router-link :to="{ name: 'Help', hash: '#kpi-er' }">
            {{ $t('kpi.help.readMoreHere') }}
          </router-link>
        </template>
      </i18n>

      <toggle-button v-model="localKpi.auto" :label="$t('kpi.automation.radio')">
        <google-sheets-form-group
          :sheet-id.sync="localKpi.sheetId"
          :sheet-name.sync="localKpi.sheetName"
          :sheet-cell.sync="localKpi.sheetCell"
        />
      </toggle-button>

      <toggle-button v-model="localKpi.api">
        <template #label>
          {{ $t('kpi.api.radio') }}
          <i v-tooltip="$t('kpi.api.tooltip')" class="icon fa fa-info-circle" />
        </template>

        <div v-if="kpi">
          <form-component
            input-type="input"
            type="text"
            label="API"
            rules="required"
            :readonly="true"
            :copy-button="true"
            :value="apiCurl(kpi)"
          >
            <template #help>
              <span class="form-help">{{ $t('kpi.api.help') }}</span>
            </template>
          </form-component>
        </div>
      </toggle-button>

      <div class="button-row">
        <btn-delete
          v-if="kpi"
          :disabled="loading"
          :icon-only="true"
          @click="$emit('delete', kpi)"
        />
        <btn-save :disabled="loading" @click="handleSubmit(submitForm)" />
      </div>
    </validation-observer>
  </div>
</template>

<script>
import {
  kpiFormats,
  kpiTypes,
  kpiTrendOptions,
  kpiUpdateFrequencies,
} from '@/util/kpiHelpers';
import { BtnSave, BtnDelete } from '@/components/generic/form/buttons';
import EditGoalsModal from '@/components/modals/EditGoalsModal.vue';
import ToggleButton from '@/components/generic/form/ToggleButton.vue';
import GoogleSheetsFormGroup from './partials/GoogleSheetsFormGroup.vue';

export default {
  name: 'KpiAdminForm',

  components: {
    BtnSave,
    BtnDelete,
    EditGoalsModal,
    ToggleButton,
    GoogleSheetsFormGroup,
  },

  props: {
    kpi: {
      required: false,
      type: Object,
      default: null,
    },
    loading: {
      required: false,
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
  }),

  watch: {
    kpi: {
      immediate: true,
      handler() {
        if (this.kpi) {
          // For backwards compatibility, check for any previously configured sheet
          // details if the `auto` property doesn't exist on the model.
          const sheetsConfigured = Boolean(
            this.kpi.sheetId && this.kpi.sheetName && this.kpi.sheetCell
          );

          this.localKpi = {
            id: this.kpi.id,
            auto: this.kpi.auto || sheetsConfigured,
            ...this.kpi,
          };
        } else {
          this.localKpi = {
            name: '',
            description: '',
            format: null,
            kpiType: null,
            preferredTrend: null,
            updateFrequency: null,
            sheetId: '',
            sheetName: '',
            sheetCell: '',
            api: false,
            auto: false,
          };
        }
      },
    },
  },

  methods: {
    submitForm() {
      this.$emit('save', this.localKpi);
    },

    apiCurl: (kpi) =>
      `curl -X POST -H "okr-team-secret: <YOUR SECRET>" -H "x-api-key: <YOUR API-KEY>" -H "Content-Type: application/json" -d '{ "progress": <VALUE> }' ${
        import.meta.env.VITE_API_GATEWAY_URL
      }/kpi/${kpi.id}`,
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

::v-deep .v-select {
  flex-grow: 1;
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
</style>

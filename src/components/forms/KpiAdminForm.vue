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

      <validation-provider v-slot="{ errors }" rules="required" name="format">
        <label class="form-group">
          <span class="form-label">
            {{ $t('kpi.display') }}
          </span>
          <select v-model="localKpi.format" class="form__field">
            <option v-for="{ id, label } in formats" :key="id" :value="id">
              {{ label }}
            </option>
          </select>
          <span v-if="errors[0]" class="form-field--error">
            {{ errors[0] }}
          </span>
        </label>
      </validation-provider>

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
            @click="$event.preventDefault(); showEditGoalsModal = true"
          >
            {{ $t('kpi.goals.set') }}
          </button>
        </div>

        <hr class="ods-hr" />
      </div>

      <i18n path="kpi.help.updates" tag="p">
        <template #readMoreLink>
          <router-link :to="{ name: 'Help', hash: '#kpi-er' }">{{
            $t('kpi.help.readMoreHere')
          }}</router-link>
        </template>
      </i18n>

      <div class="toggle__container">
        <span class="toggle__label">{{ $t('kpi.automation.radio') }}</span>
        <label class="toggle">
          <input
            v-model="sheetsEnabled"
            class="toggle__input"
            type="checkbox"
          />
          <span class="toggle__switch"></span>
        </label>
      </div>

      <div v-if="sheetsEnabled">
        <form-component
          v-model="localKpi.sheetId"
          input-type="input"
          name="sheetId"
          :label="$t('keyResult.automation.googleSheetId')"
          rules="required"
          type="text"
        >
          <template #help>
            <span
              class="form-help"
              v-html="$t('keyResult.automation.googleSheetIdHelp')"
            ></span>
          </template>
        </form-component>

        <div class="form-row">
          <form-component
            v-model="localKpi.sheetName"
            input-type="input"
            name="sheetTab"
            :label="$t('keyResult.automation.sheetsTab')"
            placeholder="Sheet1"
            rules="required"
            type="text"
          >
            <template #help>
              <span
                class="form-help"
                v-html="$t('keyResult.automation.sheetsTabHelp')"
              ></span>
            </template>
          </form-component>

          <form-component
            v-model="localKpi.sheetCell"
            input-type="input"
            name="sheetCell"
            :label="$t('keyResult.automation.sheetsCell')"
            placeholder="A1"
            rules="required"
            type="text"
          >
            <template #help>
              <span
                class="form-help"
                v-html="$t('keyResult.automation.sheetsCellHelp')"
              ></span>
            </template>
          </form-component>
        </div>
      </div>

      <div class="toggle__container">
        <span class="toggle__label">
          {{ $t('kpi.api.radio') }}
          <i v-tooltip="$t('kpi.api.tooltip')" class="icon fa fa-info-circle" />
        </span>
        <label class="toggle">
          <input v-model="localKpi.api" class="toggle__input" type="checkbox" />
          <span class="toggle__switch"></span>
        </label>
      </div>

      <div v-if="kpi && localKpi.api">
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
import { kpiFormats, kpiTypes } from '@/util/kpiHelpers';
import { BtnSave, BtnDelete } from '@/components/generic/form/buttons';
import EditGoalsModal from '@/components/modals/EditGoalsModal.vue';

export default {
  name: 'KpiAdminForm',

  components: {
    BtnSave,
    BtnDelete,
    EditGoalsModal,
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
    types: kpiTypes(),
    showEditGoalsModal: false,
  }),

  computed: {
    sheetsEnabled: {
      get() {
        // For backwards compatibility, check for any previosly configured sheet
        // details if the `auto` property doesn't exist on the model.
        const sheetsEnabled = this.localKpi.auto;

        if (
          this.kpi &&
          sheetsEnabled === undefined &&
          (this.kpi.sheetId || this.kpi.sheetName || this.kpi.sheetCell)
        ) {
          return true;
        }
        return sheetsEnabled;
      },
      set(checked) {
        this.$set(this.localKpi, 'auto', checked);
      },
    },
  },

  watch: {
    kpi: {
      immediate: true,
      handler() {
        if (this.kpi) {
          this.localKpi = {
            id: this.kpi.id,
            ...this.kpi,
          };
        } else {
          this.localKpi = {
            name: '',
            description: '',
            format: null,
            kpiType: null,
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
</style>

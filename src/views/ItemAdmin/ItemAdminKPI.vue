<template>
  <collapse-container class="form-card">
    <template #collapse-header>
      <div class="kpi__header">
        <span class="kpi__header-label">{{ typeLabel }}</span>
        <h2>
          {{ kpi.name }}
          <span
            v-if="kpi.error"
            v-tooltip="stateMessage"
            class="ods-badge ods-badge--danger"
          >
            <i :class="['fa', `fa-${stateIcon}`]" />
            {{ $t('kpi.configurationError') }}
          </span>
        </h2>
      </div>
      <div class="kpi__header-value-container">
        <span class="kpi__header-label">Verdi</span>
        <span class="kpi__header-value">
          {{ formatKPIValue(kpi, kpi.currentValue) }}
        </span>
      </div>
    </template>

    <template #collapse-body>
      <hr class="ods-hr" />

      <div
        v-if="state === 'loading' || state === 'error'"
        :class="['kpi__state', `kpi__state--${state}`]"
      >
        <i
          v-tooltip="stateMessage"
          :class="[
            'fa',
            `fa-${stateIcon}`,
            { 'fa-pulse': state === 'loading' },
          ]"
        />
        <span>{{ stateMessage }}</span>
      </div>

      <validation-observer v-slot="{ handleSubmit }">
        <form :id="`kpi_${localKpi.id}`" @submit.prevent="handleSubmit(save.bind(null, localKpi))">
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
              <select v-model="kpi.format" class="form__field">
                <option
                  v-for="{ id, label } in formats" :key="id" :value="id">
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
              <div v-for="{ id, label, description } in types" :key="id"
                  class="ods-form-group descriptive-radio">
                <input type="radio" :id="localKpi.id + '-' + id" class="ods-form-radio"
                      name="radio-group" v-model="localKpi.kpiType" :value="id" />
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

          <template v-if="localKpi.api">
            {{ $t('kpi.api.help') }}
          </template>

          <template v-if="!localKpi.api">
            <h3 class="title-2" style="color: var(--color-text)">{{ $t('kpi.sheetsDetails') }}</h3>

            <form-component
              v-model="localKpi.sheetId"
              input-type="input"
              name="sheetId"
              :label="$t('keyResult.automation.googleSheetId')"
              rules="required"
              type="text"
            >
              <template #help>
                <span class="form-help" v-html="$t('keyResult.automation.googleSheetIdHelp')"></span>
              </template>
            </form-component>
            <div class="button-sync-row">
              <button class="btn btn--icon btn--ghost" :form="`kpi_${localKpi.id}`">
                <icon-arrow-circle class="icon"/>
                {{ $t('btn.syncData') }}
              </button>
            </div>

            <form-component
              v-model="localKpi.sheetName"
              input-type="input"
              name="sheetTab"
              :label="$t('keyResult.automation.sheetsTab')"
              rules="required"
              type="text"
            >
              <template #help>
                <span class="form-help" v-html="$t('keyResult.automation.sheetsTabHelp')"></span>
              </template>
            </form-component>

            <form-component
              v-model="localKpi.sheetCell"
              input-type="input"
              name="sheetCell"
              :label="$t('keyResult.automation.sheetsCell')"
              rules="required"
              type="text"
            >
              <template #help>
                <span class="form-help" v-html="$t('keyResult.automation.sheetsCellHelp')"></span>
              </template>
            </form-component>
          </template>

          <form-component
            v-else
            input-type="input"
            type="text"
            label="API"
            rules="required"
            :readonly="true"
            :copy-button="true"
            :value="apiCurl(localKpi)"
          >
            <template #help>
              <span class="form-help">Push updates with curl</span>
            </template>
          </form-component>
        </form>
      </validation-observer>

      <div class="button-row">
        <btn-delete :icon-only="true" @click="archive($event, localKpi)" />
        <btn-save :form="`kpi_${localKpi.id}`" />
      </div>
    </template>
  </collapse-container>
</template>

<script>
import { mapState } from 'vuex';
import IconArrowCircle from '@/assets/IconArrowCircle.vue';
import { formatKPIValue, kpiFormats, kpiTypes } from '@/util/kpiHelpers';
import Kpi from '@/db/Kpi';
import { toastArchiveAndRevert } from '@/util';
import CollapseContainer from '@/components/generic/collapse/CollapseContainer.vue';
import { BtnSave, BtnDelete } from '@/components/generic/form/buttons';

export default {
  name: 'ItemAdminKPI',

  components: {
    CollapseContainer,
    BtnSave,
    BtnDelete,
    IconArrowCircle,
  },

  props: {
    kpi: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    showAddKPIModal: false,
    localKpi: null,
    formats: kpiFormats(),
    types: kpiTypes(),
  }),

  computed: {
    ...mapState(['kpis']),
    state() {
      if (this.localKpi.error) return 'error';
      if (this.localKpi.valid) return 'valid';
      return 'loading';
    },
    stateIcon() {
      switch (this.state) {
        case 'error':
          return 'exclamation-triangle';
        case 'valid':
          return 'check-circle';
        default:
          return 'spinner';
      }
    },
    stateMessage() {
      switch (this.state) {
        case 'error':
          return this.showError(this.localKpi.error);
        case 'valid':
          return 'OK';
        default:
          return this.$t('general.loading');
      }
    },
    typeLabel() {
      // const labels = this.types.map(({ id, label }) => ({ id: label }));
      const labels = Object.assign(
        {},
        ...this.types.map(({ id, label }) => ({ [id]: label }))
      );
      return labels[this.kpi.kpiType] || this.kpi.kpiType;
    },
  },

  watch: {
    kpi: {
      immediate: true,
      handler() {
        this.localKpi = this.kpi;
      },
    },
  },

  methods: {
    formatKPIValue,

    async save(kpi) {
      kpi.error = false;
      kpi.valid = false;
      delete kpi.parent;
      try {
        if (kpi.api) {
          kpi.sheetCell = '';
          kpi.sheetId = '';
          kpi.sheetName = '';
        }

        await Kpi.update(kpi.id, kpi);
        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.save'));
      }
    },

    async archive(e, kpi) {
      e.preventDefault();

      try {
        await Kpi.archive(kpi.id);

        const restoreCallback = this.restore.bind(this, kpi);

        toastArchiveAndRevert({ name: kpi.name, callback: restoreCallback });
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: kpi.name })
        );
      }
    },

    async restore(kpi) {
      try {
        await Kpi.restore(kpi.id);
        this.$toasted.show(this.$t('toaster.restored'));
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: kpi.name })
        );
      }
    },

    showError(msg) {
      if (msg === '403') return this.$t('error.403');
      if (msg === '404') return this.$t('error.404');

      if (msg.includes('Cannot find data in cell')) {
        const cell = msg.split('cell ')[1];
        return this.$t('error.noDataInCell', { cell });
      }
      return msg;
    },

    apiCurl: (kpi) =>
      `curl -X POST -H "okr-team-secret: <YOUR SECRET>" -H "x-api-key: <YOUR API-KEY>" -H "Content-Type: application/json" -d '{ "progress": <VALUE> }' ${
        import.meta.env.VITE_API_GATEWAY_URL
      }/kpi/${kpi.id}`,
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.form-card {
  padding: 0;
}

::v-deep .collapse {
  &__header-content {
    display: flex;
    align-items: center;
  }
  &__header {
    padding: 1.5rem;
  }
  &__body {
    padding: 0 1.5rem 1.5rem 1.5rem;

    .ods-hr:first-child {
      margin-top: 0;
    }
  }
}

.kpi__header {
  flex-grow: 1;

  > h2 {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-weight: 500;
    font-size: typography.$font-size-2;
  }

  &-label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--color-grey-500);
    font-size: 0.75rem;
  }

  &-value-container {
    text-align: right;

    @media screen and (max-width: bp(s)) {
      display: none;
    }
  }

  &-value {
    display: block;
    font-size: typography.$font-size-2;
  }
}

.form-row {
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));

  & > .form-group {
    margin: 0;
  }
}

.kpi__state {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-green);
  border-radius: 2px;

  &--valid {
    background: var(--color-green);
  }
  &--error {
    background: var(--color-red);
  }
}

.button-sync-row {
  display: flex;
  justify-content: flex-end;
}
</style>

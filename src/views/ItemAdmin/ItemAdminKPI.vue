<template>
  <div class="kpi">
    <div class="kpi__validation">
      <div v-if="localKpi.error" class="kpi__error">
        <i class="fa fa-exclamation-triangle" />
        {{ showError(localKpi.error) }}
      </div>
      <div v-if="localKpi.valid" class="kpi__valid"><span class="fa fa-check-circle"></span> OK</div>
      <div v-if="!localKpi.valid && !localKpi.error" class="kpi__loading">
        <i class="fa fa-spinner fa-pulse" />
        {{ $t('general.loading') }}
      </div>
    </div>

    <validation-observer v-slot="{ handleSubmit }">
      <form :id="`kpi_${localKpi.id}`" @submit.prevent="handleSubmit(save.bind(null, localKpi))">
        <label class="form-group">
          <span class="form-label">Type</span>
          <input v-model="localKpi.type" class="form__field" type="text" disabled="disabled" />
        </label>

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
              <i class="icon fas fa-sync" />
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

        <label v-if="localKpi.api" class="form-group">
          <span class="form-label">API</span>
          <span class="form-help">Push updates with curl</span>
          <input :value="apiCurl(localKpi)" type="text" disabled class="form__field" />
        </label>

        <div class="button-row">
          <button class="btn btn--danger" @click="deleteDeep(localKpi)">{{ $t('btn.delete') }}</button>
          <button class="btn btn--primary" :form="`kpi_${localKpi.id}`">
            <i class="icon fa fa-fw fa-check" />
            {{ $t('btn.saveChanges') }}
          </button>
        </div>
      </form>
    </validation-observer>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Kpi from '@/db/Kpi';

export default {
  name: 'ItemAdminKPI',

  props: {
    kpi: {
      required: true,
      type: Object,
    },
  },

  data: () => ({
    showAddKPIModal: false,
    localKpi: null,
  }),

  computed: {
    ...mapState(['kpis']),
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

    async deleteDeep(kpi) {
      try {
        await Kpi.deleteDeep(kpi.id);
        this.$toasted.show(this.$t('toaster.delete.permanently'));
      } catch {
        this.$toasted.error(this.$t('toaster.error.delete', { document: kpi.name }));
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
.form-row {
  display: grid;
  grid-gap: 0.5rem;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));

  & > .form-group {
    margin: 0;
  }
}

.kpi {
  max-width: 30rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  &--error {
    box-shadow: 0 0 2px 3px rgba(var(--color-red-rgb), 0.4);
  }
}

.kpi__validation {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-grey-100);
}

.kpi__valid {
  padding: 0.5rem;
  background: var(--color-green);
  border-radius: 2px;
}

.kpi__loading {
  padding: 0.5rem;
  border-radius: 2px;
}

.kpi__error {
  padding: 0.5rem;
  background: var(--color-red);
  border-radius: 2px;
}

.btn--primary {
  color: var(--color-text);
  background: var(--color-green);
}

.btn--danger {
  color: var(--color-text);
  background: transparent;
}

.icon {
  padding-right: 0.3rem;
}

.button-row {
  display: flex;
  justify-content: flex-end;
}

.button-sync-row {
  display: flex;
  justify-content: flex-end;
}
</style>

<template>
  <div>
    <div v-if="kpis.length && kpis.length < 3">
      <button class="btn btn--ghost" @click="showAddKPIModal = true">{{ $t('kpi.add') }}</button>
    </div>
    <div class="empty">
      <empty-state
        v-if="!kpis.length"
        :icon="'lightbulb'"
        :heading="$t('empty.noKPIs.heading')"
        :body="$t('empty.noKPIs.body')"
      >
        <button class="btn btn--ter" @click="showAddKPIModal = true">{{ $t('kpi.add') }}</button>
      </empty-state>
    </div>
    <div v-if="kpis.length" class="kpis">
      <div v-for="kpi in kpis" :key="kpi.id" class="kpi" :class="{ 'kpi--error': !!kpi.error }">
        <div class="kpi__validation">
          <div v-if="kpi.error" class="kpi__error">
            <i class="fa fa-exclamation-triangle" />
            {{ showError(kpi.error) }}
          </div>
          <div v-if="kpi.valid" class="kpi__valid"><span class="fa fa-check-circle"></span> OK</div>
          <div v-if="!kpi.valid && !kpi.error" class="kpi__loading">
            <i class="fa fa-spinner fa-pulse" />
            {{ $t('general.loading') }}
          </div>
        </div>

        <validation-observer v-slot="{ handleSubmit }">
          <form :id="`kpi_${kpi.id}`" @submit.prevent="handleSubmit(save.bind(null, kpi))">
            <label class="form-group">
              <span class="form-label">Type</span>
              <input v-model="kpi.type" class="form__field" type="text" disabled="disabled" />
            </label>

            <form-component
              v-model="kpi.name"
              input-type="input"
              name="name"
              :label="$t('fields.name')"
              rules="required"
              type="text"
            />

            <label class="form-group">
              <span class="form-label">{{ $t('fields.description') }}</span>
              <textarea v-model="kpi.description" class="form__field" rows="4" />
            </label>

            <div class="toggle__container">
              <span class="toggle__label">
                {{ $t('kpi.api.radio') }}
                <i v-tooltip="$t('kpi.api.tooltip')" class="icon fa fa-info-circle" />
              </span>
              <label class="toggle">
                <input v-model="kpi.api" class="toggle__input" type="checkbox" />
                <span class="toggle__switch"></span>
              </label>
            </div>

            <template v-if="kpi.api">
              {{ $t('kpi.api.help') }}
            </template>

            <template v-if="!kpi.api">
              <h3 class="title-2">{{ $t('kpi.sheetsDetails') }}</h3>

              <form-component
                v-model="kpi.sheetId"
                input-type="input"
                name="sheetId"
                :label="$t('keyres.automation.googleSheetId')"
                rules="required"
                type="text"
              >
                <template #help>
                  <span class="form-help" v-html="$t('keyres.automation.googleSheetIdHelp')"></span>
                </template>
              </form-component>

              <form-component
                v-model="kpi.sheetName"
                input-type="input"
                name="sheetTab"
                :label="$t('keyres.automation.sheetsTab')"
                rules="required"
                type="text"
              >
                <template #help>
                  <span class="form-help" v-html="$t('keyres.automation.sheetsTabHelp')"></span>
                </template>
              </form-component>

              <form-component
                v-model="kpi.sheetCell"
                input-type="input"
                name="sheetCell"
                :label="$t('keyres.automation.sheetsCell')"
                rules="required"
                type="text"
              >
                <template #help>
                  <span class="form-help" v-html="$t('keyres.automation.sheetsCellHelp')"></span>
                </template>
              </form-component>
            </template>

            <label v-if="kpi.api" class="form-group">
              <span class="form-label">API</span>
              <span class="form-help">Push updates with curl</span>
              <input :value="apiCurl(kpi)" type="text" disabled class="form__field" />
            </label>

            <div class="button-row">
              <button class="btn btn--primary" :form="`kpi_${kpi.id}`">{{ $t('btn.saveChanges') }}</button>
              <button class="btn btn--danger" @click="deleteDeep(kpi)">{{ $t('btn.delete') }}</button>
            </div>
          </form>
        </validation-observer>
      </div>
    </div>

    <add-kpi-modal v-if="showAddKPIModal" @close="showAddKPIModal = false" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Kpi from '@/db/Kpi';

export default {
  name: 'ItemAdminKPIs',

  components: {
    AddKpiModal: () => import('@/components/AddKPIModal.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  data: () => ({
    showAddKPIModal: false,
  }),

  computed: {
    ...mapState(['kpis']),
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

    apiCurl: (kpi) => {
      return `curl -X POST -H "okr-team-secret: <YOUR SECRET>" -H "x-api-key: <YOUR API-KEY>" -H "Content-Type: application/json" -d '{ "progress": <VALUE> }'  ${process.env.VUE_APP_API_GATEWAY_URL}/kpi/${kpi.id}`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.kpis {
  display: grid;
  grid-gap: span(0, 1);
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  margin-top: 1.5rem;

  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(10));
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
  }
}

.empty {
  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(10));
    width: span(7, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
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

.kpi {
  max-width: 30rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);

  &--error {
    box-shadow: 0 0 2px 3px rgba($color-red, 0.4);
  }
}

.kpi__validation {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $color-grey-100;
}

.kpi__valid {
  padding: 0.5rem;
  background: $color-green;
  border-radius: 2px;
}

.kpi__loading {
  padding: 0.5rem;
  border-radius: 2px;
}

.kpi__error {
  padding: 0.5rem;
  background: $color-red;
  border-radius: 2px;
}
</style>

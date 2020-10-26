<template>
  <div>
    <div v-if="kpis.length && kpi.length < 3">
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
      <div class="kpi" v-for="kpi in kpis" :key="kpi.id">
        <validation-observer v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(save.bind(null, kpi))" :id="`kpi_${kpi.id}`">
            <label class="form-group">
              <span class="form-label">Type</span>
              <input class="form__field" type="text" v-model="kpi.type" disabled="disabled" />
            </label>

            <form-component
              input-type="input"
              name="name"
              :label="$t('fields.name')"
              rules="required"
              v-model="kpi.name"
              type="text"
            />

            <label class="form-group">
              <span class="form-label">{{ $t('fields.description') }}</span>
              <textarea class="form__field" v-model="kpi.description" rows="4"></textarea>
            </label>

            <h3 class="title-2">{{ $t('kpi.sheetsDetails') }}</h3>
            <div class="form-row">
              <form-component
                input-type="input"
                name="sheetId"
                :label="$t('keyres.automation.googleSheetId')"
                rules="required"
                v-model="kpi.sheetId"
                type="text"
              />

              <form-component
                input-type="input"
                name="sheetTab"
                :label="$t('keyres.automation.sheetsTab')"
                rules="required"
                v-model="kpi.sheetName"
                type="text"
              />

              <form-component
                input-type="input"
                name="sheetCell"
                :label="$t('keyres.automation.sheetsCell')"
                rules="required"
                v-model="kpi.sheetCell"
                type="text"
              />
            </div>

            <button class="btn btn--primary" :form="`kpi_${kpi.id}`">{{ $t('btn.saveChanges') }}</button>
            <button class="btn btn--danger" @click="deleteDeep(kpi.id)">{{ $t('btn.delete') }}</button>
          </form>
        </validation-observer>

        <div class="kpi__validation">
          <div v-if="kpi.error" class="kpi__error">
            <span class="fa fa-exclamation-triangle"></span> {{ kpi.error }}
          </div>
          <div v-if="kpi.valid" class="kpi__valid"><span class="fa fa-check-circle"></span> OK</div>
          <div v-if="!kpi.valid && !kpi.error" class="kpi__loading">
            <span class="fa fa-spinner fa-pulse"></span> {{ $t('general.loading') }}
          </div>
        </div>
      </div>
    </div>

    <add-kpi-modal v-if="showAddKPIModal" @close="showAddKPIModal = false"></add-kpi-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Kpi from '@/db/Kpi';

export default {
  data: () => ({
    showAddKPIModal: false,
  }),

  computed: {
    ...mapState(['kpis']),
  },

  components: {
    AddKpiModal: () => import('@/components/AddKPIModal.vue'),
    FormComponent: () => import('@/components/FormComponent.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  methods: {
    async save(kpi) {
      kpi.error = false;
      kpi.valid = false;
      delete kpi.parent;
      await Kpi.update(kpi.id, kpi);
    },
    async deleteDeep(id) {
      await Kpi.deleteDeep(id);
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
  margin: 0.5rem 0 1rem;

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
}

.kpi__valid {
  margin-top: 1rem;
  padding: 0.5rem;
  background: $color-green;
  border-radius: 2px;
}

.kpi__loading {
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 2px;
}

.kpi__error {
  margin-top: 1rem;
  padding: 0.5rem;
  background: $color-red;
  border-radius: 2px;
}
</style>

<template>
  <div>
    <div v-if="kpis.length < 3">
      <button class="btn btn--ghost" @click="showAddKPIModal = true">Add KPI</button>
    </div>
    <div v-if="kpis.length" class="kpis">
      <div class="kpi" v-for="kpi in kpis" :key="kpi.id">
        <form @submit.prevent="save(kpi)" :id="`kpi_${kpi.id}`">
          <label class="form-group">
            <span class="form-label">Type</span>
            <input class="form__field" type="text" v-model="kpi.type" disabled="disabled" />
          </label>
          <label class="form-group">
            <span class="form-label">Description</span>
            <textarea class="form__field" v-model="kpi.description" rows="4"></textarea>
          </label>
          <h3 class="title-2">Sheet details</h3>
          <div class="form-row">
            <label class="form-group">
              <span class="form-label">Id</span>
              <input class="form__field" type="text" v-model="kpi.sheetId" />
            </label>
            <label class="form-group">
              <span class="form-label">Name</span>
              <input class="form__field" type="text" v-model="kpi.sheetName" />
            </label>
            <label class="form-group">
              <span class="form-label">Cell</span>
              <input class="form__field" type="text" v-model="kpi.sheetCell" />
            </label>
          </div>

          <button class="btn btn--primary" :form="`kpi_${kpi.id}`">Save changes</button>
          <button class="btn btn--danger" @click="deleteDeep(kpi.id)">Delete</button>
        </form>

        <div class="kpi__validation">
          <div v-if="kpi.error" class="kpi__error">
            <span class="fa fa-exclamation-triangle"></span> {{ kpi.error }}
          </div>
          <div v-if="kpi.valid" class="kpi__valid"><span class="fa fa-check-circle"></span> OK</div>
          <div v-if="!kpi.valid && !kpi.error" class="kpi__loading">
            <span class="fa fa-spinner fa-pulse"></span> Loading
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

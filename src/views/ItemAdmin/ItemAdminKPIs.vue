<template>
  <div class="kpis">
    <div class="kpi" v-for="kpi in kpis" :key="kpi.id">
      <form @submit.prevent="save(kpi.id)">
        <label class="form-group">
          <span class="form-label">Name</span>
          <input class="form__field" type="text" v-model="kpi.name" />
        </label>
        <label class="form-group">
          <span class="form-label">Description</span>
          <textarea class="form__field" v-model="kpi.description" rows="4"></textarea>
        </label>
        <h3 class="title-2">Sheet details</h3>
        <div class="form-row">
          <label class="form-group">
            <span class="form-label">Id</span>
            <input class="form__field" type="text" v-model="kpi.sheet.id" />
          </label>
          <label class="form-group">
            <span class="form-label">Name</span>
            <input class="form__field" type="text" v-model="kpi.sheet.name" />
          </label>
          <label class="form-group">
            <span class="form-label">Cell</span>
            <input class="form__field" type="text" v-model="kpi.sheet.cell" />
          </label>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['kpis']),
  },

  methods: {
    save(id) {
      //
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
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);
}
</style>

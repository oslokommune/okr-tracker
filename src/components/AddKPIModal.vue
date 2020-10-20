<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">Add KPI</h2>
        <button class="btn btn--ter close" @click="close">
          <i class="fa fa-times" />
        </button>
      </div>
      <div class="modal__main">
        <form @submit.prevent="add">
          <label class="form-group">
            <span class="form-label">Choose KPI type</span>
            <select class="form__field" v-model="type">
              <option v-for="{ id, label } in availableTypes" :key="id" :value="id">{{ label }}</option>
            </select>
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
        </form>
      </div>
      <div class="modal__footer">
        <button @click="add" :disabled="loading" class="btn btn--sec">Add</button>
        <button @click="close" class="btn btn--ghost btn--space">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import Kpi from '@/db/Kpi';
import { mapState } from 'vuex';

export default {
  name: 'Modal',

  props: {},

  data: () => ({
    value: 0,
    loading: false,
    type: 'users',
    kpi: {
      description: 'null',
      sheetId: 'null',
      sheetName: 'null',
      sheetCell: 'null',
    },
    types: [
      { id: 'users', label: 'Brukere' },
      { id: 'satisfaction', label: 'Brukertilfredshet' },
      { id: 'conversion', label: 'Måloppnåelse' },
    ],
  }),

  computed: {
    ...mapState(['kpis', 'activeItem', 'activeItemRef']),

    availableTypes() {
      return this.types.filter(type => !this.kpis.map(({ type }) => type).includes(type.id));
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async add() {
      this.loading = true;

      const data = { ...this.kpi, type: this.type, parent: this.activeItemRef };

      try {
        await Kpi.create(data);
        this.close();
      } catch (error) {
        throw new Error(error);
      }

      this.loading = false;
    },
  },

  watch: {},
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

.modal__textarea {
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.modal__main--flex {
  display: flex;
  flex-direction: row;
}

.modal__main--input-value {
  width: 75px;
  border: 1px solid $color-purple !important;
}

.modal__main--input-label {
  margin-right: 1rem;
}

.modal__main--btn {
  align-self: flex-end;
  margin-bottom: 1.5rem;
}

.btn--space {
  margin-left: 1rem;
}

.close {
  height: 3rem;
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
</style>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">{{ $t('kpi.add') }}</h2>
        <button class="btn btn--ter close" @click="close">
          <i class="fa fa-times" />
        </button>
      </div>
      <div class="modal__main">
        <validation-observer v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(add)" id="addKpi">
            <validation-provider rules="required" name="type" v-slot="{ errors }">
              <label class="form-group">
                <span class="form-label">{{ $t('kpi.chooseType') }}</span>
                <select class="form__field" v-model="type">
                  <option v-for="{ id, label } in availableTypes" :key="id" :value="id">{{ label }}</option>
                </select>
                <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
              </label>
            </validation-provider>

            <form-component
              input-type="input"
              name="sheetCell"
              label="Name"
              rules="required"
              v-model="kpi.name"
              type="text"
            />

            <label class="form-group">
              <span class="form-label">{{ $t('kpi.description') }}</span>
              <textarea class="form__field" v-model="kpi.description" rows="4"></textarea>
            </label>
            <h3 class="title-2">Sheet details</h3>
            <div class="form-row">
              <form-component
                input-type="input"
                name="sheetId"
                label="Id"
                rules="required"
                v-model="kpi.sheetId"
                type="text"
              />
              <form-component
                input-type="input"
                name="sheetTab"
                label="Name"
                rules="required"
                v-model="kpi.sheetName"
                type="text"
              />
              <form-component
                input-type="input"
                name="sheetCell"
                label="Cell"
                rules="required"
                v-model="kpi.sheetCell"
                type="text"
              />
            </div>
          </form>
        </validation-observer>
      </div>
      <div class="modal__footer">
        <button form="addKpi" :disabled="loading" class="btn btn--sec">{{ $t('btn.add') }}</button>
        <button @click="close" class="btn btn--ghost btn--space">{{ $t('btn.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Kpi from '@/db/Kpi';
import { mapState } from 'vuex';

export default {
  name: 'Modal',

  components: {
    FormComponent: () => import('@/components/FormComponent.vue'),
  },

  data: () => ({
    value: 0,
    loading: false,
    type: null,
    kpi: {
      name: '',
      description: '',
      sheetId: '',
      sheetName: 'Sheet1',
      sheetCell: 'A1',
    },
    types: [
      { id: 'users', label: this.$t('kpi.types.users') },
      { id: 'satisfaction', label: this.$t('kpi.types.satisfaction') },
      { id: 'conversion', label: this.$t('kpi.types.conversion') },
    ],
  }),

  computed: {
    ...mapState(['kpis', 'activeItem', 'activeItemRef']),

    availableTypes() {
      return this.types.filter(type => !this.kpis.map(kpi => kpi.type).includes(type.id));
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

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
          <form id="addKpi" @submit.prevent="handleSubmit(add)">
            <validation-provider v-slot="{ errors }" rules="required" name="kpitype">
              <label class="form-group">
                <span class="form-label">{{ $t('kpi.chooseType') }}</span>
                <select v-model="type" class="form__field">
                  <option v-for="{ id, label } in availableTypes" :key="id" :value="id">{{ label }}</option>
                </select>
                <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
              </label>
            </validation-provider>

            <form-component
              v-model="kpi.name"
              input-type="input"
              name="name"
              :label="$t('fields.name')"
              rules="required"
              type="text"
            />

            <label class="form-group">
              <span class="form-label">{{ $t('kpi.description') }}</span>
              <textarea v-model="kpi.description" class="form__field" rows="4"></textarea>
            </label>
            <h3 class="title-2">{{ $t('kpi.sheetsDetails') }}</h3>

            <div class="sheets-info">
              <i class="sheets-info__icon fa fa-info-circle"></i>
              <div>
                {{ $t('sheet.infoText') }} <br />
                <strong>{{ serviceAccountAddress }}</strong>
              </div>
            </div>

            <div class="form-row">
              <form-component
                v-model="kpi.sheetId"
                input-type="input"
                name="sheetId"
                :label="$t('fields.sheetId')"
                rules="required"
                type="text"
              />
              <form-component
                v-model="kpi.sheetName"
                input-type="input"
                name="sheetTab"
                :label="$t('fields.sheetTab')"
                rules="required"
                type="text"
              />
              <form-component
                v-model="kpi.sheetCell"
                input-type="input"
                name="sheetCell"
                :label="$t('fields.sheetCell')"
                rules="required"
                type="text"
              />
            </div>
          </form>
        </validation-observer>
      </div>
      <div class="modal__footer">
        <button form="addKpi" :disabled="loading" class="btn btn--sec">{{ $t('btn.add') }}</button>
        <button class="btn btn--ghost btn--space" @click="close">{{ $t('btn.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import Kpi from '@/db/Kpi';
import { mapState } from 'vuex';

export default {
  name: 'AddKPIModal',

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
  }),

  computed: {
    ...mapState(['kpis', 'activeItem', 'activeItemRef']),

    serviceAccountAddress() {
      return process.env.VUE_APP_SHEETS_SERVICE_ACCOUNT || this.$t('sheet.missingServiceAccount');
    },

    types() {
      return [
        { id: 'users', label: this.$t('kpi.types.users') },
        { id: 'satisfaction', label: this.$t('kpi.types.satisfaction') },
        { id: 'conversion', label: this.$t('kpi.types.conversion') },
      ];
    },

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
        this.$toasted.show(this.$t('toaster.add.kpi'));
        this.close();
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.kpi'));
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

.sheets-info {
  display: flex;
  padding: 1rem;
  font-size: 0.9rem;
  background: rgba($color-yellow, 0.2);
  border-radius: 3px;
}

.sheets-info__icon {
  margin-top: 0.2rem;
  margin-right: 0.5rem;
}

strong {
  font-weight: 500;
}
</style>

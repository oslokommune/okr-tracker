<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">{{ $t('kpi.add') }}</h2>
        <button class="btn btn--ter btn--close btn--icon" @click="close">
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
                :label="$t('fields.sheetId')"
                rules="required"
                type="text"
              >
                <template #help>
                  <span class="form-help" v-html="$t('keyResult.automation.googleSheetIdHelp')"></span>
                </template>
              </form-component>

              <form-component
                v-model="kpi.sheetName"
                input-type="input"
                name="sheetTab"
                :label="$t('fields.sheetTab')"
                rules="required"
                type="text"
              >
                <template #help>
                  <span class="form-help" v-html="$t('keyResult.automation.sheetsTabHelp')"></span>
                </template>
              </form-component>

              <form-component
                v-model="kpi.sheetCell"
                input-type="input"
                name="sheetCell"
                :label="$t('fields.sheetCell')"
                rules="required"
                type="text"
              >
                <template #help>
                  <span class="form-help" v-html="$t('keyResult.automation.sheetsCellHelp')"></span>
                </template>
              </form-component>
            </template>
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
import { mapState } from 'vuex';
import Kpi from '@/db/Kpi';

export default {
  name: 'AddKPIModal',

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
      api: false,
    },
  }),

  computed: {
    ...mapState(['kpis', 'activeItem', 'activeItemRef']),

    serviceAccountAddress() {
      return import.meta.env.VITE_SHEETS_SERVICE_ACCOUNT || this.$t('sheet.missingServiceAccount');
    },

    types() {
      return [
        { id: 'users', label: this.$t('kpi.types.users') },
        { id: 'satisfaction', label: this.$t('kpi.types.satisfaction') },
        { id: 'conversion', label: this.$t('kpi.types.conversion') },
      ];
    },

    availableTypes() {
      return this.types.filter((type) => !this.kpis.map((kpi) => kpi.type).includes(type.id));
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
.modal__textarea {
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.modal__main--flex {
  display: flex;
  flex-direction: row;
}

.modal__main--input-value {
  width: 75px;
  border: 1px solid var(--color-primary) !important;
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

.btn--close {
  height: 3rem;
}
</style>

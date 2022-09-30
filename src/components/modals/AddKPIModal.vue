<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t('kpi.add') }}
    </template>

    <validation-observer v-slot="{ handleSubmit }">
      <form id="addKpi" @submit.prevent="handleSubmit(add)">
        <form-component
          v-model="kpi.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
          :has-primary-background="true"
        />

        <label class="form-group">
          <span class="form-label form-label--hasPrimaryBackground">
            {{ $t('kpi.description') }}
          </span>
          <textarea
            v-model="kpi.description"
            class="form__field"
            rows="4"
          />
        </label>

        <validation-provider v-slot="{ errors }" rules="required" name="format">
          <label class="form-group">
            <span class="form-label form-label--hasPrimaryBackground">
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

        <div class="toggle__container">
          <span class="toggle__label">
            {{ $t('kpi.api.radio') }}
            <i
              v-tooltip="$t('kpi.api.tooltip')"
              class="icon fa fa-info-circle"
            />
          </span>
          <label class="toggle">
            <input
              v-model="kpi.api"
              class="toggle__input"
              type="checkbox"
            />
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
            :has-primary-background="true"
          >
            <template #help>
              <span
                class="form-help form-help--hasPrimaryBackground"
                v-html="$t('keyResult.automation.googleSheetIdHelp')"
              />
            </template>
          </form-component>

          <form-component
            v-model="kpi.sheetName"
            input-type="input"
            name="sheetTab"
            :label="$t('fields.sheetTab')"
            rules="required"
            type="text"
            :has-primary-background="true"
          >
            <template #help>
              <span
                class="form-help form-help--hasPrimaryBackground"
                v-html="$t('keyResult.automation.sheetsTabHelp')"
              />
            </template>
          </form-component>

          <form-component
            v-model="kpi.sheetCell"
            input-type="input"
            name="sheetCell"
            :label="$t('fields.sheetCell')"
            rules="required"
            type="text"
            :has-primary-background="true"
          >
            <template #help>
              <span
                class="form-help form-help--hasPrimaryBackground"
                v-html="$t('keyResult.automation.sheetsCellHelp')"
              />
            </template>
          </form-component>
        </template>
      </form>
    </validation-observer>

    <template #footer>
      <button
        form="addKpi"
        :disabled="loading"
        class="btn btn--ghost btn--negative btn--sec"
      >
        {{ $t('btn.add') }}
      </button>
      <button class="btn btn--ghost btn--negative btn--space" @click="close">
        {{ $t('btn.close') }}
      </button>
    </template>
  </modal-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import { kpiFormats } from '@/util/kpiHelpers';
import Kpi from '@/db/Kpi';
import ModalWrapper from './ModalWrapper.vue';

export default {
  name: 'AddKPIModal',

  components: {
    ModalWrapper,
  },

  data: () => ({
    value: 0,
    loading: false,
    formats: kpiFormats(),
    kpi: {
      name: '',
      description: '',
      format: null,
      sheetId: '',
      sheetName: 'Sheet1',
      sheetCell: 'A1',
      api: false,
    },
  }),

  computed: {
    ...mapState(['kpis', 'activeItemRef']),

    serviceAccountAddress() {
      return (
        import.meta.env.VITE_SHEETS_SERVICE_ACCOUNT ||
        this.$t('sheet.missingServiceAccount')
      );
    },
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async add() {
      this.loading = true;

      const data = { ...this.kpi, parent: this.activeItemRef };

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
.toggle__label {
  color: var(--color-text-secondary);
}

.btn--space {
  margin-left: 1rem;
}
</style>

<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">Oppdater verdi for nøkkelresultatet</h2>
        <button class="btn btn--ter" @click="close">
          <i class="fa fa-times" />
        </button>
      </div>
      <div class="modal__main">
        <h3 class="title-3">{{ keyres.name }}</h3>

        <hr />

        <div>
          <label>
            <span class="title-3">Legg ved kommentarer (valgfritt)</span>
            <textarea class="modal__textarea" rows="3" v-model="note"></textarea>
          </label>
        </div>

        <div class="modal__main--flex">
          <label class="form-group modal__main--input-label">
            <span class="form-label">Ny verdi:</span>
            <input class="form__field modal__main--input-value" type="number" v-model="value" />
          </label>
          <label class="form-group modal__main--input-label">
            <span class="form-label">Dato og tid:</span>
            <flat-pickr
              v-model="date"
              :config="flatPickerConfig"
              class="form-control"
              name="date"
              placeholder="Velg dato"
            ></flat-pickr>
          </label>
          <button class="btn btn--ter modal__main--btn" @click.prevent="date = new Date()">
            {{ $t('keyResultPage.add.today') }}
          </button>
        </div>
      </div>
      <div class="modal__footer">
        <button @click="saveProgress" class="btn btn--sec">Lagre</button>
        <button @click="close" class="btn btn--ghost btn--space">Avbryt</button>
      </div>
    </div>
  </div>
</template>

<script>
import flatPickr from 'vue-flatpickr-component';
import locale from 'flatpickr/dist/l10n/no';
import 'flatpickr/dist/flatpickr.css';
import Progress from '@/db/Progress';

export default {
  name: 'Modal',

  props: {
    keyres: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    flatPickerConfig: {
      altInput: true,
      altFormat: 'd.m.Y H:i',
      minDate: null,
      maxDate: null,
      dateFormat: 'Z',
      time_24hr: true,
      enableTime: true,
      locale: locale.no,
    },
    date: null,
    note: '',
    value: 0,
  }),

  components: {
    flatPickr,
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async saveProgress() {
      await Progress.create(this.keyres.id, {
        value: +this.value,
        comment: this.note,
        timestamp: new Date(this.date),
      });
      this.$emit('close');
    },
  },

  watch: {
    keyres: {
      immediate: true,
      async handler() {
        this.value = this.keyres.currentValue || this.keyres.startValue || 0;
      },
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
</style>

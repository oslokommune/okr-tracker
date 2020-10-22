<template>
  <div class="overlay">
    <div class="modal">
      <div class="modal__header">
        <h2 class="title-2">{{ $t('keyres.updateKeyres') }}</h2>
        <button class="btn btn--ter" @click="close">
          <i class="fa fa-times" />
        </button>
      </div>
      <validation-observer v-slot="{ handleSubmit }">
        <form id="modal" class="modal__main" @submit.prevent="handleSubmit(saveProgress)">
          <h3 class="title-3">{{ keyres.name }}</h3>

          <hr />

          <label>
            <span class="title-3">{{ $t('keyres.addComment') }}</span>
            <textarea class="modal__textarea" rows="3" v-model="note"></textarea>
          </label>

          <div class="modal__main--flex">
            <validation-provider name="value" rules="required" v-slot="{ errors }">
              <label class="form-group modal__main--input-label">
                <span class="form-label">{{ $t('keyres.newValue') }}</span>
                <input class="form__field modal__main--input-value" type="number" v-model="value" />
                <span class="form-field--error">{{ errors[0] }}</span>
              </label>
            </validation-provider>

            <validation-provider name="range" rules="required" v-slot="{ errors }">
              <label class="form-group modal__main--input-label">
                <span class="form-label">{{ $t('keyres.dateAndTime') }}</span>
                <flat-pickr
                  v-model="date"
                  :config="flatPickerConfig"
                  class="form-control"
                  name="date"
                  :placeholder="$t('keyres.chooseDate')"
                ></flat-pickr>
                <span class="form-field--error">{{ errors[0] }}</span>
              </label>
            </validation-provider>

            <button class="btn btn--ter modal__main--btn" @click.prevent="date = new Date()">
              {{ $t('keyResultPage.add.today') }}
            </button>
          </div>
        </form>
      </validation-observer>
      <div class="modal__footer">
        <button form="modal" :disabled="loading" class="btn btn--sec">{{ $t('btn.save') }}</button>
        <button @click="close" class="btn btn--ghost btn--space">{{ $t('btn.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
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
    loading: false,
  }),

  methods: {
    close() {
      this.$emit('close');
    },

    async saveProgress() {
      this.loading = true;
      await Progress.create(this.keyres.id, {
        value: +this.value,
        comment: this.note,
        timestamp: new Date(this.date),
      });
      this.loading = false;
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

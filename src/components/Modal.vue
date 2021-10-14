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

          <progress-bar-expanded :key-result="keyres" />

          <hr />

          <label>
            <span class="title-3">{{ $t('keyres.addComment') }}</span>
            <textarea v-model="note" class="modal__textarea" rows="3" @input="edit"/>
          </label>

          <div class="modal__main--flex">
            <validation-provider v-slot="{ errors }" name="value" rules="required">
              <label class="form-group modal__main--input-label">
                <span class="form-label">{{ $t('keyres.newValue') }}</span>
                <input v-model="value" class="form__field modal__main--input-value" type="number" step="any" @input="edit"/>
                <span class="form-field--error">{{ errors[0] }}</span>
              </label>
            </validation-provider>

            <validation-provider v-slot="{ errors }" name="range" rules="required">
              <label class="form-group modal__main--input-label">
                <span class="form-label">{{ $t('keyres.dateAndTime') }}</span>
                <flat-pickr
                  v-model="date"
                  :config="flatPickerConfig"
                  class="form-control"
                  name="date"
                  :placeholder="$t('keyres.chooseDate')"
                  @input="edit"
                />
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
        <button form="modal" :disabled="loading || (!changes && !unsavedValues)" class="btn btn--pri">{{ $t('btn.save') }}</button>
        <button class="btn btn--ghost btn--space" @click="close">{{ $t('btn.close') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import locale from 'flatpickr/dist/l10n/no';
import Progress from '@/db/Progress';

export default {
  name: 'Modal',

  components: {
    ProgressBarExpanded: () => import('@/components/ProgressBarExpanded.vue'),
  },

  props: {
    keyres: {
      type: Object,
      required: true,
    },
    unsavedValues: {
      type: Boolean,
      required: false
    }
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
    date: new Date(),
    note: '',
    value: 0,
    loading: false,
    changes: false
  }),

  watch: {
    keyres: {
      immediate: true,
      async handler() {
        this.value = this.keyres.currentValue || this.keyres.startValue || 0;
      },
    },
  },

  methods: {
    edit() {
      this.changes = true;
    },

    close() {
      this.$emit('close');
    },

    async saveProgress() {
      this.loading = true;
      try {
        await Progress.create(this.keyres.id, {
          value: +this.value,
          comment: this.note,
          timestamp: new Date(this.date),
        });
        this.$toasted.show(this.$t('toaster.add.progression'));
      } catch (e) {
        this.$toasted.error(this.$t('toaster.error.progression'));
      }
      this.loading = false;
      this.changes = false;
      this.$emit('close');
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
</style>

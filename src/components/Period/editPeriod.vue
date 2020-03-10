<template>
  <div class="edit-objective" :class="{ loading }" v-if="period">
    <h3 class="title-3">Endre periode</h3>
    <hr />
    <label class="form-field">
      <span class="form-label">Navn på periode</span>
      <div class="form-help">F.eks. Q1 2021 / Vår 2021</div>
      <input @input="dirty = true" type="text" v-model.trim="period.name" maxlength="12" />
    </label>

    <label class="form-field">
      <span class="form-label">Startdato</span>
      <flat-pickr
        v-model="range"
        :config="flatPickerConfig"
        class="form-control"
        name="date"
        placeholder="Velg start- og sluttdato"
      ></flat-pickr>
    </label>

    <hr />
    <button class="btn" :disabled="!dirty" @click="update">
      Lagre endringer
    </button>
    <button class="btn btn--danger" @click="deletePeriod">Slett periode</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import flatPickr from 'vue-flatpickr-component';
import locale from 'flatpickr/dist/l10n/no';
import endOfDay from 'date-fns/endOfDay';
import format from 'date-fns/format';
import * as Toast from '@/util/toasts';
import 'flatpickr/dist/flatpickr.css';

export default {
  name: 'EditPeriod',

  props: {
    period: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    submit: false,
    showInfo: false,
    info: '',
    loading: false,
    dirty: false,
    startDate: null,
    endDate: null,
    flatPickerConfig: {
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    range: null,
  }),

  computed: {
    ...mapState(['user']),
  },

  components: {
    flatPickr,
  },

  mounted() {
    this.range = this.generateRange();
  },

  watch: {
    period() {
      this.range = this.generateRange();
    },

    range(range) {
      if (!range) return;
      const parts = this.range.split(' til ').map(d => new Date(d));
      if (parts.length === 1) return;

      this.dirty = true;

      const [startDate, endDate] = parts;

      this.startDate = startDate;
      this.endDate = endOfDay(endDate);
    },
  },

  methods: {
    update() {
      const { name } = this.period;

      if (!this.range) {
        Toast.show('Ugyldig dato');
        return;
      }

      const [startDate, endDate] = this.range.split(' til ').map(d => new Date(d));

      if (!startDate || !endDate) {
        Toast.show('Ugyldig dato');
        return;
      }

      if (!name.length) {
        Toast.show('Ugyldig navn');
      }

      this.period.ref
        .update({ edited: new Date(), editedBy: this.user.ref, startDate, endDate, name })
        .then(() => {
          this.dirty = false;
          Toast.savedChanges();
        })
        .catch(error => {
          this.objective.edited = false;
          this.$errorHandler('update_period_error', error);
        });
    },

    async deletePeriod() {
      const hasLinkedObjectives = await this.period.ref.parent.parent
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', this.period.ref)
        .get()
        .then(snapshot => !snapshot.empty);

      if (hasLinkedObjectives) {
        Toast.show('Kan ikke slette periode som har tilknyttet mål');
        return;
      }

      this.period.ref.delete().then(() => {
        this.$emit('deletedPeriod');
      });
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },

    generateRange() {
      if (!this.period.startDate || !this.period.endDate) return;
      const startDate = format(this.period.startDate.toDate(), 'yyyy-MM-dd');
      const endDate = format(this.period.endDate.toDate(), 'yyyy-MM-dd');
      return `${startDate} til ${endDate}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.edit-objective {
  width: 100%;
  margin-top: -1.5rem;
}

.item {
  &__footer {
    display: flex;
    justify-content: space-between;
    margin-top: 3rem;
  }

  &.loading {
    transform: scale(0.9);
    opacity: 0.5;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

<template>
  <div class="popout">
    <span class="form-label">{{ $t('objective.period') }}</span>
    <v-select
      class="form-field"
      :class="{ 'form-field--error': $v.selectedPeriod.$error }"
      label="name"
      :options="availablePeriods"
      v-model="$v.selectedPeriod.$model"
    ></v-select>
    <div class="form-field--error" v-if="$v.selectedPeriod.$error">{{ $t('validations.empty') }}</div>

    <div class="title title-3">
      <i :class="`fas fa-${icon}`"></i>
    </div>
    <span class="form-label">{{ $t('objective.icon') }}</span>
    <v-select class="form-field" :options="icons" v-model="icon" v-tooltip.bottom="$t('tooltip.icon')">
      <template v-slot:option="option">
        <i :class="`fas fa-fw fa-${option.label}`"></i>&nbsp;
        <span>{{ option.label }}</span>
      </template>
    </v-select>

    <label class="form-field" :class="{ 'form-field--error': $v.title.$error }">
      <span class="form-label">{{ $t('objective.title') }}</span>
      <input type="text" v-model="$v.title.$model" maxlength="160" />
    </label>
    <div class="form-field--error" v-if="$v.title.$error">{{ $t('validations.empty') }}</div>
    <label class="form-field" :class="{ 'form-field--error': $v.body.$error }">
      <span class="form-label">{{ $t('objective.description') }}</span>
      <textarea v-model="$v.body.$model" rows="4" maxlength="320"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.body.$error">{{ $t('validations.empty') }}</div>
    <button :disabled="submit" class="btn" @click="submitForm">{{ $t('validations.add') }}</button>
    <button class="btn btn--borderless" @click="$emit('close-menu')">{{ $t('validations.close') }}</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';
import { serializeList } from '@/db/db';

export default {
  name: 'AddObjective',

  data: () => ({
    title: '',
    icon: 'trophy',
    body: '',
    submit: false,
    showInfo: false,
    info: '',
    selectedPeriod: null,
    availablePeriods: [],
  }),

  props: {
    productref: {
      type: Object,
      required: true,
    },
  },

  validations: {
    title: {
      required,
    },
    selectedPeriod: {
      required,
    },
    body: {
      required,
    },
  },

  computed: {
    ...mapState(['user', 'icons']),

    newObjective() {
      return {
        name: this.title,
        description: this.body,
        icon: this.icon || 'trophy',
        period: this.selectedPeriod.ref,
        progression: 0,
        archived: false,
        created: new Date(),
        createdBy: this.user.ref,
      };
    },
  },

  created() {
    this.getAvailablePeriods();
  },

  methods: {
    async getAvailablePeriods() {
      this.availablePeriods = await this.productref
        .collection('periods')
        .get()
        .then(serializeList);
    },

    async submitForm() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, this.$i18n.t('validations.required'));
      } else {
        if ((await this.getObjectiveCount()) >= 4) {
          Toast.show('Kan ikke ha flere enn 4 mål');
          this.$emit('close-menu');
          return;
        }
        this.setSubmitInfo(true, false, '');
        this.addObjective();
      }
    },

    addObjective() {
      this.productref
        .collection('objectives')
        .add(this.newObjective)
        .then(response => {
          this.$emit('close-menu');
          Audit.createObjective(response, response.parent.parent);
          Toast.addedObjective(this.selectedPeriod.name);
        })
        .catch(err => {
          this.$errorHandler('add_objective_error', err);
        });
    },

    getObjectiveCount() {
      return this.productref
        .collection('objectives')
        .where('archived', '==', false)
        .where('period', '==', this.selectedPeriod.ref)
        .get()
        .then(snapshot => snapshot.size);
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },
  },
};
</script>

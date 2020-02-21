<template>
  <div class="popout">
    <span class="form-label">{{ $t('objective.quarter') }}</span>
    <v-select
      class="form-field"
      :class="{ 'form-field--error': $v.quarter.$error }"
      label="name"
      :options="quarters"
      v-model="quarter"
    ></v-select>
    <div class="form-field--error" v-if="$v.quarter.$error">{{ $t('validations.empty') }}</div>

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
      <input type="text" v-model="$v.title.$model" />
    </label>
    <div class="form-field--error" v-if="$v.title.$error">{{ $t('validations.empty') }}</div>
    <label class="form-field" :class="{ 'form-field--error': $v.body.$error }">
      <span class="form-label">{{ $t('objective.description') }}</span>
      <textarea v-model="$v.body.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.body.$error">{{ $t('validations.empty') }}</div>
    <button :disabled="submit" class="btn" @click="send">{{ $t('validations.add') }}</button>
    <button class="btn btn--borderless" @click="$emit('close-menu')">{{ $t('validations.close') }}</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import * as Toast from '@/util/toasts';
import Audit from '@/db/audit';

export default {
  name: 'AddObjective',

  data: () => ({
    title: '',
    icon: 'trophy',
    body: '',
    submit: false,
    showInfo: false,
    info: '',
    quarter: null,
  }),

  props: {
    productref: {
      type: Object,
      required: true,
    },
    selectedQuarter: {
      type: Object,
      required: false,
      default: null,
    },
  },

  validations: {
    title: {
      required,
    },
    quarter: {
      required,
    },
    body: {
      required,
    },
  },

  mounted() {
    const [firstQuarter] = this.quarters;
    this.quarter = firstQuarter;
  },

  computed: {
    ...mapState(['user', 'quarters', 'icons']),

    newObjective() {
      return {
        name: this.title,
        description: this.body,
        icon: this.icon || 'trophy',
        quarter: this.quarter.name,
        archived: false,
        created: new Date(),
        createdBy: this.user.ref,
      };
    },
  },

  methods: {
    setSelectedQuarter(value) {
      this.$v.quarter.$touch();
      this.quarter = value;
    },

    async send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, this.$i18n.t('validations.required'));
      } else {
        const objectiveCount = await this.productref
          .collection('objectives')
          .where('quarter', '==', this.newObjective.quarter)
          .get()
          .then(snapshot => snapshot.docs.map(doc => doc.data()).filter(doc => !doc.archived).length);

        if (objectiveCount >= 4) {
          Toast.show('Kan ikke ha flere enn 4 mål');
          this.$emit('close-menu');
          return;
        }

        this.setSubmitInfo(true, false, '');

        this.productref
          .collection('objectives')
          .add(this.newObjective)
          .then(response => {
            this.$emit('close-menu');
            Audit.createObjective(response, response.parent.parent);
            Toast.addedObjective(this.quarter.name);
          })
          .catch(err => {
            this.$errorHandler('add_objective_error', err);
          });
      }
    },

    setSubmitInfo(submit, showInfo, info) {
      this.submit = submit;
      this.showInfo = showInfo;
      this.info = info;
    },
  },
};
</script>

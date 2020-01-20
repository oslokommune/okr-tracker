<template>
  <div class="popout">
    <span class="form-label">Kvartal</span>
    <v-select
      class="form-field"
      :class="{ 'form-field--error': $v.quarter.$error }"
      label="name"
      :options="quarters"
      v-model="quarter"
    ></v-select>
    <div class="form-field--error" v-if="$v.quarter.$error">Kan ikke være tom</div>

    <div class="title title-3">
      <i :class="`fas fa-${icon}`"></i>
    </div>
    <span class="form-label">Ikon</span>
    <v-select class="form-field" :options="icons" v-model="icon">
      <template v-slot:option="option">
        <i :class="`fas fa-fw fa-${option.label}`"></i>&nbsp;
        <span>{{ option.label }}</span>
      </template>
    </v-select>

    <label class="form-field" :class="{ 'form-field--error': $v.title.$error }">
      <span class="form-label">Tittel</span>
      <input type="text" v-model="$v.title.$model" />
    </label>
    <div class="form-field--error" v-if="$v.title.$error">Kan ikke være tom</div>
    <label class="form-field" :class="{ 'form-field--error': $v.body.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea v-model="$v.body.$model" rows="4"></textarea>
    </label>
    <div class="form-field--error" v-if="$v.body.$error">Kan ikke være tom</div>
    <button :disabled="submit" class="btn" @click="send">Legg til</button>
    <button class="btn" @click="$emit('close-menu')">Lukk</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import * as Toast from '@/util/toasts';

export default {
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
        objective_title: this.title,
        objective_body: this.body,
        icon: this.icon || 'trophy',
        quarter: this.quarter.name,
        archived: false,
        created: new Date(),
        created_by: this.user.ref,
      };
    },
  },

  methods: {
    setSelectedQuarter(value) {
      this.$v.quarter.$touch();
      this.quarter = value;
    },

    send() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.setSubmitInfo(false, true, 'Nødvendige felt kan ikke være tomme');
      } else {
        this.setSubmitInfo(true, false, '');

        this.productref
          .collection('objectives')
          .add(this.newObjective)
          .then(() => {
            this.$emit('close-menu');
            Toast.addedObjective(this.quarter.name);
          })
          .catch(Toast.error);
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

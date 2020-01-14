<template>
  <div class="popout">
    <span class="form-label">Kvartal</span>
    <v-select
      class="form-group"
      :class="{ 'form-group--error': $v.quarter.$error }"
      label="name"
      :options="quarters"
      v-model="selectedQuarter"
    ></v-select>
    <div class="form-group--error" v-if="$v.quarter.$error">Kan ikke være tom</div>

    <div class="title title-3">
      <i :class="`fas fa-${icon}`"></i>
    </div>
    <span class="form-label">Ikon</span>
    <v-select class="form-group" :options="icons" v-model="icon">
      <template v-slot:option="option">
        <i :class="`fas fa-fw fa-${option.label}`"></i>&nbsp;
        <span>{{ option.label }}</span>
      </template>
    </v-select>

    <label class="form-group" :class="{ 'form-group--error': $v.title.$error }">
      <span class="form-label">Tittel</span>
      <input type="text" v-model="$v.title.$model" />
    </label>
    <div class="form-group--error" v-if="$v.title.$error">Kan ikke være tom</div>
    <label class="form-group" :class="{ 'form-group--error': $v.body.$error }">
      <span class="form-label">Beskrivelse</span>
      <textarea v-model="$v.body.$model" rows="4"></textarea>
    </label>
    <div class="form-group--error" v-if="$v.body.$error">Kan ikke være tom</div>
    <button :disabled="submit" class="btn" @click="send">Legg til</button>
    <button class="btn" @click="$emit('close-menu', false)">Lukk</button>
    <p v-if="showInfo">{{ info }}</p>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';

export default {
  data: () => ({
    title: '',
    icon: 'trophy',
    body: '',
    submit: false,
    showInfo: false,
    info: '',
  }),

  props: {
    productref: {
      type: Object,
      required: true,
    },
    selectedQuarter: {
      type: Object,
      required: true,
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
    ...mapState(['quarters', 'icons']),

    newObjective() {
      return {
        objective_title: this.title,
        objective_body: this.body,
        icon: this.icon || 'trophy',
        quarter: this.quarter.name,
        archived: false,
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

<template>
  <div class="add">
    <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt mål</button>

    <div v-if="expand" class="popout">
      <span class="form-label">Kvartal</span>
      <v-select class="form-group" v-model="quarter" :options="availableQuarters"></v-select>
      <label class="form-group">
        <span class="form-label">Tittel</span>
        <input type="text" v-model="title" />
      </label>
      <label class="form-group">
        <span class="form-label">Beskrivelse</span>
        <textarea v-model="body" rows="4"></textarea>
      </label>
      <button class="btn" @click="send">Legg til</button>
      <button class="btn" @click="expand = false">Lukk</button>
    </div>
  </div>
</template>

<script>
import { addQuarters, getYear, getQuarter } from 'date-fns';
import uniqid from 'uniqid';
import { mapActions, mapGetters, mapState } from 'vuex';

export default {
  data: () => ({
    expand: false,
    title: '',
    quarter: '',
    body: '',
  }),

  props: {
    productId: {
      type: String,
      required: true,
    },
  },

  updated() {
    this.quarter = this.chosenQuarter;
  },

  computed: {
    ...mapGetters(['products']),
    ...mapState(['chosenQuarter']),

    newObjective() {
      return {
        id: uniqid(),
        objective_title: this.title,
        objective_body: this.body,
        quarter: this.quarter,
        product_id: this.productId,
      };
    },

    availableQuarters() {
      let from = new Date(2019, 1, 1);
      const to = new Date();
      let quarters = [];
      // TODO: write less shit code
      while (to > from) {
        const year = getYear(from);
        const quarter = getQuarter(from);

        quarters.push(`${year} Q${quarter}`);
        from = addQuarters(from, 1);
      }

      quarters.push(`${getYear(from)} Q${getQuarter(from)}`);
      from = addQuarters(from, 1);
      quarters.push(`${getYear(from)} Q${getQuarter(from)}`);

      return quarters;
    },
  },

  methods: {
    ...mapActions(['addObjective', 'addObject']),
    send() {
      this.addObjective(this.newObjective)
        .then(() => {
          this.addObject({
            key: 'Objectives',
            data: this.newObjective,
          });
        })
        .then(() => {
          this.expand = false;
          this.title = '';
          this.body = '';
          this.quarter = '';
        })
        .catch(e => {
          throw new Error(e);
        });
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../styles/colors';

.add {
  position: relative;

  margin: 2rem 0;
}
</style>

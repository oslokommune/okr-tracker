<template>
  <div class="add">
    <button class="btn btn--ghost" @click="expand = true" :disabled="expand">+ Legg til nytt mål</button>

    <div v-if="expand" class="popout">
      <label class="form-group">
        <span class="form-label">Kvartal</span>
        <input type="text" v-model="quarter" />
      </label>
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
import uniqid from 'uniqid';
import { mapActions, mapGetters } from 'vuex';

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

  computed: {
    ...mapGetters(['products']),

    newObjective() {
      return {
        id: uniqid(),
        objective_title: this.title,
        objective_body: this.body,
        quarter: this.quarter,
        product_id: this.productId,
      };
    },
  },

  methods: {
    ...mapActions(['addObjective']),
    send() {
      this.addObjective(this.newObjective)
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

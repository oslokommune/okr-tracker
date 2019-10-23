<template>
  <div class="add">
    <button class="btn" @click="expand = true" :disabled="expand">Legg til nytt mål</button>

    <div v-if="expand" class="popout">
      <ul>
        <li>
          <label>
            <span>Tittel</span><br />
            <input type="text" v-model="title" />
          </label>
        </li>
        <li>
          <label>
            <span>Beskrivelse</span><br />
            <textarea v-model="body"></textarea>
          </label>
        </li>
      </ul>
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
        product_id: this.product_id,
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

.popout {
  position: absolute;
  bottom: 0.5rem;
  left: -2rem;

  width: 100%;
  max-width: 500px;

  margin-bottom: 3rem;

  padding: 2rem;

  background: #fafafa;
  border: 3px solid $color-border;
  box-shadow: 0 0.5rem 1rem rgba(black, 0.2);
}
</style>

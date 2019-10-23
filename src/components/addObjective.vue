<template>
  <div>
    <button @click="expand = true">Legg til nytt mål</button>

    <div v-if="expand">
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
      <button @click="send">Legg til</button>
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

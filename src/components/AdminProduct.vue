<template>
  <div v-if="product">
    <!-- <pre>{{ product }}</pre> -->

    <input type="text" v-model="product.name" />

    <p>Mission statement</p>
    <textarea rows="4" v-model="product.mission_statement"></textarea>

    <p>Team</p>
    <input type="text" />

    <button @click="saveObject">Lagre</button>
    <button @click="deleteObject">Slett</button>
  </div>
</template>

<script>
export default {
  data: () => ({
    product: null,
  }),

  props: {
    docref: { type: Object, required: true },
  },

  async mounted() {
    this.product = await this.docref.get().then(d => d.data());
  },

  watch: {
    async docref() {
      this.product = await this.docref.get().then(d => d.data());
    },
  },

  methods: {
    saveObject() {
      this.docref.update(this.product);
    },
    deleteObject() {
      this.docref.delete();
      this.product = null;
    },
  },
};
</script>

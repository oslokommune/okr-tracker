<template>
  <div v-if="obj">
    <input type="text" v-model="obj.name" />

    <p>Mission statement</p>
    <textarea rows="4" v-model="obj.mission_statement"></textarea>

    <button @click="save">Lagre</button>
  </div>
</template>

<script>
export default {
  data: () => ({
    obj: null,
  }),
  props: {
    docref: { type: Object, required: true },
  },
  async mounted() {
    this.obj = await this.docref.get().then(d => d.data());
  },

  watch: {
    async docref(newDocref) {
      this.obj = null;
      this.obj = await newDocref.get().then(d => d.data());
    },
  },

  methods: {
    save() {
      this.docref.update(this.obj);
    },
  },
};
</script>

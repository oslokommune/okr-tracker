<template>
  <div>
    <h3>Endre {{ keyres.key_result }}</h3>
  </div>
</template>

<script>
export default {
  name: 'EditKeyres',

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  computed: {
    keyres() {
      return this.$store.getters.getObjectById(this.id);
    },
  },
};
</script>

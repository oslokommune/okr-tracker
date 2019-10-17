<template>
  <div>
    <h3>Endre {{ id }}</h3>

    <p>{{ keyres }}</p>
  </div>
</template>

<script>
export default {
  name: "edit-keyres",

  props: ["id"],

  computed: {
    keyres() {
      return this.$store.getters.getObjectById(this.id);
    }
  }
};
</script>

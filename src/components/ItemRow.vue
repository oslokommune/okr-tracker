<template>
  <div>{{ data.name }} ({{ progression }})</div>
</template>

<script>
export default {
  data: () => ({
    progression: null,
  }),

  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  watch: {
    data: {
      immediate: true,
      async handler(data) {
        console.log(data);
        data.onProgressionSnapshot(({ docs }) => {
          if (docs.length) {
            this.progression = docs[0].data().progression;
          }
        });
      },
    },
  },
};
</script>

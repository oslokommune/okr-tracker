<template>
  <div class="container content">
    <div class="login">
      <h1 class="title-1">Du er ikke logget inn</h1>
      <p>Logg inn med organisasjonskonto for å bruke denne applikasjonen.</p>
      <button class="btn" @click="login()">Logg inn med Google</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    login() {
      this.$login().then(() => {
        location.reload();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  align-items: center;
  min-height: calc(80vh - 5rem);
}

.btn {
  margin-top: 2rem;
}
</style>

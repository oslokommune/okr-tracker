<template>
  <div>
    <router-link :to="{ name: 'home' }">Tilbake</router-link>
    <h1>{{ product.product }}</h1>

    <router-link
      :to="{ name: 'edit-product', params: { id: $route.params.id } }"
    >
      Endre produkt
    </router-link>

    <h2>Oppdrag</h2>
    <p>
      {{ product.mission_statement }}
    </p>

    <h2>Mål</h2>

    <ul>
      <li v-for="objective in product.children" :key="objective.id">
        <h3>{{ objective.objective_title }}</h3>
        <p>{{ objective.objective_body }}</p>
      </li>
    </ul>

    <h2>Nøkkelresultater</h2>

    <div v-for="objective in product.children" :key="objective.id">
      <ul>
        <li v-for="keyres in objective.children">
          <p>
            <strong>{{ objective.objective_title }}</strong>
            {{ keyres.key_result }}
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: "Product",

  computed: {
    product() {
      return this.$store.getters.getObjectById(this.$route.params.id);
    }
  }
};
</script>

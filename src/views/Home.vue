<template>
  <div>
    <h1>Home</h1>
    <!-- <add-product></add-product>
    <add-objective></add-objective>
    <add-key-result></add-key-result> -->

    <ul>
      <li v-for="org in nest" :key="org.id">
        <h1>{{ org.organisation }}</h1>

        <ul>
          <li v-for="dept in org.children" :key="dept.id">
            <h2>{{ dept.department }}</h2>
            <ul>
              <li v-for="product in dept.children" :key="product.id">
                <router-link :to="{ name: 'product', params: { id: product.id } }">
                  <h3>{{ product.product }}</h3>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
    <pre>{{ nest }}</pre>

    <hr />
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(['nest']),
  },
};
</script>

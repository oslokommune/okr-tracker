<template>
  <div>
    <div class="content">
      <ul>
        <li v-for="org in nest" :key="org.id">
          <h1 class="title-1">{{ org.name }}</h1>
          <ul>
            <li v-for="dept in org.departments" :key="dept.id">
              <h2 class="title-2">{{ dept.name }}</h2>
              <ul>
                <li v-for="product in dept.products" :key="product.id">
                  <router-link :to="{ name: 'product', params: { id: product.id } }">
                    <h3 class="title-3">{{ product.name }}</h3>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>
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

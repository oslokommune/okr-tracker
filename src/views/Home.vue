<template>
  <div class="container content">
    <div class="content">
      <ul>
        <li v-for="org in nest" :key="org.id">
          <h1 class="title-1">{{ org.organisation }}</h1>

          <ul>
            <li v-for="dept in org.children" :key="dept.id">
              <h2 class="title-2">{{ dept.department }}</h2>
              <ul>
                <li v-for="product in dept.children" :key="product.id">
                  <router-link :to="{ name: 'product', params: { id: product.id } }">
                    <h3 class="title-3">{{ product.product }}</h3>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <hr />
    <sunburst></sunburst>
    <hr />

    <button @click="mock">Inject mock data!</button>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Sunburst from '@/components/Sunburst.vue';

export default {
  components: {
    Sunburst,
  },
  computed: {
    ...mapState(['nest']),
  },

  methods: {
    ...mapActions(['addMockData']),

    mock() {
      this.addMockData();
    },
  },
};
</script>

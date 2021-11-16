<template>
  <div class="container">
    <ul v-if="user" class="home">
      <li v-for="org in tree" :key="org.id" class="tree">
        <item-row :data="org" class="tree__organization"></item-row>
        <ul>
          <li v-for="dept in org.children" :key="dept.id" class="card">
            <item-row :data="dept" type="department"></item-row>
            <ul>
              <li v-for="prod in dept.children" :key="prod.id">
                <item-row :data="prod" type="product"></item-row>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  name: 'Home',

  components: {
    ItemRow: () => import('@/components/ItemRow.vue'),
  },

  computed: {
    ...mapGetters(['tree']),
    ...mapState(['user']),
  },

  methods: {
    getCollapse(type, slug) {
      if (this.user.preferences.home === undefined || this.user.preferences.home.collapse[type][slug] === undefined) {
        return false;
      }
      return this.user.preferences.home.collapse[type][slug];
    },
  },
};
</script>
<style lang="scss" scoped>
.tree {
  margin-bottom: 0.5rem;
  padding: 1rem;
  background-color: var(--color-white);
}

.tree__organization {
  text-transform: uppercase;
}

.card {
  border-radius: 2px;
  box-shadow: 0 0.15rem 0.15rem rgba(black, 0.07);

  @media screen and (min-width: bp(l)) {
    margin-bottom: 1rem;
  }

  &:last-child {
    box-shadow: none;
  }
}

.home {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(8);
    margin-left: span(2, 1);
  }
}

.main-view {
  position: relative;
  width: span(12);
  padding: 1.5rem 0;

  @media screen and (min-width: bp(l)) {
    width: span(8, span(10));
  }
}
</style>

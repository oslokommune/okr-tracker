<template>
  <div class="main">
    <ul v-if="user">
      <li v-for="org in tree" :key="org.id">
        <item-row :data="org" type="organization"></item-row>
        <ul v-if="getCollapse('organization', org.slug)">
          <li v-for="dept in org.children" :key="dept.id" class="card">
            <item-row :data="dept" type="department"></item-row>
            <ul v-if="getCollapse('department', dept.slug)">
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
.card {
  background: white;
  border-radius: 2px;
  box-shadow: 0 0.15rem 0.15rem rgba(black, 0.07);

  @media screen and (min-width: bp(l)) {
    margin-bottom: 1rem;
  }
}
</style>

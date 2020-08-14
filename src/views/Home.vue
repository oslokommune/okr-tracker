<template>
  <div>
    <ul v-if="user" class="items">
      <li v-for="org in tree" :key="org.id">
        <ItemRow :data="org" type="organization"></ItemRow>
        <ul>
          <li class="card" v-for="dept in org.children" :key="dept.id">
            <itemRow :data="dept" type="department"></itemRow>
            <ul>
              <li v-for="prod in dept.children" :key="prod.id">
                <itemRow :data="prod" type="product"></itemRow>
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>

    <button v-if="!user" @click="login">Login</button>
  </div>
</template>

<script>
import { auth, loginProvider } from '@/config/firebaseConfig';
import { mapGetters, mapState } from 'vuex';

export default {
  computed: {
    ...mapGetters(['tree']),
    ...mapState(['user']),
  },

  components: {
    ItemRow: () => import('@/components/ItemRow.vue'),
  },

  methods: {
    logout() {
      auth.signOut();
    },

    login() {
      auth.signInWithPopup(loginProvider).catch(error => {
        console.error(error);
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.items {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(9, 0, span(9));
  }

  @media screen and (min-width: bp(l)) {
    width: span(8, 0, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(6, 0, span(10));
    margin-left: span(1, 1, span(10));
  }
}

.card {
  background: white;
  border-radius: 2px;
  box-shadow: 0 0.15rem 0.15rem rgba(black, 0.07);
}
</style>

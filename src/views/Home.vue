<template>
  <div>
    <pre v-if="user">{{ user.email }}</pre>

    <hr />

    <ul v-if="user">
      <li v-for="org in tree" :key="org.id">
        <ItemRow :data="org"></ItemRow>
        <ul>
          <li v-for="dept in org.children" :key="dept.id">
            <itemRow :data="dept"></itemRow>
            <ul>
              <li v-for="prod in dept.children" :key="prod.id">
                <itemRow :data="prod"></itemRow>
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

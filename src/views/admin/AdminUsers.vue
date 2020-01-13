<template>
  <div>
    <table>
      <tr v-for="user in users" :key="user.id">
        <td><input type="checkbox" :checked="user.admin" @change="toggleAdmin(user, $event.target.checked)" /></td>
        <td>{{ user.id }}</td>
        <td>{{ user.displayName }}</td>
        <td><button @click="deleteUser(user)">Slett</button></td>
      </tr>
    </table>

    <hr />
    <h3 class="title title-3">Legg til e-post-adresser</h3>
    <p>Én adresse per rad</p>
    <textarea rows="10" ref="add"></textarea>
    <button @click="addEmails">Legg til</button>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { validateEmail } from '@/util/formValidation';
import { db } from '@/config/firebaseConfig';

export default {
  name: 'Admin',

  computed: {
    ...mapState(['users']),
  },

  methods: {
    addEmails() {
      const list = this.$refs.add.value
        .trim()
        .split('\n')
        .filter(Boolean)
        .filter(validateEmail);

      list.forEach(email => {
        db.collection('users')
          .doc(email)
          .set({ admin: false });
      });
    },

    deleteUser(user) {
      user.ref.update();
    },

    toggleAdmin(user, value) {
      user.ref.update({ admin: value });
    },
  },
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
}
</style>

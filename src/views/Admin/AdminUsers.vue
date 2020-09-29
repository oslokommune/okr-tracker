<template>
  <div>
    admin users

    <table>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.displayName }}</td>
          <td>{{ user.email }}</td>
          <td><button @click="remove(user)">Remove</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import User from '@/db/User';

export default {
  data: () => ({
    users: [],
  }),

  firestore: {
    users: db.collection('users'),
  },

  methods: {
    remove: User.remove,
  },
};
</script>

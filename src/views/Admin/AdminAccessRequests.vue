<template>
  <div>
    admin access requests

    <ul>
      <li v-for="request in requestAccess" :key="request.id">
        <span>{{ request.email }}</span>
        <button @click="acceptRequest(request.id)">Accept</button>
        <button @click="rejectRequest(request.id)">Reject</button>
      </li>
    </ul>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import requestAccess from '@/db/RequestAccess';

export default {
  data: () => ({
    requestAccess: [],
  }),

  firestore: {
    requestAccess: db.collection('requestAccess'),
  },

  methods: {
    acceptRequest: requestAccess.accept,
    rejectRequest: requestAccess.reject,
  },
};
</script>

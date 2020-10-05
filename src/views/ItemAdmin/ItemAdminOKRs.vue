<template>
  <div>
    <ol>
      <li v-for="(p, index) in periods" :key="index">
        <span>{{ p }}</span>
      </li>
    </ol>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ItemAdminOKRs',

  computed: {
    ...mapState(['periods']),
  },
};
</script>

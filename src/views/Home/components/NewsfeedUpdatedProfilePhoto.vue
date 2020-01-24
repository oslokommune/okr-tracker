<template>
  <div class="nf-card">
    <div class="nf-card__user" v-if="eventData.user">
      <img
        class="nf-card__avatar"
        :src="currentPhotoURL || '/placeholder-user.svg'"
        :alt="eventData.user.displayName"
      />
      <div class="nf-card__usertext">
        <span class="nf-card__displayname">{{ eventData.user.displayName }}</span>
        har lastet opp nytt profilbilde
      </div>
    </div>
    <newsfeed-footer :data="eventData"></newsfeed-footer>
  </div>
</template>

<script>
import NewsfeedFooter from './NewsfeedFooter.vue';

export default {
  data: () => ({
    currentPhotoURL: null,
  }),

  props: {
    eventData: {
      type: Object,
      required: true,
    },
  },

  components: {
    NewsfeedFooter,
  },

  async created() {
    this.currentPhotoURL = await this.eventData.user.ref.get().then(snapshot => snapshot.data().photoURL);
  },
};
</script>

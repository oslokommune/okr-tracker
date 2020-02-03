<template>
  <div class="newsfeed">
    <h2 class="title-3">
      <i class="fa fa-stream fa-fw"></i>Aktivitet
      <button class="btn btn--borderless" @click="$emit('close')" v-tooltip.left="`Skjul aktivitet`">
        <i class="fa fa-times"></i>
      </button>
    </h2>

    <transition-group name="feed" tag="div" class="newsfeed__feed" v-show="feed.length">
      <div v-for="event in feed" :key="event.id">
        <NewsfeedCard :event-data="event"></NewsfeedCard>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import NewsfeedCard from './NewsfeedCard.vue';
import { serializeDocument } from '../../../util/db';

export default {
  data: () => ({
    feed: [],
    unsubscribe: null,
    eventTypes: [
      'keyRes-update-progress',
      'upload-profile-photo',
      'create-key-result',
      'archive-key-result',
      'create-objective',
      'update-objective',
      'archive-objective',
      'promoted-admin',
      'demoted-admin',
      'added-users',
      'deleted-user',
      'create-product',
      'archive-product',
      'update-product',
      'update-product-image',
    ],
  }),

  computed: {
    ...mapState(['showNewsfeed']),
  },

  components: {
    NewsfeedCard,
  },

  watch: {
    showNewsfeed(show) {
      if (!show && this.unsubscribe) this.unsubscribe();
      if (show) this.subscribe();
    },
  },

  mounted() {
    this.subscribe();
  },

  methods: {
    subscribe() {
      this.unsubscribe = db
        .collection('audit')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .onSnapshot(async snapshot => {
          const newDocuments = await snapshot
            .docChanges()
            .filter(d => d.type === 'added')
            .filter(d => !this.eventTypes.includes(d.event))
            .filter(d => !this.feed.map(el => el.id).includes(d.doc.id));

          const newObjects = newDocuments
            .map(d => d.doc)
            .map(d => {
              return serializeDocument(d);
            });

          newObjects.forEach(obj => {
            this.feed.push(obj);
          });
          this.feed.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
        });
    },
  },
};
</script>

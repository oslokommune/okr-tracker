<template>
  <div class="container">
    <div class="newsfeed">
      <h2 class="title-2">Nyhetsstrøm</h2>

      <transition-group name="feed" tag="div" class="newsfeed_feed" v-if="feed.length">
        <template v-for="event in feed">
          <UpdatedKeyres :key="event.id" :event-data="event"></UpdatedKeyres>
        </template>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import UpdatedKeyres from './NewsfeedUpdatedKeyres.vue';
import { serializeDocument } from '../../../util/db';

export default {
  data: () => ({
    feed: [],
  }),

  components: {
    UpdatedKeyres,
  },

  mounted() {
    db.collection('audit')
      .where('event', '==', 'keyRes-update-progress')
      .orderBy('timestamp', 'desc')
      .limit(6)
      .onSnapshot(async snapshot => {
        const newDocuments = await snapshot.docChanges().filter(d => d.type === 'added');

        const obj = newDocuments
          .map(d => d.doc)
          .map(d => {
            return serializeDocument(d);
          });

        obj.forEach(d => {
          this.feed.push(d);
        });
        this.feed.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      });
  },
};
</script>

<style lang="scss" scoped>
.newsfeed {
  max-width: 600px;
  padding: 1rem;
}

.feed-enter-active,
.feed-leave-active,
.feed-move {
  transition: 500ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
  transition-property: opacity, transform;
}

.feed-enter {
  transform: translateX(50px) scaleY(0.5);
  opacity: 0;
}

.feed-enter-to {
  transform: translateX(0) scaleY(1);
  opacity: 1;
}

.feed-leave-active {
  position: absolute;
}

.feed-leave-to {
  transform: scaleY(0);
  transform-origin: center top;
  opacity: 0;
}
</style>

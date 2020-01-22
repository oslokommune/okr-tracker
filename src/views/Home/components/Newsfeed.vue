<template>
  <div class="newsfeed">
    <h2 class="title-3">
      <i class="fa fa-stream fa-fw"></i>Aktivitet
      <button class="btn btn--borderless" @click="$emit('close')"><i class="fa fa-times"></i></button>
    </h2>

    <transition-group name="feed" tag="div" class="newsfeed__feed" v-if="feed.length">
      <template v-for="event in feed">
        <UpdatedKeyres :key="event.id" :event-data="event"></UpdatedKeyres>
      </template>
    </transition-group>
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
@import '@/styles/_colors';

.newsfeed {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  max-width: 400px;
  height: 100vh;
  background: white;
  border-left: 1px solid rgba(black, 0.2);

  &__feed {
    position: relative;
    height: calc(100vh - 3rem);
    padding-top: 1rem;
    overflow-y: scroll;
    border-top: 1px solid $color-border;
    border-bottom: 1px solid $color-border;
  }
}

.title-3 {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0 1rem;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.06rem;
  text-transform: uppercase;
  background: $color-bg;

  .fa {
    margin-right: 1.5rem;
    padding-left: 0.5rem;
    font-size: 1rem;
  }
}

.title-3 .btn {
  margin-right: -1rem;
  margin-left: auto;
  text-align: center !important;

  .fa {
    margin-right: 0;
    padding: 0;
    font-size: 1.2rem;
  }
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

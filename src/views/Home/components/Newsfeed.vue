<template>
  <div class="newsfeed">
    <h2 class="title-3">
      <i class="fa fa-stream fa-fw"></i>Aktivitet
      <button class="btn btn--borderless" @click="$emit('close')" v-tooltip.left="`Skjul aktivitet`">
        <i class="fa fa-times"></i>
      </button>
    </h2>

    <transition-group name="feed" tag="div" class="newsfeed__feed" v-show="feed.length">
      <template v-for="event in feed">
        <div v-show="event.event === 'keyRes-update-progress'" :key="event.id + 'updatedkeyres'">
          <UpdatedKeyres :event-data="event"></UpdatedKeyres>
        </div>

        <div v-if="event.event === 'upload-profile-photo'" :key="event.id + 'uploadprofilephoto'">
          <UploadProfilePhoto :event-data="event"></UploadProfilePhoto>
        </div>

        <div v-if="event.event === 'create-key-result'" :key="event.id + 'newkeyres'">
          <CreateNewKeyResult :event-data="event"></CreateNewKeyResult>
        </div>
      </template>
    </transition-group>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';
import UpdatedKeyres from './NewsfeedUpdatedKeyres.vue';
import UploadProfilePhoto from './NewsfeedUpdatedProfilePhoto.vue';
import CreateNewKeyResult from './NewsfeedCreateKeyResult.vue';
import { serializeDocument } from '../../../util/db';

export default {
  data: () => ({
    feed: [],
  }),

  components: {
    UpdatedKeyres,
    UploadProfilePhoto,
    CreateNewKeyResult,
  },

  mounted() {
    db.collection('audit')
      .where('event', 'in', ['keyRes-update-progress', 'upload-profile-photo', 'create-key-result'])
      .orderBy('timestamp', 'desc')
      .limit(15)
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

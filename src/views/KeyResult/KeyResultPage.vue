<template>
  <div>
    <PageHeader :data="key_result || {}"></PageHeader>

    <div class="container container--sidebar" v-if="key_result">
      <div class="content--main content--padding">
        <router-view></router-view>

        <div class="section">
          <h1 class="title-1">{{ key_result.key_result }}</h1>
        </div>

        <form @submit.prevent="addProgress" @submit="addValue" class="form-group">
          <div class="form-field">
            <input type="date" v-model="newProgression.date" />
          </div>
          <div class="form-field">
            <div class="form-row">
              <input type="number" v-model="newProgression.value" />
              <button class="btn">Legg til</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { serializeDocument } from '../../util/db';
import PageHeader from '@/components/PageHeader.vue';
import * as Toast from '@/util/toasts';

export default {
  data: () => ({
    key_result: null,
    doc: null,

    newProgression: {
      value: null,
      date: new Date(),
    },
  }),

  computed: {
    ...mapState(['user']),

    obj() {
      return {
        ...this.newProgression,
        archived: false,
        created: new Date(),
        created_by: this.user.ref,
      };
    },
  },

  components: {
    PageHeader,
  },

  async mounted() {
    this.doc = await db
      .collectionGroup('key_results')
      .get()
      .then(snapshot => snapshot.docs.filter(d => d.id === this.$route.params.keyresid)[0])
      .catch(err => {
        Toast.error();
        throw new Error(err);
      });
  },

  methods: {
    addValue() {
      this.key_result.ref.collection('progression').add(this.obj);
    },
  },

  watch: {
    doc(doc) {
      doc.ref.onSnapshot(snapshot => {
        this.key_result = serializeDocument(snapshot);
      });
    },
  },
};
</script>

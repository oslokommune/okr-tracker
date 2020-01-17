<template>
  <div>
    <PageHeader :data="key_result || {}"></PageHeader>

    <div class="container container--sidebar" v-if="key_result">
      <div class="content--main content--padding">
        <router-view></router-view>

        <div class="section">
          <h1 class="title-1">{{ key_result.key_result }}</h1>
        </div>

        <form @submit.prevent="addValue" class="form-group">
          <div class="form-field">
            <input type="datetime-local" v-model="date" />
          </div>
          <div class="form-field">
            <div class="form-row">
              <input type="number" v-model="value" />
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
import moment from 'moment';
import { db } from '@/config/firebaseConfig';
import { serializeDocument } from '../../util/db';
import PageHeader from '@/components/PageHeader.vue';
import * as Toast from '@/util/toasts';

export default {
  data: () => ({
    key_result: null,
    doc: null,
    value: 0,
    date: moment().format('YYYY-MM-DDTHH:00'),
  }),

  computed: {
    ...mapState(['user']),

    obj() {
      return {
        date: moment(this.date).toDate(),
        value: +this.value,
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
    async addValue() {
      await this.key_result.ref
        .collection('progression')
        .add(this.obj)
        .then(Toast.addedProgression)
        .catch(Toast.error);

      this.value = 0;
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

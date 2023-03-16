import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { formatKPIValue, getKPIProgress, getKPIProgressQuery } from '@/util/kpiHelpers';

export default {
  data: () => ({
    progressCollection: [],
    goals: [],
    isProgressLoading: false,
  }),

  computed: {
    ...mapState(['selectedPeriod']),

    progress() {
      // Filter out any duplicate measurement values for each date
      const seenDates = [];

      return this.progressCollection.filter((a) => {
        const date = a.timestamp.toDate().toISOString().slice(0, 10);
        if (!seenDates.includes(date)) {
          seenDates.push(date);

          const { startDate, endDate } = this.selectedPeriod;

          return (
            (!startDate || a.timestamp.toDate() > startDate) &&
            (!endDate || a.timestamp.toDate() < endDate)
          );
        }
        return false;
      });
    },

    progressIsFiltered() {
      return this.selectedPeriod?.key !== 'all';
    },

    latestProgressRecord() {
      if (this.progress.length) {
        return this.progress.slice(-1)[0];
      }
      return null;
    },
  },

  methods: {
    formatKPIValue,

    async setProgress() {
      this.isProgressLoading = true;

      const { startDate, endDate } = this.selectedPeriod;
      this.progressCollection = getKPIProgress(startDate, endDate, this.kpi);

      if (!this.progressCollection || this.progressCollection.length === 0) {
        const query = getKPIProgressQuery(startDate, endDate, this.kpi);
        await this.$bind('progressCollection', query.orderBy('timestamp', 'asc'));
      }

      this.isProgressLoading = false;
    },

    async setGoals() {
      await this.$bind(
        'goals',
        db
          .collection(`kpis/${this.kpi.id}/goals`)
          .where('archived', '==', false)
          .orderBy('toDate', 'desc')
      );
    },
  },
};

<template>
  <modal-wrapper @close="close">
    <template #header>
      {{ $t('kpi.add') }}
    </template>

    <kpi-admin-form :loading="loading" @save="add" />
  </modal-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import Kpi from '@/db/Kpi';
import ModalWrapper from './ModalWrapper.vue';
import KpiAdminForm from '@/components/forms/KpiAdminForm.vue';

export default {
  name: 'AddKPIModal',

  components: {
    KpiAdminForm,
    ModalWrapper,
  },

  data: () => ({
    loading: false,
  }),

  computed: {
    ...mapState(['kpis', 'activeItemRef']),
  },

  methods: {
    close() {
      this.$emit('close');
    },

    async add(kpi) {
      this.loading = true;
      const data = { ...kpi, parent: this.activeItemRef };

      try {
        await Kpi.create(data);
        this.$toasted.show(this.$t('toaster.add.kpi'));
        this.close();
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.kpi'));
        throw new Error(error);
      }

      this.loading = false;
    },
  },
};
</script>

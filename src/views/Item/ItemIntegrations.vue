<template>
  <page-layout breakpoint="tablet-big" class="integrations-page">
    <header class="integrations-page__header mb-size-24">
      <h1 class="pkt-txt-24-medium">{{ $t('general.integrations') }}</h1>
      <router-link :to="{ name: 'Api' }">
        {{ $t('general.api') }}
        <pkt-icon name="chevron-right" />
      </router-link>
    </header>

    <i18n path="integration.info" tag="p" class="mb-size-24">
      <template #clientIdHeader>
        <code>okr-client-id</code>
      </template>
      <template #clientSecretHeader>
        <code>okr-client-secret</code>
      </template>
      <template #apiKeyHeader>
        <code>x-api-key</code>
      </template>
    </i18n>

    <div v-if="dataLoading"><loading-small /> {{ $t('general.loading') }}</div>

    <pkt-alert v-if="dataLoadingError" skin="error">
      {{ $t('integration.error.loading', { error: dataLoadingError }) }}
    </pkt-alert>

    <template v-else-if="apiClients.length">
      <div class="mb-size-32">
        <pkt-button
          skin="primary"
          size="small"
          variant="icon-left"
          icon-name="plus-sign"
          :disabled="loading"
          @onClick="openClientModal(null)"
        >
          {{ $t('integration.action.add') }}
        </pkt-button>
      </div>

      <api-client-card
        v-for="client in apiClients"
        :key="client.id"
        class="mb-size-24"
        :client="client"
        :loading="loading"
        :visible-secret="client.id === updatedClientId ? updatedClientSecret : null"
        @hide-secret="hideSecret"
        @edit="openClientModal"
        @rotate="rotate"
        @delete="archive"
      />
    </template>

    <empty-state
      v-else
      :heading="$t('integration.empty.heading')"
      :body="$t('integration.empty.body')"
    >
      <div data-mode="dark">
        <pkt-button
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @onClick="openClientModal(null)"
        >
          {{ $t('integration.action.add') }}
        </pkt-button>
      </div>
    </empty-state>

    <api-client-modal
      v-if="showClientModal"
      :client="chosenClient"
      @save="saveClientMetadata"
      @close="closeClientModal"
    />
  </page-layout>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import { PktButton } from '@oslokommune/punkt-vue2';
import ApiClient from '@/db/ApiClient';

export default {
  name: 'ItemIntegrations',

  components: {
    PktAlert: () => import('@oslokommune/punkt-vue2').then(({ PktAlert }) => PktAlert),
    EmptyState: () => import('@/components/EmptyState.vue'),
    LoadingSmall: () => import('@/components/LoadingSmall.vue'),
    ApiClientCard: () => import('@/components/ApiClientCard.vue'),
    ApiClientModal: () => import('@/components/modals/ApiClientModal.vue'),
    PktButton,
  },

  data: () => ({
    apiClients: [],
    dataLoading: false,
    dataLoadingError: null,
    loading: false,
    showClientModal: false,
    chosenClient: null,
    updatedClientId: null,
    updatedClientSecret: null,
  }),

  computed: {
    ...mapState(['activeItem', 'activeItemRef']),
    ...mapGetters(['hasEditRights']),
  },

  watch: {
    activeItemRef: {
      immediate: true,
      async handler(activeItemRef) {
        this.dataLoading = true;
        this.dataLoadingError = null;
        await this.$bind(
          'apiClients',
          db
            .collection('apiClients')
            .where('parent', '==', activeItemRef)
            .where('archived', '==', false)
            .orderBy('created', 'desc')
        ).catch((error) => {
          this.dataLoadingError = error.code ? error.code : error;
        });
        this.dataLoading = false;
      },
    },
  },

  methods: {
    async saveClientMetadata(client, data) {
      if (client) {
        await this.update(client, data);
      } else {
        await this.create(data);
      }
    },

    async create({ name, description }) {
      try {
        this.loading = true;

        const clientRef = await ApiClient.create({
          parent: this.activeItemRef,
          name,
          description,
        });

        try {
          const secret = await ApiClient.createSecret(clientRef);
          this.updatedClientId = clientRef.id;
          this.updatedClientSecret = secret;
        } catch (error) {
          await ApiClient.remove(clientRef);
          throw error;
        }

        this.$toasted.show(this.$t('integration.toast.add'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('integration.toast.addError'));
      } finally {
        this.loading = false;
      }
    },

    async update(client, data) {
      try {
        this.loading = true;
        const clientRef = ApiClient.collection.doc(client.id);
        await ApiClient.update(clientRef, data);
        this.$toasted.show(this.$t('integration.toast.update'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('integration.toast.updateError'));
      } finally {
        this.loading = false;
      }
    },

    async archive(client) {
      try {
        this.loading = true;
        const clientRef = ApiClient.collection.doc(client.id);
        await ApiClient.archive(clientRef);
        this.$toasted.show(this.$t('integration.toast.delete'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('integration.toast.deleteError'));
      } finally {
        this.loading = false;
      }
    },

    async rotate(client) {
      try {
        this.loading = true;
        const clientRef = ApiClient.collection.doc(client.id);
        const secret = await ApiClient.rotateSecret(clientRef);
        this.updatedClientId = clientRef.id;
        this.updatedClientSecret = secret;
        this.$toasted.show(this.$t('integration.toast.rotate'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('integration.toast.rotateError'));
      } finally {
        this.loading = false;
      }
    },

    hideSecret() {
      this.updatedClientId = null;
      this.updatedClientSecret = null;
    },

    openClientModal(client) {
      this.showClientModal = true;
      this.chosenClient = client;
    },

    closeClientModal() {
      this.showClientModal = false;
      this.chosenClient = null;
    },
  },
};
</script>

<style lang="scss" scoped>
.integrations-page {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    a {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
  }
}
</style>

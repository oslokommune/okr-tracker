<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useCollection } from 'vuefire';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { collection, doc, orderBy, query, where } from 'firebase/firestore';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { db } from '@/config/firebaseConfig';
import ApiClient from '@/db/ApiClient';
import { PktAlert, PktButton, PktLoader } from '@oslokommune/punkt-vue';
import ApiClientCard from '@/components/ApiClientCard.vue';
import ApiClientModal from '@/components/modals/ApiClientModal.vue';
import EmptyState from '@/components/EmptyState.vue';
import ListTransition from '@/components/generic/transitions/ListTransition.vue';

const router = useRouter();
const toast = useToast();
const i18n = useI18n();

const { hasEditRights } = storeToRefs(useAuthStore());
const { itemRef } = storeToRefs(useActiveItemStore());

watchEffect(async () => {
  if (!hasEditRights.value) {
    await router.replace({ name: 'ItemHome' });
  }
});

const {
  data: apiClients,
  pending: clientsIsLoading,
  error: clientsLoadError,
} = useCollection(
  computed(() => {
    return (
      itemRef.value &&
      hasEditRights.value &&
      query(
        collection(db, 'apiClients'),
        where('parent', '==', itemRef.value),
        where('archived', '==', false),
        orderBy('created', 'desc')
      )
    );
  }),
  { ssrKey: 'integrations' }
);

const isLoading = ref(false);
const showClientModal = ref(false);
const chosenClient = ref(null);
const updatedClientId = ref(null);
const updatedClientSecret = ref(null);

function openClientModal(client) {
  showClientModal.value = true;
  chosenClient.value = client;
}

function closeClientModal() {
  showClientModal.value = false;
  chosenClient.value = null;
}

async function saveClientMetadata(client, data) {
  if (client) {
    await update(client, data);
  } else {
    await create(data);
  }
}

async function create({ name, description }) {
  try {
    isLoading.value = true;
    const clientRef = await ApiClient.create({
      parent: itemRef.value,
      name,
      description,
    });
    try {
      const secret = await ApiClient.createSecret(clientRef);
      updatedClientId.value = clientRef.id;
      updatedClientSecret.value = secret;
    } catch (error) {
      await ApiClient.remove(clientRef);
      throw error;
    }
    toast.success(i18n.t('integration.toast.add'));
  } catch (error) {
    console.log(error);
    toast.error(i18n.t('integration.toast.addError'));
  } finally {
    isLoading.value = false;
  }
}

async function update(client, data) {
  try {
    isLoading.value = true;
    const clientRef = doc(ApiClient.apiClientsCollection, client.id);
    await ApiClient.update(clientRef, data);
    toast.success(i18n.t('integration.toast.update'));
  } catch (error) {
    console.log(error);
    toast.error(i18n.t('integration.toast.updateError'));
  } finally {
    isLoading.value = false;
  }
}

async function archive(client) {
  try {
    isLoading.value = true;
    const clientRef = doc(ApiClient.apiClientsCollection, client.id);
    await ApiClient.archive(clientRef);
    toast.success(i18n.t('integration.toast.delete'));
  } catch (error) {
    console.log(error);
    toast.error(i18n.t('integration.toast.deleteError'));
  } finally {
    isLoading.value = false;
  }
}

async function rotate(client) {
  try {
    isLoading.value = true;
    const clientRef = doc(ApiClient.apiClientsCollection, client.id);
    const secret = await ApiClient.rotateSecret(clientRef);
    updatedClientId.value = clientRef.id;
    updatedClientSecret.value = secret;
    toast.success(i18n.t('integration.toast.rotate'));
  } catch (error) {
    console.log(error);
    toast.error(i18n.t('integration.toast.rotateError'));
  } finally {
    isLoading.value = false;
  }
}

function hideSecret() {
  updatedClientId.value = null;
  updatedClientSecret.value = null;
}
</script>

<template>
  <PageLayout breakpoint="tablet-big" class="integrations-page">
    <header class="integrations-page__header mb-size-24">
      <h1 class="pkt-txt-24-medium">{{ $t('general.integrations') }}</h1>
      <RouterLink :to="{ name: 'Api' }" target="_blank">
        {{ $t('general.api') }}
        <PktIcon name="chevron-right" />
      </RouterLink>
    </header>

    <i18n-t keypath="integration.info" tag="p" class="mb-size-24" scope="global">
      <template #clientIdHeader>
        <code>okr-client-id</code>
      </template>
      <template #clientSecretHeader>
        <code>okr-client-secret</code>
      </template>
      <template #apiKeyHeader>
        <code>x-api-key</code>
      </template>
    </i18n-t>

    <div v-if="clientsIsLoading" class="integrations-page__loading">
      <PktLoader :message="$t('general.loading')" size="large" :delay="250" inline />
    </div>

    <PktAlert v-if="clientsLoadError" skin="error">
      {{ $t('integration.error.loading', { error: clientsLoadError.code }) }}
    </PktAlert>

    <template v-else-if="apiClients.length">
      <div class="mb-size-32">
        <PktButton
          skin="primary"
          size="small"
          variant="icon-left"
          icon-name="plus-sign"
          @click="openClientModal(null)"
        >
          {{ $t('integration.action.add') }}
        </PktButton>
      </div>

      <ListTransition>
        <ApiClientCard
          v-for="client in apiClients"
          :key="client.id"
          class="mb-size-24"
          :client="client"
          :loading="isLoading"
          :visible-secret="client.id === updatedClientId ? updatedClientSecret : null"
          @hide-secret="hideSecret"
          @edit="openClientModal"
          @rotate="rotate"
          @delete="archive"
        />
      </ListTransition>
    </template>

    <EmptyState
      v-else-if="!clientsIsLoading && !apiClients.length"
      :heading="$t('integration.empty.heading')"
      :body="$t('integration.empty.body')"
    >
      <div data-mode="dark">
        <PktButton
          skin="primary"
          variant="icon-left"
          icon-name="plus-sign"
          @click="openClientModal(null)"
        >
          {{ $t('integration.action.add') }}
        </PktButton>
      </div>
    </EmptyState>

    <ApiClientModal
      v-if="showClientModal"
      :client="chosenClient"
      @save="saveClientMetadata"
      @close="closeClientModal"
    />
  </PageLayout>
</template>

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

  &__loading {
    text-align: center;
  }
}
</style>

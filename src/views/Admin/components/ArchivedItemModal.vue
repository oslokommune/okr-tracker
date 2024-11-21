<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { Organization, Department, Product } from '@/db/models';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import { BtnCancel } from '@/components/generic/form';
import ModalWrapper from '@/components/modals/ModalWrapper.vue';

const router = useRouter();
const i18n = useI18n();
const toast = useToast();

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close']);

const isLoading = ref(false);

const itemType = computed(() => {
  if (props.item.organization && props.item.department) {
    return 'product';
  }
  if (props.item.organization) {
    return 'department';
  }
  return 'organization';
});

const itemModel = computed(() => {
  if (itemType.value === 'product') {
    return Product;
  }
  if (itemType.value === 'department') {
    return Department;
  }
  return Organization;
});

const itemIcon = computed(() => {
  if (itemType.value === 'product') {
    return 'house-heart';
  }
  if (itemType.value === 'department') {
    return 'district';
  }
  return 'organization';
});

async function restore() {
  isLoading.value = true;
  try {
    await itemModel.value.restore(props.item.id);
    toast.success(i18n.t('toaster.restored', { name: props.item.name }));
    router.push({
      name: 'ItemAbout',
      params: { slug: props.item.slug },
      query: { edit: true },
    });
  } catch (e) {
    console.log(e);
    toast.error(i18n.t('toaster.error.restore', { document: props.item.name }));
  }
  isLoading.value = false;
}

function close() {
  emit('close');
}
</script>

<template>
  <ModalWrapper :icon="itemIcon" :title="item.name" :initial-focus="false" @close="close">
    <p class="mb-size-16 pkt-txt-18">{{ item.missionStatement }}</p>

    <PktAlert skin="warning" compact>
      {{ $t(`archived.body.${itemType}`) }} {{ $t('archived.restoreText') }}
    </PktAlert>

    <FormSection class="mt-size-16">
      <template #actions="{ submit, disabled }">
        <BtnCancel :disabled="disabled || isLoading" @on-click="close" />
        <PktButton
          :disabled="disabled || isLoading"
          icon-name="arrow-circle"
          variant="icon-left"
          :text="$t('btn.restore')"
          @on-click="submit(restore)"
        />
      </template>
    </FormSection>
  </ModalWrapper>
</template>

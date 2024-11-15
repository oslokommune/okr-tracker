<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { useActiveItemStore } from '@/store/activeItem';
import { useKpi } from '@/composables/kpi';
import {
  kpiFormats,
  kpiStartValues,
  kpiTypes,
  kpiTrendOptions,
  kpiUpdateFrequencies,
} from '@/util/kpiHelpers';
import Kpi from '@/db/Kpi';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import { BtnSave, BtnDelete } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import FadeTransition from '@/components/generic/transitions/FadeTransition.vue';

const i18n = useI18n();
const toast = useToast();

const props = defineProps({
  kpiId: {
    type: String,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['create', 'update', 'archive', 'restore']);

const { itemRef: activeItemRef } = storeToRefs(useActiveItemStore());
const { kpi, kpiRef, kpiPromise } = useKpi(props.kpiId);

const drawer = ref(null);
const pageCount = ref(3);
const isEditMode = computed(() => !!props.kpiId);
const isLoading = ref(false);
const isArchived = computed(() => kpi.value && kpi.value.archived);

const formData = ref({});

const formatOptions = kpiFormats();
const startValueOptions = kpiStartValues();
const trendOptions = kpiTrendOptions();
const updateFrequencyOptions = kpiUpdateFrequencies();
const typeOptions = kpiTypes().map(({ id, label, description }) => ({
  id,
  label,
  helptext: description,
}));

onMounted(async () => {
  formData.value = {
    name: '',
    description: '',
    format: 'integer',
    startValue: 'zero',
    preferredTrend: 'increase',
    kpiType: 'plain',
    updateFrequency: 'daily',
    api: true,
  };

  await kpiPromise.value;

  if (kpi.value) {
    formData.value = Object.fromEntries(
      Object.entries(formData.value).map(([key]) => [
        key,
        key in kpi.value ? kpi.value[key] : formData.value[key],
      ])
    );
  }
});

async function save() {
  const { pageIndex, next } = drawer.value;

  if (pageIndex < pageCount.value) {
    next();
    return;
  }

  isLoading.value = true;

  try {
    if (kpi.value) {
      // Update existing KPI
      await Kpi.update(kpi.value.id, formData.value);
      emit('update', kpiRef.value);
    } else {
      // Create new KPI
      const createdKpiRef = await Kpi.create({
        ...formData.value,
        parent: activeItemRef.value,
      });
      kpiRef.value = createdKpiRef;
      emit('create', kpiRef.value);
    }
    next();
  } catch (error) {
    next(false);
    toast.error(i18n.t('toaster.error.save'));
  }

  isLoading.value = false;
}

async function archive() {
  isLoading.value = true;
  try {
    await Kpi.archive(kpi.value.id);
    emit('archive', kpiRef.value);
  } catch {
    toast.error(i18n.t('toaster.error.archive', { document: kpi.value.name }));
  }
  isLoading.value = false;
}

async function restore() {
  isLoading.value = true;
  try {
    await Kpi.restore(kpi.value.id);
    emit('restore', kpiRef.value);
  } catch {
    toast.error(i18n.t('toaster.error.restore', { document: kpi.value.name }));
  }
  isLoading.value = false;
}
</script>

<template>
  <PagedDrawerWrapper ref="drawer" :visible="!!drawer" :page-count="pageCount">
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(isEditMode ? 'admin.measurement.change' : 'admin.measurement.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(isEditMode ? 'admin.measurement.updated' : 'admin.measurement.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ pageIndex, prev, cancel }">
      <FormSection>
        <template v-if="pageIndex === 1">
          <FormComponent
            v-model="formData.name"
            input-type="input"
            name="name"
            :label="$t('fields.name')"
            :disabled="isArchived"
            rules="required"
          />

          <FormComponent
            v-model="formData.description"
            input-type="textarea"
            :rows="8"
            name="description"
            :disabled="isArchived"
            :label="$t('fields.description')"
          />
        </template>

        <template v-else-if="pageIndex === 2">
          <FormComponent
            v-model="formData.kpiType"
            input-type="radio-group"
            name="kpiType"
            :label="$t('fields.kpitype')"
            rules="required"
            :options="typeOptions"
          />

          <FadeTransition>
            <PktAlert v-if="formData.kpiType === 'ri'">
              {{ $t('kpi.help.resultIndicatorWarning') }}
            </PktAlert>
          </FadeTransition>
        </template>

        <template v-else-if="pageIndex === 3">
          <FormComponent
            v-model="formData.format"
            input-type="custom-select"
            name="format"
            :label="$t('kpi.format')"
            rules="required"
            select-label="label"
            :options="formatOptions"
            :can-clear="false"
            value-prop="id"
          />

          <FormComponent
            v-model="formData.startValue"
            input-type="custom-select"
            name="startValue"
            :label="$t('kpi.startValue')"
            rules="required"
            :options="startValueOptions"
            :can-clear="false"
            value-prop="id"
          />

          <FormComponent
            v-model="formData.preferredTrend"
            input-type="custom-select"
            name="preferredTrend"
            :label="$t('kpi.preferredTrend')"
            rules="required"
            :options="trendOptions"
            :can-clear="false"
            value-prop="id"
          />

          <FormComponent
            v-model="formData.updateFrequency"
            input-type="custom-select"
            name="updateFrequency"
            :label="$t('kpi.updateFrequency.label')"
            rules="required"
            :options="updateFrequencyOptions"
            :can-clear="false"
            value-prop="id"
            :helptext="$t('kpi.updateFrequency.help')"
          />
        </template>

        <template #actions="{ submit, disabled }">
          <PktButton
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="isLoading || isArchived"
            @click.capture.stop="cancel"
          />
          <PktButton
            v-else
            :text="$t('btn.back')"
            skin="tertiary"
            :disabled="isLoading || isArchived"
            @click.capture.stop="prev"
          />
          <BtnSave
            :text="pageIndex === pageCount ? $t('btn.complete') : $t('btn.continue')"
            :disabled="disabled || isLoading || isArchived"
            variant="label-only"
            @click.capture.stop="submit(save)"
          />
        </template>
      </FormSection>
    </template>

    <template #footer="{ isDone }">
      <template v-if="isEditMode && !isDone">
        <ArchivedRestore
          v-if="isArchived"
          :restore="restore"
          :text="$t('kpi.archived')"
        />
        <div v-else class="button-row">
          <BtnDelete
            :disabled="isLoading"
            :text="$t('admin.measurement.delete')"
            @on-click="archive"
          />
        </div>
      </template>
    </template>
  </PagedDrawerWrapper>
</template>

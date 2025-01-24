<script setup>
import { computed, ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { doc, deleteField, getDoc } from 'firebase/firestore';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toast-notification';
import { isEqual } from 'date-fns';
import { useAuthStore } from '@/store/auth';
import { useActiveItemStore } from '@/store/activeItem';
import { useObjective } from '@/composables/objective';
import Objective from '@/db/Objective';
import { db } from '@/config/firebaseConfig';
import syncObjectiveContributors from '@/util/objectiveContributors';
import { BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import PeriodShortcut from '@/components/period/PeriodShortcut.vue';

const i18n = useI18n();
const toast = useToast();

const props = defineProps({
  objectiveId: {
    type: String,
    required: false,
    default: null,
  },
  newestObjective: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['create', 'update', 'archive', 'restore', 'add-key-result']);

const { hasParentEditRights } = storeToRefs(useAuthStore());
const { item, itemRef } = storeToRefs(useActiveItemStore());
const { objective, objectiveRef, objectivePromise, keyResults } = useObjective(
  props.objectiveId
);
const drawer = ref(null);
const isLoading = ref(false);
const isEditMode = computed(() => !!props.objectiveId);

const currentOwner = ref(null);
const potentionalOwner = ref(null);
const foreignContributors = computed(() => {
  // Return array with names of current foreign contributors
  return [
    ...new Set(
      this.keyResults
        .filter((kr) => kr.parent.id !== this.objective.parent.id)
        .map((kr) => kr.parent.name)
    ),
  ];
});
const hasForeignContributors = computed(
  // Return `true` if the current objective has any foreign contributors
  () => keyResults.value.some((kr) => kr.parent.id !== objective.value.parent.id)
);
const isLiftable = computed(
  // Return `true` if the user should be able to lift current objective
  () => potentionalOwner.value && !hasForeignContributors.value
);
const isArchived = computed(
  // Return `true` if the current objective is marked as archived
  () => objective.value && objective.value.archived
);

const formData = ref({});
const ownerOptions = computed(() => {
  return currentOwner.value && potentionalOwner.value
    ? [
        {
          label: currentOwner.value.name,
          value: currentOwner.value.ref.path,
        },
        {
          label: potentionalOwner.value.name,
          value: potentionalOwner.value.ref.path,
        },
      ]
    : [];
});
const hasNewOwner = computed(() => {
  // Return `true` if a new owner has been chosen for the current objective
  return currentOwner.value && currentOwner.value.ref.path !== formData.value.owner;
});

const displayLevelHelp = computed(() => {
  if (formData.value.owner === potentionalOwner.value?.ref.path) {
    return i18n.t('admin.objective.level.helpLift', {
      owner: currentOwner.value.name,
      newOwner: potentionalOwner.value.name,
    });
  }

  if (hasForeignContributors.value) {
    return i18n.t('admin.objective.level.helpForeign', {
      owner: currentOwner.value.name,
      contributors: foreignContributors.value.join(', '),
    });
  }

  return i18n.t('admin.objective.level.help', {
    owner: currentOwner.value.name,
  });
});

onMounted(async () => {
  await objectivePromise.value;

  // New objective
  if (!objective.value) {
    formData.value = {
      owner: itemRef.value.path,
    };

    currentOwner.value = {
      ref: itemRef.value,
      name: item.value.name,
    };

    const itemParent = item.value.department || item.value.organization;

    if (itemParent) {
      potentionalOwner.value = {
        ref: doc(db, itemParent.path),
        name: itemParent.name,
      };
    }

    return;
  }

  // Existing objective
  const { name, description, parent } = objective.value;

  formData.value = {
    name,
    description,
    period: getCurrentDateRange(objective.value),
    owner: parent.path,
  };

  currentOwner.value = {
    ref: doc(db, parent.path),
    name: parent.name,
  };

  const ownerParent = parent.department || parent.organization;

  if (ownerParent) {
    const ownerParentRef = doc(db, ownerParent);
    const ownerParentData = (await getDoc(ownerParentRef)).data();
    potentionalOwner.value = {
      ref: ownerParentRef,
      name: ownerParentData.name,
    };
  }
});

function getCurrentDateRange(obj) {
  if (obj.startDate && obj.endDate) {
    return [obj.startDate.toDate(), obj.endDate.toDate()];
  }
  if (obj.period) {
    return [obj.period.startDate.toDate(), obj.period.endDate.toDate()];
  }
  return null;
}

function useSuggestedPeriod() {
  formData.value.period = [
    props.newestObjective.startDate.toDate(),
    props.newestObjective.endDate.toDate(),
  ];
}

const isSuggestedPeriod = computed(
  () =>
    formData.value.period &&
    props.newestObjective?.startDate &&
    props.newestObjective?.endDate &&
    isEqual(formData.value.period[0], props.newestObjective.startDate.toDate()) &&
    isEqual(formData.value.period[1], props.newestObjective.endDate.toDate())
);

async function save() {
  isLoading.value = true;
  const { next } = drawer.value;

  try {
    const { name, description, weight, period, owner } = formData.value;
    const [start, end] = period;

    const targetParentRef =
      isLiftable.value && owner === potentionalOwner.value.ref.path
        ? potentionalOwner.value.ref
        : currentOwner.value.ref;

    if (objective.value) {
      // Update existing objective
      const data = {
        name,
        description: description || '',
        weight: weight || 1,
        parent: targetParentRef,
      };

      if (start && end) {
        data.startDate = start;
        data.endDate = end;
        if (period) {
          data.period = deleteField();
        }
      } else {
        data.period = period;
      }

      await Objective.update(objective.value.id, data);

      if (hasNewOwner.value) {
        await syncObjectiveContributors(objective.value.id);
      }

      emit('update', objectiveRef.value);
    } else {
      // Create new objective
      const createdObjectiveRef = await Objective.create({
        name,
        description: description || '',
        weight: weight || 1,
        parent: itemRef.value,
        startDate: start,
        endDate: end,
      });

      objectiveRef.value = createdObjectiveRef;

      if (hasNewOwner.value) {
        await Objective.update(createdObjectiveRef.id, { parent: targetParentRef });
        await syncObjectiveContributors(createdObjectiveRef.id);
      }

      emit('create', objectiveRef.value);
    }

    next();
  } catch {
    next(false);
    toast.error(i18n.t('toaster.error.save'));
  }
  isLoading.value = false;
}

async function archive() {
  isLoading.value = true;
  try {
    await Objective.archive(objective.value.id);
    emit('archive', objective.value.id);
  } catch (error) {
    toast.error(i18n.t('toaster.error.archive', { document: objective.value.name }));
  }
  isLoading.value = false;
}

async function restore() {
  try {
    await Objective.restore(objective.value.id);
    emit('restore', objective.value.id);
  } catch {
    toast.error(i18n.t('toaster.error.restore', { document: objective.value.name }));
  }
}
</script>

<template>
  <PagedDrawerWrapper ref="drawer" :visible="!!drawer">
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(isEditMode ? 'admin.objective.change' : 'admin.objective.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(isEditMode ? 'objective.updated' : 'admin.objective.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ cancel }">
      <FormSection>
        <FormComponent
          v-model="formData.name"
          input-type="textarea"
          name="name"
          :disabled="isArchived"
          :rows="2"
          :label="$t('fields.name')"
          rules="required"
        />

        <FormComponent
          v-model="formData.description"
          input-type="textarea"
          name="description"
          :disabled="isArchived"
          :rows="2"
          :label="$t('fields.description')"
        />

        <FormComponent
          v-model="formData.period"
          input-type="date"
          name="period"
          :disabled="isArchived"
          :label="$t('fields.period')"
          :placeholder="$t('general.selectRange')"
          :date-picker-config="{ mode: 'range' }"
          rules="required"
        />

        <PeriodShortcut
          v-if="newestObjective?.startDate && newestObjective?.endDate"
          class="period-suggestion"
          :label="$t('admin.objective.useLastPeriod')"
          :start-date="newestObjective.startDate.toDate()"
          :end-date="newestObjective.endDate.toDate()"
          :active="isSuggestedPeriod"
          @click="useSuggestedPeriod"
        />

        <FormComponent
          v-if="isLiftable"
          v-model="formData.owner"
          name="owner"
          input-type="custom-select"
          :label="$t('admin.objective.level.label')"
          :helptext="displayLevelHelp"
          :options="ownerOptions"
          :disabled="isArchived"
          :can-clear="false"
          rules="required"
        />

        <PktAlert v-if="hasNewOwner" skin="info">
          <p>{{ $t('admin.objective.level.liftWarning1') }}</p>
          <p v-if="!hasParentEditRights">
            {{
              $t('admin.objective.level.liftWarning2', {
                newOwner: potentionalOwner.name,
              })
            }}
          </p>
        </PktAlert>

        <template #actions="{ submit, disabled }">
          <BtnCancel :disabled="isLoading || isArchived" @on-click="cancel" />
          <BtnSave
            :text="isEditMode ? $t('btn.updateObjective') : $t('btn.createObjective')"
            variant="label-only"
            :disabled="disabled || isLoading || isArchived"
            @on-click="submit(save)"
          />
        </template>
      </FormSection>
    </template>

    <template #done="{ isSuccess, reset, close }">
      <div class="button-row button-row--left">
        <template v-if="!isSuccess">
          <PktButton skin="secondary" @on-click="reset">
            {{ $t('btn.back') }}
          </PktButton>
        </template>
        <template v-else-if="objective">
          <PktButton skin="tertiary" @on-click="close">
            {{ $t('btn.close') }}
          </PktButton>
          <PktButton
            v-if="objective.id"
            skin="secondary"
            @on-click="$emit('add-key-result')"
          >
            {{ $t('btn.createKeyResult') }}
          </PktButton>
        </template>
      </div>
    </template>

    <template #footer="{ isDone }">
      <template v-if="isEditMode && !isDone">
        <ArchivedRestore v-if="isArchived" :restore="restore" object-type="objective" />
        <div v-else class="button-row">
          <BtnDelete
            :disabled="isLoading"
            :text="$t('admin.objective.delete')"
            @on-click="archive"
          />
        </div>
      </template>
    </template>
  </PagedDrawerWrapper>
</template>

<style lang="scss" scoped>
.period-suggestion {
  align-self: flex-start;
  margin: -0.75rem 0 1rem 0;
}
</style>

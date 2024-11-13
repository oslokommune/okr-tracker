<script setup>
import { computed, ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import KeyResult from '@/db/KeyResult';
import { PktButton } from '@oslokommune/punkt-vue';
import { BtnSave } from '@/components/generic/form';
import HTMLOutput from '@/components/HTMLOutput.vue';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';

const toast = useToast();
const i18n = useI18n();

const props = defineProps({
  keyResult: {
    type: Object,
    required: true,
  },
});

const notes = computed(() => props.keyResult.notes);

const editNotes = ref(false);
const isLoading = ref(false);

async function save(values) {
  if (values.notes) {
    isLoading.value = true;

    try {
      await KeyResult.update(props.keyResult.id, { notes: values.notes });
      toast.show(i18n.t('toaster.savedChanges'));
    } catch {
      toast.error(i18n.t('toaster.error.notes'));
    }

    editNotes.value = false;
    isLoading.value = false;
  }
}
</script>

<template>
  <WidgetWrapper :title="$t('keyResultsPage.notes.heading')" size="small" collapsable>
    <div class="notes">
      <FormSection v-if="editNotes">
        <FormComponent
          input-type="textarea"
          name="notes"
          :value="notes"
          :disabled="isLoading"
          :rows="5"
          :label="$t('keyResultsPage.notes.heading')"
        />

        <template #actions="{ submit, disabled }">
          <BtnSave :disabled="isLoading || disabled" @on-click="submit(save)" />
          <PktButton skin="tertiary" @on-click="editNotes = false">
            {{ $t('btn.close') }}
          </PktButton>
        </template>
      </FormSection>

      <div v-else class="notes__empty">
        <HTMLOutput v-if="notes" :html="notes" />
        <em v-else>{{ $t('keyResultPage.notes.empty') }}</em>

        <PktButton
          v-tooltip="$t('btn.editNotes')"
          size="small"
          skin="tertiary"
          variant="icon-only"
          icon-name="edit"
          @on-click="editNotes = !editNotes"
        />
      </div>
    </div>
  </WidgetWrapper>
</template>

<style lang="scss" scoped>
.notes {
  padding: 1rem;
  background-color: var(--pkt-color-brand-neutrals-white);

  &__markdown {
    flex: 1;
  }

  &__empty {
    display: flex;
    gap: 1rem;

    .pkt-btn {
      margin-left: auto;
    }
  }
}
</style>

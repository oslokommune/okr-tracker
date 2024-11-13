<script setup>
import { ref } from 'vue';
import { dateLong } from '@/util';
import { formattedPeriod } from '@/util/okr';
import UserLink from '@/components/UserLink.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import WidgetWrapper from './WidgetWrapper.vue';

defineProps({
  objective: {
    type: Object,
    required: true,
  },
});

const chosenProfileId = ref(null);
const formatDate = (date) => dateLong(date.toDate());
</script>

<template>
  <WidgetWrapper v-if="objective" :title="$t('general.details')" size="small" collapsable>
    <div class="details">
      <div v-if="formattedPeriod(objective)" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.period') }}</h3>
        <div class="details__item-value">{{ formattedPeriod(objective) }}</div>
      </div>

      <div v-if="objective.created" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.created') }}</h3>
        <div class="details__item-value">{{ formatDate(objective.created) }}</div>
      </div>

      <div v-if="objective.createdBy" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.createdBy') }}</h3>
        <div class="details__item-value">
          <UserLink :user="objective.createdBy" @activate="chosenProfileId = $event" />
        </div>
      </div>

      <div v-if="objective.edited" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.edited') }}</h3>
        <div class="details__item-value">{{ formatDate(objective.edited) }}</div>
      </div>

      <div v-if="objective.editedBy" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.editedBy') }}</h3>
        <div class="details__item-value">
          <UserLink :user="objective.editedBy" @activate="chosenProfileId = $event" />
        </div>
      </div>
    </div>

    <ProfileModal
      v-if="!!chosenProfileId"
      :user-id="chosenProfileId"
      @close="chosenProfileId = null"
    />
  </WidgetWrapper>
</template>

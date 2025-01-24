<script setup>
import { computed, ref } from 'vue';
import { dateLong } from '@/util';
import { formattedPeriod } from '@/util/okr';
import UserLink from '@/components/UserLink.vue';
import ProfileModal from '@/components/modals/ProfileModal.vue';
import Widget from './WidgetWrapper.vue';

const props = defineProps({
  keyResult: {
    type: Object,
    required: true,
  },
});

const objective = computed(() => props.keyResult.objective);
const chosenProfileId = ref(null);
const formatDate = (date) => dateLong(date.toDate());
</script>

<template>
  <Widget :title="$t('general.details')" size="small" collapsable>
    <div class="details">
      <div v-if="objective && formattedPeriod(objective)" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.period') }}</h3>
        <div class="details__item-value">
          {{ formattedPeriod(objective) }}
        </div>
      </div>

      <div v-if="keyResult.created" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.created') }}</h3>
        <div class="details__item-value">{{ formatDate(keyResult.created) }}</div>
      </div>

      <div v-if="keyResult.createdBy" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.createdBy') }}</h3>
        <div class="details__item-value">
          <UserLink :user="keyResult.createdBy" @activate="chosenProfileId = $event" />
        </div>
      </div>

      <div v-if="keyResult.edited" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.edited') }}</h3>
        <div class="details__item-value">{{ formatDate(keyResult.edited) }}</div>
      </div>

      <div v-if="keyResult.editedBy" class="details__item">
        <h3 class="details__item-title">{{ $t('objective.editedBy') }}</h3>
        <div class="details__item-value">
          <UserLink :user="keyResult.editedBy" @activate="chosenProfileId = $event" />
        </div>
      </div>

      <div v-if="keyResult.startValue !== undefined" class="details__item">
        <h3 class="details__item-title">{{ $t('keyResult.startValue') }}</h3>
        <div class="details__item-value"># {{ keyResult.startValue }}</div>
      </div>

      <div v-if="keyResult.targetValue !== undefined" class="details__item">
        <h3 class="details__item-title">{{ $t('keyResult.targetValue') }}</h3>
        <div class="details__item-value"># {{ keyResult.targetValue }}</div>
      </div>

      <div v-if="keyResult.unit" class="details__item">
        <h3 class="details__item-title">{{ $t('keyResult.unit') }}</h3>
        <div class="details__item-value">{{ keyResult.unit }}</div>
      </div>
    </div>

    <ProfileModal
      v-if="!!chosenProfileId"
      :user-id="chosenProfileId"
      @close="chosenProfileId = null"
    />
  </Widget>
</template>

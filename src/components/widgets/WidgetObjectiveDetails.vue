<script setup>
import { ref } from 'vue';
import { dateLong } from '@/util';
import { formattedPeriod } from '@/util/okr';
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
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            {{ formattedPeriod(objective) }}
          </div>
        </div>
      </div>

      <div v-if="objective.created" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(objective.created) }}</div>
        </div>
      </div>

      <div v-if="objective.createdBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            <div class="details__item-value user">
              <a
                v-if="objective.createdBy.id"
                @click="chosenProfileId = objective.createdBy.id"
              >
                <span>
                  {{ objective.createdBy.displayName || objective.createdBy.id }}
                </span>
              </a>
              <span v-else>{{ objective.createdBy }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="objective.edited" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(objective.edited) }}</div>
        </div>
      </div>

      <div v-if="objective.editedBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value user">
            <a
              v-if="objective.editedBy.id"
              @click="chosenProfileId = objective.editedBy.id"
            >
              <span>
                {{ objective.editedBy.displayName || objective.editedBy.id }}
              </span>
            </a>
            <span v-else>{{ objective.editedBy }}</span>
          </div>
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

<style lang="scss" scoped>
.user {
  padding: 0.2rem;
  cursor: pointer;

  &:hover {
    background: rgba(var(--color-grayscale-50-rgb), 0.1);
  }
}
</style>

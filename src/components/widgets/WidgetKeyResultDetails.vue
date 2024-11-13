<script setup>
import { computed, ref } from 'vue';
import { dateLong } from '@/util';
import { formattedPeriod } from '@/util/okr';
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
      <div v-if="objective" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.belongsTo') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            <RouterLink
              :to="{
                name: 'ObjectiveHome',
                params: { objectiveId: objective.id },
              }"
            >
              {{ objective.name }}
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-if="objective && formattedPeriod(objective)" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.period') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">
            {{ formattedPeriod(objective) }}
          </div>
        </div>
      </div>

      <div v-if="keyResult.created" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.created') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(keyResult.created) }}</div>
        </div>
      </div>

      <div v-if="keyResult.createdBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.createdBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value">
            <div class="details__item-value user">
              <a
                v-if="keyResult.createdBy.id"
                @click="chosenProfileId = keyResult.createdBy.id"
              >
                <span>
                  {{ keyResult.createdBy.displayName || keyResult.createdBy.id }}
                </span>
              </a>
              <span v-else>{{ activeKeyResult.createdBy }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="keyResult.edited" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.edited') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ formatDate(keyResult.edited) }}</div>
        </div>
      </div>

      <div v-if="keyResult.editedBy" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('objective.editedBy') }}</h3>

        <div class="details__item-body">
          <div class="details__item-value user">
            <a
              v-if="keyResult.editedBy.id"
              @click="chosenProfileId = keyResult.editedBy.id"
            >
              <span>
                {{ keyResult.editedBy.displayName || keyResult.editedBy.id }}
              </span>
            </a>
            <span v-else>{{ keyResult.editedBy }}</span>
          </div>
        </div>
      </div>

      <div v-if="keyResult.startValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.startValue') }}</h3>
        <div class="details__item-body">
          <span class="details__item-icon">#</span>
          <div class="details__item-value">{{ keyResult.startValue }}</div>
        </div>
      </div>

      <div v-if="keyResult.targetValue !== undefined" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.targetValue') }}</h3>
        <div class="details__item-body">
          <span class="details__item-icon">#</span>
          <div class="details__item-value">{{ keyResult.targetValue }}</div>
        </div>
      </div>

      <div v-if="keyResult.unit" class="details__item">
        <h3 class="title-3 details__item-heading">{{ $t('keyResult.unit') }}</h3>
        <div class="details__item-body">
          <div class="details__item-value">{{ keyResult.unit }}</div>
        </div>
      </div>
    </div>

    <ProfileModal
      v-if="!!chosenProfileId"
      :user-id="chosenProfileId"
      @close="chosenProfileId = null"
    />
  </Widget>
</template>

<style lang="scss" scoped>
.user {
  padding: 0.2rem;
  cursor: pointer;

  &:hover {
    background: rgba(var(--color-grayscale-50-rgb), 0.1);
  }
}

.details__item-icon {
  margin-top: 0;
  font-weight: 900;
  user-select: none;
}
</style>

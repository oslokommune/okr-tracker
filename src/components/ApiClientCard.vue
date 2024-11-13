<script setup>
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue';
import { BtnDelete } from '@/components/generic/form';
import ApiClientTag from '@/components/ApiClientTag.vue';

const toast = useToast();
const i18n = useI18n();

defineProps({
  client: {
    type: Object,
    required: true,
  },
  visibleSecret: {
    type: String,
    required: false,
    default: null,
  },
  loading: {
    type: Boolean,
    required: false,
    default: false,
  },
});

function copyCredential(elementId) {
  const inputElement = document.getElementById(elementId);
  if (inputElement) {
    navigator.clipboard.writeText(inputElement.value).then(() => {
      toast.success(i18n.t('toaster.action.copiedToClipboard'));
    });
  }
}
</script>

<template>
  <div class="api-client-card">
    <pkt-icon name="crane" class="api-client-card__icon pkt-show-tablet-up" />

    <div class="api-client-card__content">
      <header class="api-client-card__title">
        <span class="pkt-txt-18-medium">{{ client.name }}</span>
        <div class="api-client-card__actions">
          <PktButton
            v-tooltip="$t('integration.action.edit')"
            size="small"
            skin="tertiary"
            variant="icon-only"
            icon-name="edit"
            :disabled="loading"
            @click="$emit('edit', client)"
          />
          <BtnDelete
            v-tooltip="$t('integration.action.delete')"
            size="small"
            :confirm-help="$t('integration.warning.delete')"
            variant="icon-only"
            :disabled="loading"
            @on-click="$emit('delete', client)"
          />
        </div>
      </header>

      <div class="api-client-card__body">
        <div class="api-client-card__credentials mb-size-16">
          <div class="api-client-card__credential">
            <label :for="`${client.id}_clientId`">
              <PktIcon name="cogwheel" /> {{ $t('integration.clientId') }}
            </label>
            <div>
              <input
                :id="`${client.id}_clientId`"
                type="text"
                :value="client.clientId"
                :readonly="true"
              />
              <PktButton
                v-tooltip="$t('tooltip.copyToClipboard')"
                size="small"
                skin="tertiary"
                variant="icon-only"
                icon-name="copy"
                @on-click="copyCredential(`${client.id}_clientId`)"
              />
            </div>
          </div>

          <div
            :class="[
              'api-client-card__credential',
              {
                'api-client-card__credential--new': visibleSecret,
              },
            ]"
          >
            <label :for="`${client.id}_clientSecret`">
              <PktIcon name="lock-locked" /> {{ $t('integration.clientSecret') }}
            </label>
            <div>
              <input
                :id="`${client.id}_clientSecret`"
                type="text"
                :value="visibleSecret || '∗'.repeat(36)"
                :readonly="true"
                :disabled="!visibleSecret"
              />
              <PktButton
                v-if="visibleSecret"
                v-tooltip="$t('tooltip.copyToClipboard')"
                size="small"
                skin="tertiary"
                variant="icon-only"
                icon-name="copy"
                @on-click="copyCredential(`${client.id}_clientSecret`)"
              />
              <BtnDelete
                v-else
                v-tooltip="$t('integration.action.rotate')"
                size="small"
                :confirm-text="$t('integration.action.confirmRotate')"
                :confirm-help="$t('integration.warning.rotate')"
                variant="icon-only"
                icon-name="arrow-circle"
                :disabled="loading"
                @on-click="$emit('rotate', client)"
              />
            </div>
          </div>
        </div>

        <PktAlert v-if="visibleSecret" skin="warning" class="mb-size-16">
          <i18n-t keypath="integration.warning.secret" tag="p">
            <template #closeLink>
              <a @click="$emit('hide-secret')">{{
                $t('integration.warning.secretCloseText')
              }}</a>
            </template>
          </i18n-t>
        </PktAlert>

        <div v-if="client.description" class="api-client-card__description">
          {{ client.description }}
        </div>

        <div class="api-client-card__tags">
          <ApiClientTag
            icon="edit"
            :i18n-key="`integration.tag.${client.edited ? 'edited' : 'created'}`"
            :timestamp="client.edited ? client.edited : client.created"
            :user="client.edited ? client.editedBy : client.createdBy"
          />
          <ApiClientTag
            v-if="client.rotated"
            icon="arrow-circle"
            i18n-key="integration.tag.lastRotated"
            :timestamp="client.rotated"
            :user="client.rotatedBy"
            time-as-distance
          />
          <ApiClientTag
            icon="heart"
            :i18n-key="`integration.tag.${client.used ? 'lastActivity' : 'noActivity'}`"
            :timestamp="client.used"
            time-as-distance
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/breakpoints' as *;
@use '@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography' as *;

.api-client-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border: 4px solid var(--color-gray);

  &__icon {
    min-width: 1.5rem;
    min-height: 1.5rem;
    margin-top: 0.5rem;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  &__title {
    display: flex;
    gap: 1rem;
    align-items: center;

    > :first-child {
      flex-grow: 1;
    }
  }

  &__actions {
    display: flex;
    gap: 0.25rem;
  }

  &__body {
    @include bp('tablet-up') {
      padding-right: 2.5rem;
    }
  }

  &__credentials {
    display: flex;
    flex-direction: column;
  }

  &__credential {
    width: 100%;
    margin-right: auto;
    padding: 1rem;
    background-color: var(--color-gray);

    &--new {
      background-color: var(--color-green-light);
    }

    @include bp('tablet-up') {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }

    label {
      display: flex;
      flex-grow: 1;
      gap: 0.5rem;
      align-items: center;
    }

    > div {
      display: flex;
    }

    input {
      box-sizing: content-box;
      min-width: 36ch;
      font-family: monospace;
      background-color: transparent;
      border: 0;
      outline: 0;
      @include get-text('pkt-txt-14-medium');

      @include bp('phablet-up') {
        @include get-text('pkt-txt-16-medium');
      }

      @include bp('tablet-up') {
        @include get-text('pkt-txt-18-medium');
      }
    }

    button:hover {
      background-color: transparent;
      border-color: transparent;
    }
  }

  &__description {
    margin: 0.5rem 0 1rem 0;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-top: 0.5rem;
  }
}
</style>

<script setup>
import { computed, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/store/auth';
import { PktButton } from '@oslokommune/punkt-vue';
import UserProfile from '@/components/UserProfile.vue';

const i18n = useI18n();

const authStore = useAuthStore();
const { user, isSuperAdmin, isAdmin } = storeToRefs(authStore);
const { signOut } = authStore;

const closeParent = inject('closeNavMenuDropdown', false);

const footerLinks = computed(() => {
  const links = [];

  if (isAdmin.value) {
    links.push({
      label: i18n.t('general.admin'),
      icon: 'cogwheel',
      route: { name: 'Admin' },
    });
  }

  links.push({
    label: i18n.t('general.api'),
    icon: 'document-code',
    route: { name: 'Api' },
  });

  links.push({
    label: i18n.t('general.help'),
    icon: 'question',
    route: { name: 'Help' },
  });

  return links;
});

function wrapNavigate(handler, event) {
  if (closeParent) {
    closeParent();
  }
  handler(event);
}
</script>

<template>
  <aside v-if="user" class="user-menu-dropdown">
    <div class="user-menu-dropdown__header">
      <div class="user">
        <h1 class="title-2">{{ user.displayName }}</h1>
        <ul class="user__access pkt-txt-12-medium">
          <template v-if="isSuperAdmin">
            <li v-tooltip.bottom="$t('user.hasSuperAdmin')">
              {{ $t('user.superAdmin') }}
            </li>
          </template>
          <template v-if="isAdmin">
            <li v-tooltip.bottom="$t('user.hasAdmin')">{{ $t('user.admin') }}</li>
          </template>
        </ul>
      </div>

      <PktButton
        size="small"
        skin="tertiary"
        variant="icon-left"
        icon-name="exit"
        :text="$t('general.signOut')"
        @on-click="signOut"
      />
    </div>

    <div class="user-menu-dropdown__body">
      <UserProfile :user-id="user.id" @save="closeParent" />
    </div>

    <div class="user-menu-dropdown__footer">
      <RouterLink
        v-for="link in footerLinks"
        v-slot="{ href, navigate }"
        :key="link.route.name"
        :to="link.route"
        custom
      >
        <a
          :href="href"
          class="pkt-link pkt-link--icon-left"
          tabindex="0"
          @click="wrapNavigate(navigate, $event)"
        >
          <PktIcon class="pkt-link__icon" :name="link.icon" />
          {{ link.label }}
        </a>
      </RouterLink>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
$-dropdown-max-height: calc(100vh - 3.5rem);

.user-menu-dropdown {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100vw;
  height: $-dropdown-max-height;

  @include bp('tablet-up') {
    width: 45rem;
    height: auto;
    max-height: $-dropdown-max-height;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    background-color: var(--color-yellow);

    .pkt-btn {
      &:hover {
        background-color: var(--color-yellow-50);
        border-color: var(--color-yellow-50);
      }
      &:focus {
        color: var(--color-grayscale-70);
        background-color: var(--color-yellow-50);
      }
    }
  }

  &__body {
    flex: 1;
    padding: 0 1.5rem;
    overflow-y: auto;
  }

  &__footer {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    border-top: 1px solid var(--color-grayscale-20);

    a:nth-last-child(2) {
      margin-left: auto;
    }
  }
}

.user {
  display: flex;
  flex-direction: column;

  &__access {
    display: flex;
    gap: 0.2rem;

    li:not(:last-of-type):after {
      margin-left: 0.2rem;
      content: '/';
    }
  }
}
</style>

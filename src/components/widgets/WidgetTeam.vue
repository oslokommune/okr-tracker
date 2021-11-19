<template>
  <widget v-if="activeItem.team" :title="$t('general.team')">
    <empty-state
      v-if="!activeItem.team.length"
      :icon="'user-ninja'"
      :heading="$t('empty.team.heading')"
      :body="$t('empty.team.body')"
    />

    <template v-if="director">
      <h4 class="user__title">{{ $t('user.position.groups.director') }}</h4>
      <ul class="users__list">
        <li class="user">
          <span class="user__name">{{ director.displayName || director.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="departmentDirector">
      <h4 class="user__title">{{ $t('user.position.groups.departmentDirector') }}</h4>
      <ul class="users__list">
        <li class="user">
          <span v-if="departmentDirector.id" class="user__name">
            {{ departmentDirector.displayName || departmentDirector.id }}'
          </span>
        </li>
      </ul>
    </template>

    <template v-if="productOwner">
      <div class="user__title">{{ $t('user.position.groups.productOwner') }}</div>
      <ul class="users__list">
        <li class="user">
          <span v-if="productOwner.id" class="user__name">{{ productOwner.displayName || productOwner.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="teamLead">
      <div class="user__title">{{ $t('user.position.groups.teamLead') }}</div>
      <ul class="users__list">
        <li class="user">
          <span v-if="teamLead.id" class="user__name">{{ teamLead.displayName || teamLead.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="techLead">
      <div class="user__title">{{ $t('user.position.groups.techLead') }}</div>
      <ul class="users__list">
        <li class="user">
          <span v-if="techLead.id" class="user__name">{{ techLead.displayName || techLead.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="designers.length > 0">
      <div class="user__title">{{ $t('user.position.groups.designers') }}</div>
      <ul class="users__list">
        <li v-for="design in designers" :key="design.id" class="user">
          <span class="user__name">{{ design.displayName || design.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="developers.length > 0">
      <div class="user__title">{{ $t('user.position.groups.developers') }}</div>
      <ul class="users__list">
        <li v-for="dev in developers" :key="dev.id" class="user">
          <span class="user__name">{{ dev.displayName || dev.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="administration.length > 0">
      <div class="user__title">{{ $t('user.position.groups.administration') }}</div>
      <ul class="users__list">
        <li v-for="adm in administration" :key="adm.id" class="user">
          <span class="user__name">{{ adm.displayName || adm.id }}</span>
        </li>
      </ul>
    </template>

    <template v-if="others.length > 0">
      <div class="user__title">{{ $t('user.position.groups.others') }}</div>
      <ul class="users__list">
        <li v-for="user in others" :key="user.id" class="user">
          <span class="user__name">{{ user.displayName || user.id }}</span>
        </li>
      </ul>
    </template>
    <router-link v-if="memberOrAdmin" :to="{ name: 'ItemAdmin' }" class="btn btn--fw btn--ter">
      {{ $t('btn.add') }}
    </router-link>
  </widget>
</template>

<script>
import { mapState } from 'vuex';
import { possibleDevelopers, possibleAdm, possibleDesigners } from '@/config/jobPositions';

export default {
  name: 'WidgetTeam',

  components: {
    Widget: () => import('./WidgetWrapper.vue'),
    EmptyState: () => import('@/components/EmptyState.vue'),
  },

  data: () => ({
    developers: [],
    designers: [],
    administration: [],
    others: [],
    techLead: null,
    teamLead: null,
    director: null,
    productOwner: null,
    departmentDirector: null,
  }),

  computed: {
    ...mapState(['activeItem', 'user']),

    memberOrAdmin() {
      try {
        const isAdmin = this.user.admin;
        const isMember = this.activeItem.team.map(({ id }) => id).includes(this.user.id);
        return isAdmin || isMember;
      } catch {
        return false;
      }
    },
  },

  watch: {
    activeItem: {
      immediate: true,
      deep: true,
      handler() {
        this.developers = [];
        this.designers = [];
        this.administration = [];
        this.others = [];
        this.director = null;
        this.techLead = null;
        this.teamLead = null;
        this.productOwner = null;
        this.departmentDirector = null;

        this.activeItem.team.forEach((employee) => {
          if (possibleDevelopers.includes(employee.position)) {
            this.developers.push(employee);
          } else if (possibleDesigners.includes(employee.position)) {
            this.designers.push(employee);
          } else if (possibleAdm.includes(employee.position)) {
            this.administration.push(employee);
          } else if (employee.position === 'director') {
            this.director = employee;
          } else if (employee.position === 'techLead') {
            this.techLead = employee;
          } else if (employee.position === 'teamLead') {
            this.teamLead = employee;
          } else if (employee.position === 'productOwner') {
            this.productOwner = employee;
          } else if (employee.position === 'departmentDirector') {
            this.departmentDirector = employee;
          } else {
            this.others.push(employee);
          }
        });
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.users__list {
  display: flex;
  flex-direction: column;
}

.user__link {
  display: flex;
  align-items: center;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  word-break: break-all;
}

.user {
  padding: 0.2rem;

  &:hover {
    background: rgba(var(--color-grey-500-rgb), 0.1);
  }
}

.user__title {
  margin-top: 1rem;
  padding: 0.2rem;
  color: var(--color-grey-300);
  font-weight: 500;
  font-size: typography.$font-size-2;
  letter-spacing: -0.03rem;
}
</style>

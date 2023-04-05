<template>
  <div class="container">
    <main class="main">
      <section class="item-info">
        <div
          v-if="activeItem.missionStatement || activeItem.targetAudience"
          class="item-info__group"
        >
          <h3 class="title-3">{{ aboutItemTitle }}</h3>

          <div class="item-info__content">
            <div v-if="activeItem.missionStatement" class="item-info__box">
              <h4 class="title-2">
                <pkt-icon name="hands-globe" />{{ $t('document.mission') }}
              </h4>
              <HTML-output :html="activeItem.missionStatement" />
            </div>

            <div v-if="activeItem.targetAudience" class="item-info__box">
              <h3 class="title-2">
                <pkt-icon name="two-people-dancing" />{{ $t('dashboard.targetAudience') }}
              </h3>
              <HTML-output :html="activeItem.targetAudience" />
            </div>
          </div>
        </div>

        <div v-if="children" class="item-info__group">
          <h3 class="title-3">{{ childrenTitle }}</h3>

          <div class="item-info__content item-info__content--grid">
            <div
              v-for="child in children"
              :key="child.id"
              class="item-info__box item-info__box--link"
            >
              <h4 class="title-2">{{ child.name }}</h4>
              <HTML-output :html="child.missionStatement" />
            </div>
          </div>
        </div>
      </section>

      <section v-if="teamMembers" class="item-info">
        <div class="item-info__group">
          <h3 class="title-3">{{ $t('general.team') }}</h3>

          <role-members
            v-for="role in sortByDisplayOrder(Object.keys(teamMembers))"
            :key="role"
            :role="role"
            :members-with-role="teamMembers[role]"
            @openModal="openProfileModal"
          />
        </div>

        <profile-modal
          v-if="showProfileModal"
          :id="chosenProfileId"
          @close="closeProfileModal"
        />
      </section>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  possibleDevelopers,
  possibleAdm,
  possibleDesigners,
  displayOrder,
} from '@/config/jobPositions';
import HTMLOutput from '@/components/HTMLOutput.vue';
import getActiveItemType from '@/util/getActiveItemType';

export default {
  name: 'ItemAbout',

  components: {
    HTMLOutput,
    RoleMembers: () => import('@/components/RoleMembers.vue'),
    ProfileModal: () => import('@/components/modals/ProfileModal.vue'),
  },

  data: () => ({
    aboutItemTitle: null,
    childrenTitle: null,
    children: [],
    teamMembers: {},
    showProfileModal: false,
    chosenProfileId: null,
  }),

  computed: {
    ...mapState(['activeItem', 'departments', 'products']),
  },

  watch: {
    activeItem: {
      immediate: true,
      handler(item) {
        const itemType = getActiveItemType(item);

        if (itemType === 'organization') {
          this.aboutItemTitle = this.$t('about.aboutOrganization');
          this.childrenTitle = this.$t('general.departments');
          this.children = this.departments.filter(
            (department) => department.organization.id === this.activeItem.id
          );
        } else if (itemType === 'department') {
          this.aboutItemTitle = this.$t('about.aboutDepartment');
          this.childrenTitle = this.$t('general.products');
          this.children = this.products.filter(
            (product) => product.department.id === this.activeItem.id
          );
        } else if (itemType === 'product') {
          this.aboutItemTitle = this.$t('about.aboutProduct');
          this.childrenTitle = null;
          this.children = null;
        }

        this.teamMembers = {};

        this.activeItem.team.forEach((employee) => {
          if (!employee.position) {
            if (!this.teamMembers.others) {
              this.teamMembers.others = [employee];
            } else {
              this.teamMembers.others.push(employee);
            }
          } else if (possibleDevelopers.includes(employee.position)) {
            if (!this.teamMembers.developers) {
              this.teamMembers.developers = [employee];
            } else {
              this.teamMembers.developers.push(employee);
            }
          } else if (possibleDesigners.includes(employee.position)) {
            if (!this.teamMembers.designers) {
              this.teamMembers.designers = [employee];
            } else {
              this.teamMembers.designers.push(employee);
            }
          } else if (possibleAdm.includes(employee.position)) {
            if (!this.teamMembers.administration) {
              this.teamMembers.administration = [employee];
            } else {
              this.teamMembers.administration.push(employee);
            }
          } else if (!this.teamMembers[employee.position]) {
            this.teamMembers[employee.position] = [employee];
          } else {
            this.teamMembers[employee.position].push(employee);
          }
        });
      },
    },
  },

  methods: {
    openProfileModal(profileId) {
      this.showProfileModal = true;
      this.chosenProfileId = profileId;
    },

    closeProfileModal() {
      this.showProfileModal = false;
      this.chosenProfileId = null;
    },

    sortByDisplayOrder(roles) {
      return displayOrder.filter((role) => roles.includes(role));
    },
  },
};
</script>

<style lang="scss" scoped>
@use '@/styles/typography';

.item-info {
  position: relative;
  padding: 2rem 1.5rem;
  overflow: auto;
  background-color: var(--color-white);

  &__group {
    &:not(:first-of-type) {
      margin-top: 4rem;
    }

    .title-3 {
      margin-bottom: 1rem;
      color: var(--color-grayscale-40);
    }
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 2rem;

    @media screen and (min-width: bp(m)) {
      flex-direction: row;

      &--grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }

  &__box {
    flex: 1 1 0px;
    font-size: typography.$font-size-2;
    line-height: 1.5rem;

    .title-2 {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--color-blue-dark);

      svg {
        height: 1.5rem;
        margin-right: 0.75rem;
      }
    }
  }
}
</style>

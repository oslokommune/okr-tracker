<template>
  <div>
    <page-header :data="organization || {}"></page-header>

    <the-sub-nav v-if="organization" :document="organization" />

    <div class="content" v-if="organization">
      <div class="container container--sidebar">
        <document-sidebar
          :document="organization"
          :has-edit-permissions="hasEditPermissions"
          type="organization"
        ></document-sidebar>

        <main class="content--main content--padding">
          <document-summary
            :document="organization"
            :team="organizationDepartments"
            type="organization"
          ></document-summary>
          <hr />
          <objectives-list :document="organization"></objectives-list>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';
import ClickOutside from 'vue-click-outside';
import { serializeList, serializeDocument } from '@/db/db';
import slugify from '@/util/slugify';
import i18n from '@/locale/i18n';

import PageHeader from '@/components/PageHeader.vue';
import DocumentSidebar from '@/components/DocumentSidebar.vue';
import DocumentSummary from '@/components/DocumentSummary.vue';
import ObjectivesList from '@/components/ObjectivesList.vue';
import TheSubNav from '@/components/TheSubNav.vue';

export default {
  name: 'OrganizationHome',

  data: () => ({
    team: [],
  }),

  metaInfo() {
    return {
      title: `${this.organization ? this.organization.name : i18n.t('general.organization')} | ${i18n.t(
        'general.project'
      )}`,
    };
  },

  components: {
    ObjectivesList,
    DocumentSummary,
    DocumentSidebar,
    PageHeader,
    TheSubNav,
  },

  computed: {
    ...mapState(['user', 'organizationDepartments', 'organization']),

    slug() {
      return this.$route.params.slug;
    },

    queryParamPeriod() {
      return this.$route.query.period;
    },

    hasEditPermissions() {
      if (!this.user) return;
      return this.user.admin;
    },
  },

  watch: {
    slug(slug) {
      this.watchOrganization(slug);
    },

    organization() {
      this.setPeriod();
    },

    queryParamPeriod() {
      this.setPeriod();
    },
  },

  created() {
    if (!this.slug) return;
    this.watchOrganization(this.slug);
    this.setPeriod();
  },

  methods: {
    ...mapActions(['watchOrganization']),
    ...mapMutations(['SET_ACTIVE_PERIOD']),

    async setPeriod() {
      if (!this.organization) return;

      const periods = await this.organization.ref
        .collection('periods')
        .get()
        .then(serializeList)
        .then(docs => docs.filter(doc => doc.startDate.toDate() < new Date()))
        .then(docs =>
          docs.sort((a, b) => {
            if (a.startDate.seconds < b.startDate.seconds) return 1;
            if (a.startDate.seconds > b.startDate.seconds) return -1;
            return 0;
          })
        );

      let activePeriod;

      if (!this.queryParamPeriod) {
        const [firstPeriod] = periods;
        activePeriod = firstPeriod;
      } else {
        activePeriod = periods.find(period => slugify(period.name) === this.queryParamPeriod);
      }

      if (!activePeriod) {
        this.SET_ACTIVE_PERIOD(null);
      } else {
        activePeriod.ref.onSnapshot(snapshot => {
          const period = serializeDocument(snapshot);
          this.SET_ACTIVE_PERIOD(period);
        });
      }
    },
  },

  directives: {
    ClickOutside,
  },
};
</script>

<style lang="scss" scoped>
@import '../../styles/_colors.scss';

.sub-nav__element {
  cursor: pointer;
  user-select: none;
}

.team {
  &__list {
    display: flex;
    flex-wrap: wrap;
    margin: -0.25rem;
  }

  &__member {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 0.25rem;
    text-align: center;
  }

  &__image {
    width: 5rem;
    height: 5rem;
    border-radius: 2.5rem;
  }

  &__name {
    position: absolute;
    top: 5rem;
    left: -50%;
    z-index: 2;
    display: flex;
    justify-content: center;
    width: 200%;
    color: white;
    transform: translateY(-1rem);
    opacity: 0;
    transition: all 0.12s ease-in-out;
    user-select: none;
    pointer-events: none;

    & > span {
      padding: 0.25rem 0.5rem;
      background: $color-purple;
    }
  }
}
</style>

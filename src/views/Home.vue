<template>
  <div class="container">
    <aside class="aside aside--left">
      <widget :title="appOwner" :collapsable="true" size="small">
        <ul>
          <li v-for="org in tree" :key="`${org.id}-check`" style="margin-bottom: 1rem">
            <div class="pkt-form-group pkt-form-group--row">
              <input
                :id="org.id"
                type="checkbox"
                class="pkt-form-check-input"
                :checked="getCollapse('organization', org.slug)"
                @click="toggle('organization', org.slug)"
              />
              <label class="pkt-form-label" :for="org.id">
                {{ org.name }}
                <template v-if="org.children.length">
                  ({{ org.children.length }})
                </template>
              </label>
            </div>
            <ul v-if="getCollapse('organization', org.slug)">
              <li v-for="dept in org.children" :key="`${dept.id}-check`">
                <div class="pkt-form-group pkt-form-group--row indent">
                  <input
                    :id="dept.id"
                    type="checkbox"
                    class="pkt-form-check-input"
                    :checked="getCollapse('department', dept.slug)"
                    @click="toggle('department', dept.slug)"
                  />
                  <label class="pkt-form-label" :for="dept.id">
                    {{ dept.name }}
                  </label>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </widget>
    </aside>

    <ul v-if="user" class="main">
      <li v-if="!hasCheckedOrganizations" class="tree empty-state">
        {{ $t('general.emptyHome') }}
      </li>
      <template v-for="org in tree">
        <li v-if="getCollapse('organization', org.slug)" :key="org.id" class="tree">
          <item-row :data="org" class="tree__organization" type="organization"></item-row>
          <ul>
            <template v-for="dept in org.children">
              <li v-if="getCollapse('department', dept.slug)" :key="dept.id" class="card">
                <item-row :data="dept" type="department"></item-row>
                <ul>
                  <li v-for="prod in dept.children" :key="prod.id">
                    <item-row :data="prod" type="product"></item-row>
                  </li>
                </ul>
              </li>
            </template>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';
import WidgetWrapper from '@/components/widgets/WidgetWrapper.vue';

export default {
  name: 'Home',

  components: {
    ItemRow: () => import('@/components/ItemRow.vue'),
    Widget: WidgetWrapper,
  },

  computed: {
    ...mapGetters(['tree', 'hasCheckedOrganizations']),
    ...mapState(['user']),

    appOwner() {
      return import.meta.env.VITE_ORGANIZATION;
    },
  },

  methods: {
    ...mapActions(['update_preferences']),

    getCollapse(type, slug) {
      if (
        this.user.preferences.home === undefined ||
        this.user.preferences.home.collapse[type][slug] === undefined
      ) {
        return false;
      }
      return this.user.preferences.home.collapse[type][slug];
    },

    toggle(type, slug) {
      if (this.user.preferences.home === undefined) {
        this.user.preferences.home = {
          collapse: {
            organization: {},
            department: {},
          },
        };
      }
      if (this.user.preferences.home.collapse[type][slug] === undefined) {
        this.user.preferences.home.collapse[type][slug] =
          this.user.preferences.home.collapse[type][slug] === undefined;
      } else {
        this.user.preferences.home.collapse[type][slug] =
          !this.user.preferences.home.collapse[type][slug];
      }
      this.update_preferences();
    },
  },
};
</script>

<style lang="scss" scoped>
.tree {
  margin-bottom: 0.5rem;
  padding: 1rem 0;
  background-color: var(--color-white);
}

.tree__organization {
  padding: 0 1rem;
  text-transform: uppercase;
}

.pkt-form-group {
  margin-bottom: 0.5rem;
}

.indent {
  margin-left: 1rem;
}

.card {
  &:last-child {
    border-bottom: none;
  }
}

.empty-state {
  padding: 1.5rem;
}
</style>

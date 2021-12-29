<template>
  <div class="container">
    <div class="home-widget">
      <section class="widget">
        <header class="widget__header">
          <span class="widget__title">{{ appOwner }}</span>
          <button
            v-tooltip="isOpen ? $t('btn.minimize') : $t('btn.expand')"
            class="widget__toggle fas fa-fw"
            :class="isOpen ? 'fa-minus' : 'fa-plus'"
            @click="toggleCollapse"
          />
        </header>
        <div v-if="isOpen" class="widget__body">
          <ul>
            <li v-for="org in tree" :key="`${org.id}-check`" style="margin-bottom: 1rem">
              <div class="ods-form-group">
                <input
                  :id="org.id"
                  type="checkbox"
                  class="ods-form-radio"
                  :checked="getCollapse('organization', org.slug)"
                  @click="toggle('organization', org.slug)"
                />
                <label class="ods-form-label" :for="org.id">
                  {{ org.name }}
                  <span v-if="org.children.length"> ({{ org.children.length }}) </span>
                </label>
              </div>
              <ul v-if="getCollapse('organization', org.slug)">
                <li v-for="dept in org.children" :key="`${dept.id}-check`">
                  <div class="ods-form-group indent">
                    <input
                      :id="dept.id"
                      type="checkbox"
                      class="ods-form-radio"
                      :checked="getCollapse('department', dept.slug)"
                      @click="toggle('department', dept.slug)"
                    />
                    <label class="ods-form-label" :for="dept.id">{{ dept.name }}</label>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <ul v-if="user" class="home">
      <li v-if="!hasCheckedOrganizations" class="tree empty-state">
        {{ $t('general.emptyHome') }}
      </li>
      <template v-for="org in tree">
        <li v-if="getCollapse('organization', org.slug)" :key="org.id" class="tree">
          <item-row :data="org" class="tree__organization" type="organization"></item-row>
          <ul>
            <li v-for="dept in org.children" :key="dept.id" class="card">
              <item-row :data="dept" type="department"></item-row>
              <ul v-if="getCollapse('department', dept.slug)">
                <li v-for="prod in dept.children" :key="prod.id">
                  <item-row :data="prod" type="product"></item-row>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex';

export default {
  name: 'Home',

  components: {
    ItemRow: () => import('@/components/ItemRow.vue'),
  },

  data: () => ({
    isOpen: true,
  }),

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
      if (this.user.preferences.home === undefined || this.user.preferences.home.collapse[type][slug] === undefined) {
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
        this.user.preferences.home.collapse[type][slug] = this.user.preferences.home.collapse[type][slug] === undefined;
      } else {
        this.user.preferences.home.collapse[type][slug] = !this.user.preferences.home.collapse[type][slug];
      }
      this.update_preferences();
    },

    toggleCollapse() {
      this.isOpen = !this.isOpen;
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

.home {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(9.5);
    margin-left: span(0, 1);
  }
}

.home-widget {
  width: span(12);

  @media screen and (min-width: bp(m)) {
    width: span(2.5);
  }
}

.main-view {
  position: relative;
  width: span(12);
  padding: 1.5rem 0;

  @media screen and (min-width: bp(l)) {
    width: span(8, span(10));
  }
}

.indent {
  margin-left: 1rem;
}

.card {
  border-bottom: 3px solid var(--color-bg);

  &:last-child {
    border-bottom: none;
  }
}

.empty-state {
  padding: 1.5rem;
}

.widget__toggle {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: auto;
  margin-left: auto;
  padding: 0.5rem 0.75rem 0.5rem 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
}
</style>

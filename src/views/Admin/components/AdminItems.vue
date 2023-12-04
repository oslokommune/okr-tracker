<template>
  <div>
    <div class="pkt-grid pkt-grid--full">
      <div class="pkt-cell pkt-cell--span12 pkt-cell--span4-tablet-up">
        <h2 class="title-2">{{ $t('general.organizations') }}</h2>
        <div class="col">
          <div v-if="organizations.length > 10" class="search">
            <input
              v-model="queryOrgs"
              class="pkt-form-input"
              type="text"
              :placeholder="
                $t('admin.organization.search', { count: organizations.length })
              "
            />
          </div>
          <div class="col__body">
            <div
              v-for="organization in filteredOrgs"
              :key="organization.id"
              class="col__row"
            >
              <router-link
                class="col__link pkt-txt-16-medium"
                :to="itemLink(organization.slug)"
              >
                <pkt-icon class="icon" name="organization" />
                <span class="col__text">{{ organization.name }}</span>
                <pkt-icon v-if="organization.archived" class="icon" name="archive" />
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link
              v-if="user.superAdmin"
              class="create-link"
              :to="{ name: 'CreateOrganization' }"
              data-cy="create-organization"
            >
              {{ $t('btn.addOrganization') }}
            </router-link>
          </div>
        </div>
      </div>

      <div class="pkt-cell pkt-cell--span12 pkt-cell--span4-tablet-up">
        <h2 class="title-2">{{ $t('general.departments') }}</h2>
        <div class="col">
          <div v-if="departments.length > 10" class="search">
            <input
              v-model="queryDeps"
              class="pkt-form-input"
              type="text"
              :placeholder="$t('admin.department.search', { count: departments.length })"
            />
          </div>
          <div class="col__body">
            <div v-for="department in filteredDeps" :key="department.id" class="col__row">
              <router-link
                class="col__link pkt-txt-16-medium"
                :to="itemLink(department.slug)"
              >
                <pkt-icon class="icon" name="district" />
                <span class="col__text">{{ department.name }}</span>
                <pkt-icon v-if="department.archived" class="icon" name="archive" />
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link
              class="create-link"
              :to="{ name: 'CreateDepartment' }"
              data-cy="create-department"
            >
              {{ $t('btn.addDepartment') }}
            </router-link>
          </div>
        </div>
      </div>

      <div class="pkt-cell pkt-cell--span12 pkt-cell--span4-tablet-up">
        <h2 class="title-2">{{ $t('general.products') }}</h2>
        <div class="col">
          <div v-if="products.length > 10" class="search">
            <input
              v-model="queryProds"
              class="pkt-form-input"
              type="text"
              :placeholder="$t('admin.product.search', { count: products.length })"
            />
          </div>
          <div class="col__body">
            <div v-for="product in filteredProds" :key="product.id" class="col__row">
              <router-link
                class="col__link pkt-txt-16-medium"
                :to="itemLink(product.slug)"
              >
                <pkt-icon class="icon" name="house-heart" />
                <span class="col__text">{{ product.name }}</span>
                <pkt-icon v-if="product.archived" class="icon" name="archive" />
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link
              class="create-link"
              :to="{ name: 'CreateProduct' }"
              data-cy="create-product"
            >
              {{ $t('btn.addProduct') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="actions pkt-form-group pkt-form-group--row">
      <input
        id="showArchived"
        v-model="showArchived"
        type="checkbox"
        class="pkt-form-check-input"
      />
      <label class="pkt-form-label" for="showArchived">
        {{ $t('admin.objects.showArchived') }}
      </label>
    </div>
  </div>
</template>

<script>
import Fuse from 'fuse.js';
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';

const fuseSettings = {
  threshold: 0.5,
  keys: [
    {
      name: 'slug',
      weight: 0.25,
    },
    {
      name: 'name',
      weight: 0.5,
    },
  ],
};

export default {
  name: 'AdminItems',

  data: () => ({
    showArchived: false,
    organizations: [],
    departments: [],
    products: [],
    fuseOrgs: null,
    fuseDeps: null,
    fuseProds: null,
    queryOrgs: '',
    queryDeps: '',
    queryProds: '',
    filteredOrgs: [],
    filteredDeps: [],
    filteredProds: [],
  }),

  computed: {
    ...mapState(['user']),
  },

  watch: {
    user: {
      immediate: true,
      handler: 'bindItems',
    },

    showArchived: {
      immediate: false,
      handler: 'bindItems',
    },

    organizations: {
      immediate: true,
      handler() {
        this.filteredOrgs = this.user.superAdmin
          ? this.organizations
          : this.organizations.filter((o) => this.user.admin.includes(o.id));
        this.fuseOrgs = new Fuse(this.filteredOrgs, fuseSettings);
      },
    },

    departments: {
      immediate: true,
      handler() {
        this.filteredDeps = this.user.superAdmin
          ? this.departments
          : this.departments.filter((d) => this.user.admin.includes(d.organization.id));
        this.fuseDeps = new Fuse(this.filteredDeps, fuseSettings);
      },
    },

    products: {
      immediate: true,
      handler() {
        this.filteredProds = this.user.superAdmin
          ? this.products
          : this.products.filter((p) => this.user.admin.includes(p.organization.id));
        this.fuseProds = new Fuse(this.filteredProds, fuseSettings);
      },
    },

    queryOrgs(str) {
      if (str.length < 1) {
        this.filteredOrgs = this.organizations;
      } else {
        this.filteredOrgs = this.fuseOrgs.search(str).map(({ item }) => item);
      }
    },

    queryDeps(str) {
      if (str.length < 1) {
        this.filteredDeps = this.departments;
      } else {
        this.filteredDeps = this.fuseDeps.search(str).map(({ item }) => item);
      }
    },

    queryProds(str) {
      if (str.length < 1) {
        this.filteredProds = this.products;
      } else {
        this.filteredProds = this.fuseProds.search(str).map(({ item }) => item);
      }
    },
  },

  methods: {
    bindItems() {
      for (const collection of ['organizations', 'departments', 'products']) {
        this.$bind(
          collection,
          db
            .collection(collection)
            .where('archived', 'in', [false, this.showArchived])
            .orderBy('slug'),
          { wait: true }
        );
      }
    },

    itemLink(slug) {
      return {
        name: 'ItemAbout',
        params: { slug },
        query: { edit: true },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.col {
  display: flex;
  flex-direction: column;
  height: 32rem;
  background: var(--color-gray-light);
}

.col__body {
  overflow: auto;
}

.col__header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--color-grayscale-10);
}

.col__footer {
  margin-top: auto;
  padding: 1rem;
}

.col__link {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  border-bottom: 2px solid var(--color-border);

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
  }
}

.col__text {
  flex: 1 0 auto;
}

.actions {
  margin: 1.5rem 0;
}

.create-link {
  display: block;
  padding: 0.75rem;
  color: var(--color-text);
  font-weight: 500;
  text-align: center;
  text-decoration: none;
  background: var(--color-grayscale-10);

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.3em;
  }
}

.icon {
  height: 1rem;
}
</style>

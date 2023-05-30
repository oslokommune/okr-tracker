<template>
  <div>
    <div class="columns">
      <div>
        <h2 class="title-2">{{ $t('general.organizations') }}</h2>

        <div class="col">
          <div v-if="filteredOrgs.length > 10" class="search">
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
                class="col__link"
                :to="{ name: 'ItemAdmin', params: { slug: organization.slug } }"
              >
                <i class="col__icon fa fa-industry" />
                {{ organization.name }}
                <span
                  v-if="organization.archived"
                  class="col__archived fa fa-file-archive"
                ></span>
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link
              v-if="user.superAdmin"
              class="btn btn--fw"
              :to="{ name: 'CreateOrganization' }"
              data-cy="create-organization"
            >
              {{ $t('btn.addOrganization') }}
            </router-link>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">{{ $t('general.departments') }}</h2>
        <div class="col">
          <div v-if="filteredDeps.length > 15" class="search">
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
                class="col__link"
                :to="{ name: 'ItemAdmin', params: { slug: department.slug } }"
              >
                <i class="col__icon fa fa-cubes" />
                {{ department.name }}
                <span
                  v-if="department.archived"
                  class="col__archived fa fa-file-archive"
                ></span>
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link
              class="btn btn--fw"
              :to="{ name: 'CreateDepartment' }"
              data-cy="create-department"
            >
              {{ $t('btn.addDepartment') }}
            </router-link>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">{{ $t('general.products') }}</h2>
        <div class="col">
          <div v-if="filteredProds.length > 15" class="search">
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
                class="col__link"
                :to="{ name: 'ItemAdmin', params: { slug: product.slug } }"
              >
                <i class="col__icon fa fa-cube" />
                {{ product.name }}
                <i v-if="product.archived" class="col__archived fa fa-file-archive" />
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link
              class="btn btn--fw"
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
    showArchived: {
      immediate: true,
      handler() {
        this.$bind(
          'organizations',
          db
            .collection('organizations')
            .where('archived', 'in', [false, this.showArchived])
            .orderBy('slug')
        );
        this.$bind(
          'departments',
          db
            .collection('departments')
            .where('archived', 'in', [false, this.showArchived])
            .orderBy('slug')
        );
        this.$bind(
          'products',
          db
            .collection('products')
            .where('archived', 'in', [false, this.showArchived])
            .orderBy('slug')
        );
      },
    },

    organizations: {
      immediate: true,
      handler() {
        this.filteredOrgs = this.organizations;
        this.fuseOrgs = new Fuse(this.filteredOrgs, fuseSettings);
      },
    },

    departments: {
      immediate: true,
      handler() {
        this.filteredDeps = this.departments;
        this.fuseDeps = new Fuse(this.filteredDeps, fuseSettings);
      },
    },

    products: {
      immediate: true,
      handler() {
        this.filteredProds = this.products;
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
};
</script>

<style lang="scss" scoped>
.columns {
  display: grid;
  grid-gap: span(0, 1, span(12));
  grid-template-rows: repeat(auto-fill, auto);
  grid-template-columns: repeat(1, 1fr);

  @media screen and (min-width: bp(s)) {
    grid-gap: span(0, 1, span(6));
    grid-template-columns: repeat(1, 1fr);
  }

  @media screen and (min-width: bp(m)) {
    grid-gap: span(0, 1, span(6));
    grid-template-columns: repeat(3, 1fr);
  }

  @media screen and (min-width: bp(l)) {
    grid-gap: span(0, 1, span(7));
    width: span(6, 0, span(7));
  }
}

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

.col__icon {
  flex-shrink: 0;
  margin-right: 0.25rem;
}

.col__archived {
  flex-shrink: 0;
  margin-left: auto;
}

.col__link {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: var(--color-text);
  font-weight: 500;
  text-decoration: none;
  border-bottom: 2px solid var(--color-border);
}

.actions {
  margin: 1.5rem 0;
}
</style>

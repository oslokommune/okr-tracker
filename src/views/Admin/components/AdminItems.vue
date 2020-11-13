<template>
  <div>
    <div class="columns">
      <div>
        <h2 class="title-2">{{ $t('general.organizations') }}</h2>

        <div class="col">
          <div class="col__body">
            <div v-for="organization in organizations" :key="organization.id" class="col__row">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: organization.slug } }">
                <i class="col__icon fa fa-industry" />
                {{ organization.name }}
                <span v-if="organization.archived" class="col__archived fa fa-file-archive"></span>
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link class="btn btn--fw" :to="{ name: 'CreateOrganization' }">{{
              $t('btn.addOrganization')
            }}</router-link>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">{{ $t('general.departments') }}</h2>
        <div class="col">
          <div class="col__body">
            <div v-for="department in departments" :key="department.id" class="col__row">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: department.slug } }">
                <i class="col__icon fa fa-cubes" />
                {{ department.name }}
                <span v-if="department.archived" class="col__archived fa fa-file-archive"></span>
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link class="btn btn--fw" :to="{ name: 'CreateDepartment' }">{{
              $t('btn.addDepartment')
            }}</router-link>
          </div>
        </div>
      </div>

      <div>
        <h2 class="title-2">{{ $t('general.products') }}</h2>
        <div class="col">
          <div class="col__body">
            <div v-for="product in products" :key="product.id" class="col__row">
              <router-link class="col__link" :to="{ name: 'ItemAdmin', params: { slug: product.slug } }">
                <i class="col__icon fa fa-cube" />
                {{ product.name }}
                <i v-if="product.archived" class="col__archived fa fa-file-archive" />
              </router-link>
            </div>
          </div>
          <div class="col__footer">
            <router-link class="btn btn--fw" :to="{ name: 'CreateProduct' }">{{ $t('btn.addProduct') }}</router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <label class="form-group--checkbox">
        <input v-model="showArchived" type="checkbox" class="form__checkbox" />
        <span class="form-label">{{ $t('admin.objects.showArchived') }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import { db } from '@/config/firebaseConfig';

export default {
  name: 'AdminItems',

  data: () => ({
    showArchived: false,
    organizations: [],
    departments: [],
    products: [],
  }),

  watch: {
    showArchived: {
      immediate: true,
      handler() {
        this.$bind('organizations', db.collection('organizations').where('archived', 'in', [false, this.showArchived]));
        this.$bind('departments', db.collection('departments').where('archived', 'in', [false, this.showArchived]));
        this.$bind('products', db.collection('products').where('archived', 'in', [false, this.showArchived]));
      },
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles/_colors.scss';

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
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba($color-grey-400, 0.3);
}

.col__body {
  overflow: auto;
}

.col__header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: $color-grey-100;
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
  color: $color-purple;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  border-bottom: 1px solid $color-grey-100;
}
</style>

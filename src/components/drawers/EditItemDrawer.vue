<template>
  <paged-drawer-wrapper
    ref="drawer"
    :visible="visible"
    :page-count="pageCount"
    @close="$emit('close')"
  >
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t('admin.item.change', { name: item.name }) }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t('admin.item.updated', { name: thisItem.name }) }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ pageIndex, prev }">
      <form-section :hide-errors="true">
        <template v-if="pageIndex === 1">
          <form-component
            v-model="thisItem.name"
            input-type="input"
            name="name"
            :disabled="thisItem?.archived"
            :label="$t('fields.name')"
            rules="required"
          />
          <pkt-alert v-if="thisItem.name !== item.name" skin="info" class="mb-size-16">
            {{ $t('admin.item.slugChangeInfo', { name: item.name }) }}
          </pkt-alert>
          <form-component
            v-model="thisItem.missionStatement"
            input-type="textarea"
            name="missionStatement"
            :disabled="thisItem?.archived"
            :rows="5"
            :label="$t('fields.missionStatement')"
            rules="required"
          />
          <form-component
            v-model="thisItem.targetAudience"
            input-type="textarea"
            name="targetAudience"
            :disabled="thisItem?.archived"
            :rows="4"
            :label="$t('dashboard.targetAudience')"
          />
        </template>

        <template v-else-if="pageIndex === 2">
          <form-component
            v-if="type === 'department'"
            v-model="thisItem.organization"
            input-type="select"
            name="parent"
            :disabled="thisItem?.archived"
            :label="$t('admin.department.parentOrganisation')"
            rules="required"
            :select-options="organizations"
          />

          <form-component
            v-else-if="type === 'product'"
            v-model="thisItem.department"
            input-type="select"
            name="parent"
            :disabled="thisItem?.archived"
            :label="$t('admin.product.parentDepartment')"
            rules="required"
            :select-options="departments"
          />

          <div class="pkt-form-group">
            <span class="pkt-form-label" for="teamMembers">
              {{ $t('general.teamMembers') }}
              <span class="pkt-badge">{{ $t('validation.optional') }}</span>
            </span>
            <v-select
              id="teamMembers"
              v-model="thisItem.team"
              multiple
              :disabled="thisItem?.archived"
              :options="users"
              :get-option-label="(option) => option.displayName || option.id"
            >
              <template #option="option">
                {{ option.displayName || option.id }}
                <span v-if="option.displayName !== option.id">({{ option.id }})</span>
              </template>
            </v-select>
          </div>

          <form-component
            v-model="thisItem.secret"
            input-type="input"
            name="secret"
            :disabled="thisItem?.archived"
            :label="$t('fields.secret')"
          >
            <template #help><span v-html="$t('admin.apiSecret')" /></template>
          </form-component>
        </template>

        <template v-if="!thisItem?.archived" #actions="{ handleSubmit }">
          <pkt-button
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="loading"
            @onClick="$emit('close')"
          />
          <pkt-button
            v-else
            :text="$t('btn.back')"
            skin="tertiary"
            :disabled="loading"
            @onClick="prev"
          />

          <btn-save
            :label="pageIndex === pageCount ? $t('btn.complete') : $t('btn.continue')"
            :disabled="loading"
            variant="label-only"
            @click="handleSubmit(save)"
          />
        </template>
      </form-section>
    </template>

    <template #done>
      <em v-if="redirectTimer">
        {{ $t('admin.item.redirectInfo', { count: redirectCounter }) }}
      </em>
    </template>

    <template #footer="{ isDone }">
      <template v-if="!isDone">
        <archived-restore
          v-if="thisItem.archived"
          :restore="restore"
          :object-type="type"
        />
        <div v-else class="button-row">
          <btn-delete :disabled="loading" @click="archive" />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import Organization from '@/db/Organization';
import Department from '@/db/Department';
import Product from '@/db/Product';
import { db } from '@/config/firebaseConfig';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete } from '@/components/generic/form';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';

export default {
  name: 'EditItemDrawer',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    PktAlert,
    PktButton,
    PagedDrawerWrapper,
    FormSection,
    BtnSave,
    BtnDelete,
  },

  props: {
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

    item: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    thisItem: null,
    pageCount: 2,
    loading: false,
    redirectCounter: 3,
    redirectTimer: null,
  }),

  computed: {
    ...mapState(['organizations', 'departments', 'users']),

    type() {
      const { department, organization } = this.item;
      if (organization && department) {
        return 'product';
      }
      if (organization) {
        return 'department';
      }
      return 'organization';
    },
  },

  watch: {
    visible: {
      immediate: true,
      async handler(visible) {
        if (visible) {
          this.$refs.drawer.reset();
          this.redirectTimer = null;
          this.redirectCounter = 3;
        }

        this.loading = true;
        this.thisItem = { ...this.item };
        this.loading = false;
      },
    },

    item(item, prevItem) {
      // Watch for slug changes and redirect if needed.
      if (item.id === prevItem.id && item.slug !== prevItem.slug && !this.redirectTimer) {
        this.redirectTimer = setInterval(() => {
          this.redirectCounter -= 1;
          if (this.redirectCounter === 0) {
            clearInterval(this.redirectTimer);
            const { name, params, query } = this.$route;
            this.$router.replace({
              name,
              params: { ...params, slug: item.slug },
              query,
            });
          }
        }, 1000);
      }
    },
  },

  methods: {
    async save() {
      const { pageIndex, next } = this.$refs.drawer;

      if (pageIndex < this.pageCount) {
        next();
      } else {
        this.loading = true;

        try {
          const { id: itemId } = this.item;
          const { name, missionStatement, targetAudience, secret } = this.thisItem;

          const team = this.thisItem.team.map((user) =>
            db.collection('users').doc(user.id)
          );

          const data = {
            name,
            team,
            missionStatement,
            targetAudience: targetAudience === undefined ? '' : targetAudience,
            secret: secret === undefined ? '' : secret,
          };

          if (this.type === 'organization') {
            await Organization.update(itemId, data);
          } else if (this.type === 'department') {
            const organization = await db
              .collection('organizations')
              .doc(this.thisItem.organization.id);

            await Department.update(itemId, {
              ...data,
              organization,
            });
          } else {
            const department = db
              .collection('departments')
              .doc(this.thisItem.department.id);

            await Product.update(itemId, {
              ...data,
              department,
            });
          }

          this.$refs.drawer.next();
        } catch (error) {
          this.$refs.drawer.next(false);
          this.$toasted.error(this.$t('toaster.error.save'));
        } finally {
          this.loading = false;
        }
      }
    },

    async archive() {
      this.loading = true;

      try {
        await this.getObjectType().archive(this.item.id);
        this.thisItem.archived = true;
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.item.name })
        );
      } finally {
        this.loading = false;
      }
    },

    async restore() {
      try {
        await this.getObjectType().restore(this.item.id);
        this.thisItem.archived = false;
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.thisKeyResult.id })
        );
      }
    },

    getObjectType() {
      if (this.type === 'organization') {
        return Organization;
      }
      if (this.type === 'department') {
        return Department;
      }
      if (this.type === 'product') {
        return Product;
      }
      throw new Error(`Unknown object type ${this.type}`);
    },
  },
};
</script>
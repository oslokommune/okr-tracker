<template>
  <paged-drawer-wrapper
    ref="drawer"
    :visible="!!thisKeyResult"
    :page-count="pageCount"
    @close="$emit('close')"
  >
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(editMode ? 'admin.keyResult.change' : 'admin.keyResult.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(editMode ? 'keyResult.updated' : 'keyResult.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ pageIndex, prev }">
      <form-section>
        <template v-if="pageIndex === 1">
          <form-component
            v-model="thisKeyResult.name"
            input-type="textarea"
            name="name"
            :disabled="thisKeyResult?.archived"
            :rows="2"
            :label="$t('fields.name')"
            rules="required"
          />
          <form-component
            v-model="thisKeyResult.description"
            input-type="textarea"
            name="description"
            :disabled="thisKeyResult?.archived"
            :rows="2"
            :label="$t('fields.description')"
          />
          <form-component
            v-if="isOrganization || isDepartment"
            v-model="contributor"
            name="owner"
            input-type="select"
            :disabled="ownerOptions.length === 1 || thisKeyResult?.archived"
            :select-options="ownerOptions"
            :label="$t('admin.keyResult.owner.label')"
            rules="required"
          >
            <template #help>
              {{ $t('admin.keyResult.owner.help') }}
            </template>
          </form-component>
        </template>

        <template v-else-if="pageIndex === 2">
          <form-component
            v-model="thisKeyResult.unit"
            input-type="input"
            name="unit"
            :label="$t('keyResult.unit')"
            rules="required|max:25"
          />

          <div class="pkt-grid">
            <form-component
              v-model.number="thisKeyResult.startValue"
              input-type="input"
              name="startValue"
              :label="$t('keyResult.startValue')"
              rules="required"
              type="number"
              class="pkt-cell pkt-cell--span6"
            />

            <form-component
              v-model.number="thisKeyResult.targetValue"
              input-type="input"
              name="targetValue"
              :label="$t('keyResult.targetValue')"
              rules="required"
              type="number"
              class="pkt-cell pkt-cell--span6"
            />
          </div>

          <form-component
            v-model.number="thisKeyResult.weight"
            input-type="input"
            name="weight"
            :label="$t('keyResult.weight.label')"
            rules="required|decimal|positiveNotZero"
            type="number"
          >
            <template #help><span v-html="$t('keyResult.weight.help')" /></template>
          </form-component>
        </template>

        <template #actions="{ handleSubmit, submitDisabled }">
          <pkt-button
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="loading || thisKeyResult?.archived"
            @onClick="close"
          />
          <pkt-button
            v-else
            :text="$t('btn.back')"
            skin="tertiary"
            :disabled="loading || thisKeyResult?.archived"
            @onClick="prev"
          />

          <btn-save
            :text="pageIndex === pageCount ? $t('btn.complete') : $t('btn.continue')"
            :disabled="submitDisabled || loading || thisKeyResult?.archived"
            variant="label-only"
            @click="handleSubmit(save)"
          />
        </template>
      </form-section>
    </template>

    <template #done="{ isSuccess, reset }">
      <div class="button-row button-row--left">
        <template v-if="!isSuccess">
          <pkt-button skin="secondary" @onClick="reset">
            {{ $t('btn.back') }}
          </pkt-button>
        </template>
        <template v-else-if="!thisKeyResult.id">
          <pkt-button skin="tertiary" @onClick="close">
            {{ $t('btn.close') }}
          </pkt-button>
          <pkt-button
            skin="secondary"
            @onClick="
              thisKeyResult = { ...keyResultDefaults };
              reset();
            "
          >
            {{ $t('btn.createKeyResult') }}
          </pkt-button>
        </template>
      </div>
    </template>

    <template #footer="{ isDone }">
      <template v-if="editMode && !isDone">
        <archived-restore
          v-if="thisKeyResult.archived"
          :restore="restore"
          object-type="keyResult"
        />
        <div v-else class="button-row">
          <btn-delete
            :disabled="loading"
            :text="$t('admin.keyResult.delete')"
            @click="archive"
          />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { PktButton } from '@oslokommune/punkt-vue2';
import { db } from '@/config/firebaseConfig';
import { FormSection, BtnSave, BtnDelete } from '@/components/generic/form';
import getActiveItemType, {
  isDepartment,
  isOrganization,
} from '@/util/getActiveItemType';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import KeyResult from '@/db/KeyResult';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import syncObjectiveContributors from '@/util/objectiveContributors';

export default {
  name: 'EditKeyResult',

  components: {
    ArchivedRestore,
    PktButton,
    PagedDrawerWrapper,
    FormSection,
    BtnSave,
    BtnDelete,
  },

  props: {
    objective: {
      type: Object,
      required: true,
    },

    keyResult: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    thisKeyResult: null,
    keyResultDefaults: {
      weight: 1,
      startValue: 0,
      targetValue: 100,
    },
    pageCount: 2,
    loading: false,
    contributor: null,
    objectiveOwner: null,
  }),

  computed: {
    ...mapState([
      'activeItem',
      'activeItemRef',
      'organizations',
      'departments',
      'products',
      'user',
    ]),
    ...mapGetters(['hasEditRights']),

    children() {
      if (!this.objectiveOwner) {
        return [];
      }
      if (isOrganization(this.objectiveOwner)) {
        return this.departments.filter(
          (department) => department.organization.id === this.objectiveOwner.id
        );
      }
      if (isDepartment(this.objectiveOwner)) {
        return this.products.filter(
          (product) => product.department.id === this.objectiveOwner.id
        );
      }
      return [];
    },

    isAdmin() {
      const { organization } = this.activeItem;
      const isAdminOfOrganization = organization
        ? this.user.admin?.includes(organization.id)
        : this.user.admin?.includes(this.activeItem.id);
      return isAdminOfOrganization || this.user.superAdmin;
    },

    ownerOptions() {
      const options = [];

      if (
        this.objectiveOwner &&
        (this.memberOfLevel(this.objectiveOwner) || this.isAdmin)
      ) {
        const { id, name } = this.objectiveOwner;
        const parentType = getActiveItemType(this.objective.parent);
        const path = `${parentType}s/${id}`;
        options.push({ value: path, name });
      }

      this.children
        .filter((child) => this.memberOfLevel(child) || this.isAdmin)
        .map((child) => ({
          value: child.path,
          name: child.name,
        }))
        .forEach((child) => options.push(child));

      return options;
    },

    editMode() {
      return !!this.thisKeyResult?.id;
    },
  },

  async mounted() {
    this.keyResultDefaults.unit = this.$t('keyResult.defaultUnit');
    this.loading = true;

    const parentType = getActiveItemType(this.objective.parent);
    await this.$bind(
      'objectiveOwner',
      db.collection(`${parentType}s`).doc(this.objective.parent.id)
    );

    if (!this.keyResult) {
      this.thisKeyResult = { ...this.keyResultDefaults };
      this.contributor =
        this.ownerOptions.find((o) => o.name === this.activeItem.name) ||
        this.ownerOptions[0];
      this.loading = false;
      return;
    }

    db.collection('keyResults')
      .doc(this.keyResult.id)
      .get()
      .then((snapshot) => {
        this.thisKeyResult = {
          ...this.keyResultDefaults,
          ...snapshot.data(),
        };
        this.thisKeyResult.id = this.keyResult.id;
        this.contributor = this.ownerOptions.find(
          (o) => o.name === this.keyResult.parent.name
        );
        this.loading = false;
      });
  },

  methods: {
    isDepartment,
    isOrganization,
    syncObjectiveContributors,

    memberOfLevel(level) {
      return level?.team.map(({ id }) => id).includes(this.user.id);
    },

    async save() {
      const { pageIndex, next } = this.$refs.drawer;

      if (pageIndex < this.pageCount) {
        next();
      } else {
        this.loading = true;

        try {
          const { name, description, unit, weight, startValue, targetValue } =
            this.thisKeyResult;

          const parent = db.doc(this.contributor.value);

          const data = {
            name,
            description: description || '',
            unit: unit || 1,
            weight: weight || 1,
            startValue,
            targetValue,
            parent,
          };

          if (this.thisKeyResult?.id) {
            await KeyResult.update(this.thisKeyResult.id, data);
            this.$emit('update', this.thisKeyResult);
          } else {
            const objectiveRef = db.collection('objectives').doc(this.objective.id);
            const { id } = await KeyResult.create({
              ...data,
              objective: objectiveRef,
            });
            this.thisKeyResult.id = id;
            this.thisKeyResult.objective = objectiveRef;
            this.$emit('create', this.thisKeyResult);
          }
          await syncObjectiveContributors(this.objective.id);
          this.$refs.drawer.next();
        } catch (error) {
          console.log(error);
          this.$refs.drawer.next(false);
          this.$toasted.error(this.$t('toaster.error.save'));
        }

        this.loading = false;
      }
    },

    async archive() {
      this.loading = true;
      try {
        await KeyResult.archive(this.thisKeyResult.id);
        await syncObjectiveContributors(this.objective.id);
        this.thisKeyResult.archived = true;
        this.$emit('archive', this.thisKeyResult);
        this.$refs.drawer.reset();
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.thisKeyResult.name })
        );
      }
      this.loading = false;
    },

    async restore() {
      try {
        await KeyResult.restore(this.thisKeyResult.id);
        await syncObjectiveContributors(this.objective.id);
        this.thisKeyResult.archived = false;
        this.$emit('restore', this.thisKeyResult);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.thisKeyResult.id })
        );
      }
    },

    close() {
      this.thisKeyResult = null;
    },
  },
};
</script>

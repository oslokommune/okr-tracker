<template>
  <paged-drawer-wrapper
    ref="drawer"
    :visible="visible && !!thisKeyResult"
    :page-count="pageCount"
    @close="close"
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
            :select-options="ownerOptions"
            :select-reduce="(option) => option.value"
            :label="$t('fields.owner')"
            rules="required"
          />
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
        </template>

        <template
          v-if="!thisKeyResult?.archived"
          #actions="{ handleSubmit, submitDisabled }"
        >
          <pkt-button
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="loading"
            @onClick="close"
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
            :disabled="submitDisabled || loading"
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
              thisKeyResult = {};
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
            :label="$t('admin.keyResult.delete')"
            @click="archive"
          />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import { db } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import ObjectiveContributors from '@/db/ObjectiveContributors';
import { PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import { isDepartment, isOrganization } from '@/util/getActiveItemType';
import getActiveItemType from '@/util/getActiveItemType';

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
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

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
    pageCount: 2,
    loading: false,
    contributor: null,
    contributors: [],
    keyResultOwners: [],
  }),

  computed: {
    ...mapState([
      'activeItem',
      'activeItemRef',
      'organizations',
      'departments',
      'products',
    ]),
    thisLevel() {
      if (isOrganization(this.activeItem)) {
        return this.organizations.find((o) => o.id === this.activeItem.id);
      }
      if (isDepartment(this.activeItem)) {
        return this.departments.find((d) => d.id === this.activeItem.id);
      }
      return {};
    },
    children() {
      if (isOrganization(this.activeItem)) {
        return this.departments.filter(
          (department) => department.organization.id === this.activeItem.id
        );
      }
      if (isDepartment(this.activeItem)) {
        return this.products.filter(
          (product) => product.department.id === this.activeItem.id
        );
      }
      return {};
    },
    childCollection() {
      if (isOrganization(this.activeItem)) {
        return 'departments';
      }
      if (isDepartment(this.activeItem)) {
        return 'products';
      }
      return null;
    },
    thisLevelOption() {
      return {
        value: this.thisLevel.path,
        name: this.activeItem.name,
      };
    },
    ownerOptions() {
      const childrenOptions = this.children.map((child) => ({
        value: child.path,
        name: child.name,
      }));

      return [this.thisLevelOption, ...childrenOptions];
    },
    editMode() {
      return !!this.thisKeyResult?.id;
    },
  },

  watch: {
    visible: {
      immediate: true,
      async handler(visible) {
        this.thisKeyResult = null;
        if (visible) {
          this.$refs.drawer.reset();
        }

        if (!this.keyResult) {
          this.thisKeyResult = {};
          return;
        }

        this.loading = true;
        db.collection('keyResults')
          .doc(this.keyResult.id)
          .get()
          .then((snapshot) => {
            this.thisKeyResult = snapshot.data();
            this.thisKeyResult.id = this.keyResult.id;
            this.contributor = this.ownerOptions.find(o => o.name === this.keyResult.parent.name);
            this.loading = false;
          });

        this.getObjectiveContributors();
        this.getKeyResultOwners();
      },
    },
    // thisLevel: {
    //   immediate: true,
    //   async handler() {
    //     // Set currentLevel as default option for key result owner
    //     if (!this.keyResult.id) {
    //       this.thisKeyResult.parent = this.thisLevelOption;
    //     }
    //   },
    // },
  },

  methods: {
    isDepartment, isOrganization,

    async save() {
      const { pageIndex, next } = this.$refs.drawer;

      if (pageIndex < this.pageCount) {
        next();
      } else {
        this.loading = true;

        try {
          const { name, description, unit, weight, startValue, targetValue } =
            this.thisKeyResult;

          const parent = db.doc(this.contributor);
          console.log("PARENT. ", parent);

          const data = {
            name,
            description: description || '',
            unit: unit || 1,
            weight: weight || 1,
            startValue,
            targetValue,
            parent
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

            await db.collection('keyResults')
              .doc(id)
              .get()
              .then((snapshot) => {
                this.thisKeyResult = snapshot.data();
                this.thisKeyResult.objective = objectiveRef;
                console.log("snapshot.parent", snapshot);
                //this.thisKeyResult.parent = snapshot.parent;
                this.thisKeyResult.id = id;
                this.contributor = this.ownerOptions.find(o => o.name === this.keyResult.parent.name);
                this.loading = false;
              });
            console.log("kr parent", this.thisKeyResult)
            //parentRef = await activePeriodRef.get().then((snapshot) => snapshot.data().parent);

            // TODO: Map this shit
            // this.thisKeyResult.id = id;
            //this.thisKeyResult.objective = objectiveRef;
            //this.thisKeyResult.parent = data.parent;
            //this.keyResultOwners.push(this.thisKeyResult); // TODO: ????
            this.$emit('create', this.thisKeyResult);
          }
          await this.syncObjectiveContributor();
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
        await this.syncObjectiveContributor();
        this.thisKeyResult.archived = true;
        this.$emit('archive', this.thisKeyResult);
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
        await this.syncObjectiveContributor();
        this.thisKeyResult.archived = false;
        this.$emit('restore', this.thisKeyResult);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.thisKeyResult.id })
        );
      }
    },

    async getObjectiveContributors() {
      const objectiveRef = await db.doc(`objectives/${this.objective.id}`);
      const objectiveContributorsRefs = db
        .collection('objectiveContributors')
        .where('objective', '==', objectiveRef)
        .where('archived', '==', false);

      this.$bind('contributors', objectiveContributorsRefs);
    },

    async getKeyResultOwners() {
      const objectiveRef = await db.doc(`objectives/${this.objective.id}`);
      const keyResults = await db
        .collection('keyResults')
        .where('objective', '==', objectiveRef)
        .where('archived', '==', false)
        .get()
        .then((snapshot) => snapshot.docs)
        .then((docs) => docs.map((d) => d.data()));

      this.keyResultOwners = keyResults;
    },

    async syncObjectiveContributor() {
      let contributors = [...this.contributors];
      let keyResultOwners = [...this.keyResultOwners];

      // Filter out already present links
      this.contributors.map(c => {
        this.keyResultOwners.map(k => {
          if (c.item.name === k.parent.name) {
            contributors = contributors.filter((con) => con.item.name !== c.item.name);
            keyResultOwners = keyResultOwners.filter((kr) => kr.parent.name !== k.parent.name);
          }
        });
      });

      // Add missing contributor
      keyResultOwners.map(async (k) => {
        this.createObjectiveContributor(await k.parent.get());
      });

      // Remove redundant contributors
      contributors.map(c => {
        this.removeObjectiveContributor(c.item);
      });
    },

    createObjectiveContributor(item) {
      const itemType = getActiveItemType(item.data());
      const itemRef = db.doc(`${itemType}s/${item.id}`);
      const objectiveRef = db.doc(`objectives/${this.objective.id}`);
      ObjectiveContributors.create(itemRef, objectiveRef);
    },

    async removeObjectiveContributor(item) {
      const itemType = getActiveItemType(item);
      const itemRef = db.doc(`${itemType}s/${item.id}`);
      const objectiveRef = db.doc(`objectives/${this.objective.id}`);
      return ObjectiveContributors.remove(itemRef, objectiveRef);
    },

    close(e) {
      this.$emit('close', e);
    },
  },
};
</script>

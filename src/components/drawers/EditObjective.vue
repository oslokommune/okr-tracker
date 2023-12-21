<template>
  <paged-drawer-wrapper ref="drawer" :visible="!!thisObjective" @close="$emit('close')">
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(editMode ? 'admin.objective.change' : 'admin.objective.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(editMode ? 'objective.updated' : 'admin.objective.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page>
      <form-section>
        <form-component
          v-model="thisObjective.name"
          input-type="textarea"
          name="name"
          :disabled="thisObjective?.archived"
          :rows="2"
          :label="$t('fields.name')"
          rules="required"
        />

        <form-component
          v-model="thisObjective.description"
          input-type="textarea"
          :disabled="thisObjective?.archived"
          :rows="2"
          name="description"
          :label="$t('fields.description')"
        />

        <form-component
          v-model="periodRange"
          input-type="date"
          name="period"
          :disabled="thisObjective?.archived"
          :label="$t('fields.period')"
          :placeholder="$t('general.selectRange')"
          :date-picker-config="flatPickerConfig"
          rules="required"
        />

        <period-shortcut
          v-if="newestObjective?.startDate && newestObjective?.endDate"
          class="period-suggestion"
          :label="$t('admin.objective.useLastPeriod')"
          :start-date="newestObjective.startDate.toDate()"
          :end-date="newestObjective.endDate.toDate()"
          :active="isSuggestedPeriod"
          @click="useSuggestedPeriod"
        />

        <div class="owner-select">
          <label for="owner" class="pkt-form-label">
            {{ $t('admin.objective.level.label') }}
          </label>
          <div class="pkt-form-help">{{ displayLevelHelp }}</div>
          <form-component
            v-if="canLift"
            v-model="owner"
            name="owner"
            input-type="select"
            :select-options="ownerOptions"
            :select-reduce="(option) => option.value"
            select-label="label"
            :disabled="!canLift || thisObjective?.archived"
            rules="required"
          />
          <pkt-alert v-if="hasNewOwner" skin="info">
            <p>{{ $t('admin.objective.level.liftWarning1') }}</p>
            <p v-if="!hasParentEditRights">
              {{
                $t('admin.objective.level.liftWarning2', {
                  newOwner: potentionalOwner.name,
                })
              }}
            </p>
          </pkt-alert>
        </div>

        <template #actions="{ handleSubmit, submitDisabled }">
          <btn-cancel :disabled="loading" @click="close" />
          <btn-save
            :text="editMode ? $t('btn.updateObjective') : $t('btn.createObjective')"
            variant="label-only"
            :disabled="submitDisabled || loading || thisObjective?.archived"
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
        <template v-else-if="!objective">
          <pkt-button skin="tertiary" @onClick="close">
            {{ $t('btn.close') }}
          </pkt-button>
          <pkt-button
            v-if="thisObjective.id"
            skin="secondary"
            @onClick="$emit('add-key-result')"
          >
            {{ $t('btn.createKeyResult') }}
          </pkt-button>
        </template>
      </div>
    </template>

    <template #footer="{ isDone }">
      <template v-if="editMode && !isDone">
        <archived-restore
          v-if="thisObjective.archived"
          :restore="restore"
          object-type="objective"
        />
        <div v-else class="button-row">
          <btn-delete
            :disabled="loading"
            :text="$t('admin.objective.delete')"
            @click="archive"
          />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex';
import { isEqual } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import { formattedPeriod } from '@/util/okr';
import getActiveItemType from '@/util/getActiveItemType';
import Objective from '@/db/Objective';
import firebase from 'firebase/compat/app';
import locale from 'flatpickr/dist/l10n/no';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import PeriodShortcut from '@/components/period/PeriodShortcut.vue';
import syncObjectiveContributors from '@/util/objectiveContributors';

export default {
  name: 'EditObjective',

  components: {
    ArchivedRestore,
    PeriodShortcut,
    PktAlert,
    PktButton,
    PagedDrawerWrapper,
    FormSection,
    BtnSave,
    BtnDelete,
    BtnCancel,
  },

  props: {
    objective: {
      type: Object,
      required: false,
      default: null,
    },

    newestObjective: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    thisObjective: null,
    flatPickerConfig: {
      altFormat: 'j M Y',
      altInput: true,
      minDate: null,
      mode: 'range',
      maxDate: null,
      locale: locale.no,
    },
    periodRange: null,
    loading: false,
    owner: null,
    currentOwner: null,
    potentionalOwner: null,
    keyResults: [],
  }),

  computed: {
    ...mapState(['activeItem', 'activeItemRef']),
    ...mapGetters(['hasParentEditRights']),

    editMode() {
      return !!this.thisObjective?.id;
    },

    isSuggestedPeriod() {
      return (
        this.periodRange &&
        this.newestObjective?.startDate &&
        this.newestObjective?.endDate &&
        isEqual(this.periodRange[0], this.newestObjective.startDate.toDate()) &&
        isEqual(this.periodRange[1], this.newestObjective.endDate.toDate())
      );
    },

    /**
     * Return `true` if the current objective has any foreign contributors.
     */
    hasForeignContributors() {
      return this.keyResults.some((kr) => kr.parent.id !== this.objective.parent.id);
    },

    /**
     * Return array with names of current foreign contributors.
     */
    foreignContributors() {
      return [
        ...new Set(
          this.keyResults
            .filter((kr) => kr.parent.id !== this.objective.parent.id)
            .map((kr) => kr.parent.name)
        ),
      ];
    },

    /**
     * Return `true` if the user should be able to lift current objective.
     */
    canLift() {
      return this.potentionalOwner && !this.hasForeignContributors;
    },

    ownerOptions() {
      return this.currentOwner && this.potentionalOwner
        ? [
            {
              label: this.currentOwner.name,
              value: this.currentOwner.ref.path,
            },
            {
              label: this.potentionalOwner.name,
              value: this.potentionalOwner.ref.path,
            },
          ]
        : [];
    },

    displayLevelHelp() {
      if (this.owner === this.potentionalOwner?.ref.path) {
        return this.$t('admin.objective.level.helpLift', {
          owner: this.currentOwner.name,
          newOwner: this.potentionalOwner.name,
        });
      }

      if (this.hasForeignContributors) {
        return this.$t('admin.objective.level.helpForeign', {
          owner: this.currentOwner.name,
          contributors: this.foreignContributors.join(', '),
        });
      }

      return this.$t('admin.objective.level.help', {
        owner: this.currentOwner.name,
      });
    },

    /**
     * Return `true` if a new owner has been chosen for the current objective.
     */
    hasNewOwner() {
      return this.currentOwner && this.currentOwner.ref.path !== this.owner;
    },
  },

  async mounted() {
    if (!this.objective) {
      this.thisObjective = {};
      this.owner = this.activeItemRef.path;
      this.currentOwner = {
        ref: this.activeItemRef,
        name: this.activeItem.name,
      };
      const parent = this.activeItem.department || this.activeItem.organization;
      if (parent) {
        this.potentionalOwner = {
          ref: db.doc(`${getActiveItemType(parent)}s/${parent.id}`),
          name: parent.name,
        };
      }
      return;
    }

    db.collection('objectives')
      .doc(this.objective.id)
      .get()
      .then((snapshot) => {
        this.thisObjective = snapshot.data();
        this.thisObjective.id = this.objective.id;
        this.periodRange = this.getCurrentDateRange();
        this.currentOwner = {
          ref: this.thisObjective.parent,
          name: this.objective.parent.name,
        };
        this.owner = this.currentOwner.ref.path;
        this.loading = false;
      });

    const objectiveRef = await db.doc(`objectives/${this.objective.id}`);
    const keyResults = await db
      .collection('keyResults')
      .where('archived', '==', false)
      .where('objective', '==', objectiveRef);
    await this.$bind('keyResults', keyResults);

    const parent = this.objective.parent.department || this.objective.parent.organization;
    if (parent) {
      const parentRef = db.doc(parent);
      const parentData = (await parentRef.get()).data();
      this.potentionalOwner = {
        ref: parentRef,
        name: parentData.name,
      };
    }
  },

  methods: {
    ...mapActions('okrs', ['setActiveObjective']),

    formattedPeriod,
    syncObjectiveContributors,

    getCurrentDateRange() {
      if (this.thisObjective.startDate && this.thisObjective.endDate) {
        return [this.objective.startDate.toDate(), this.objective.endDate.toDate()];
      }
      if (this.thisObjective.period) {
        return [
          this.objective.period.startDate.toDate(),
          this.objective.period.endDate.toDate(),
        ];
      }
      return null;
    },

    async save() {
      this.loading = true;

      try {
        const { name, description, weight, period } = this.thisObjective;
        const [start, end] = this.periodRange;

        const targetParentRef =
          this.owner === this.potentionalOwner.ref.path
            ? this.potentionalOwner.ref
            : this.currentOwner.ref;

        if (this.thisObjective?.id) {
          // Update objective
          const data = {
            name,
            description: description || '',
            weight: weight || 1,
          };
          if (start && end) {
            data.startDate = start;
            data.endDate = end;
            if (period) {
              const { FieldValue } = firebase.firestore;
              data.period = FieldValue.delete();
            }
          } else {
            data.period = period;
          }

          data.parent = targetParentRef;
          await Objective.update(this.thisObjective.id, data);
          if (this.hasNewOwner) {
            await syncObjectiveContributors(this.thisObjective.id);
          }
          this.$emit('update', this.thisObjective);
        } else {
          // Create new objective
          const { id } = await Objective.create({
            name,
            description: description || '',
            weight: weight || 1,
            parent: this.activeItemRef,
            startDate: start,
            endDate: end,
          });

          if (this.hasNewOwner) {
            await Objective.update(id, { parent: targetParentRef });
            await syncObjectiveContributors(id);
          }

          this.thisObjective.id = id;
          this.$emit('create', this.thisObjective);
        }

        this.$refs.drawer.next();
      } catch (error) {
        this.$refs.drawer.next(false);
        this.$toasted.error(this.$t('toaster.error.save'));
      }
      this.loading = false;
    },

    async archive() {
      this.loading = true;
      try {
        await Objective.archive(this.thisObjective.id);
        this.thisObjective.archived = true;
        this.$emit('archive', this.thisObjective);
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.thisObjective.name })
        );
      }
      this.loading = false;
    },

    async restore() {
      try {
        await Objective.restore(this.thisObjective.id);
        this.thisObjective.archived = false;
        this.$emit('restore', this.thisObjective);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.thisObjective.id })
        );
      }
    },

    close() {
      this.thisObjective = null;
    },

    async useSuggestedPeriod() {
      this.periodRange = [
        this.newestObjective.startDate.toDate(),
        this.newestObjective.endDate.toDate(),
      ];
    },
  },
};
</script>

<style lang="scss" scoped>
.period-suggestion {
  margin: -0.75rem 0 1rem 0;
}

.owner-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 3rem;

  .pkt-form-help {
    white-space: pre-line;
  }

  ::v-deep .pkt-form-group {
    margin-bottom: 0;
  }
}
</style>

<template>
  <paged-drawer-wrapper ref="drawer" :visible="visible && !!thisObjective" @close="close">
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

        <form-component
          v-if="canLift"
          v-model="owner"
          name="owner"
          input-type="select"
          :select-options="ownerOptions"
          :select-reduce="(option) => option.value"
          select-label="label"
          label="Målansvarlig"
          rules="required"
        />

        <pkt-alert v-if="hasNewOwner" skin="warning">
          <p>
            {{
              $t('admin.objective.liftWarning1', {
                curOwner: objective.parent.name,
                newOwner: parentName,
              })
            }}
          </p>
          <p v-if="!hasParentEditRights">
            {{ $t('admin.objective.liftWarning2', { newOwner: parentName }) }}
          </p>
        </pkt-alert>

        <template
          v-if="!thisObjective?.archived"
          #actions="{ handleSubmit, submitDisabled }"
        >
          <btn-cancel :disabled="loading" @click="close" />
          <btn-save
            :label="editMode ? $t('btn.updateObjective') : $t('btn.createObjective')"
            variant="label-only"
            :disabled="submitDisabled || loading"
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
            :label="$t('admin.objective.delete')"
            @click="archive"
          />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { isEqual } from 'date-fns';
import { db } from '@/config/firebaseConfig';
import { formattedPeriod } from '@/util/okr';
import Objective from '@/db/Objective';
import firebase from 'firebase/compat/app';
import locale from 'flatpickr/dist/l10n/no';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import PeriodShortcut from '@/components/period/PeriodShortcut.vue';

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
    visible: {
      type: Boolean,
      required: true,
      default: false,
    },

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
    parentRef: null,
    parentName: null,
  }),

  computed: {
    ...mapState(['activeItemRef']),
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
     * Return `true` if the user should be able to lift current objective.
     */
    canLift() {
      return this.objective?.parent.department || this.objective?.parent.organization;
    },

    ownerOptions() {
      return [
        { label: this.objective.parent.name, value: this.thisObjective.parent.path },
        { label: this.parentName, value: this.parentRef.path },
      ];
    },

    /**
     * Return `true` if a new owner has been chosen for the current objective.
     */
    hasNewOwner() {
      return (
        this.owner &&
        this.objective &&
        this.owner.split('/')[1] !== this.objective.parent.id
      );
    },
  },

  watch: {
    visible: {
      immediate: true,
      async handler(visible) {
        this.thisObjective = null;
        this.periodRange = null;
        if (visible) {
          this.$refs.drawer.reset();
        }

        if (!this.objective) {
          this.thisObjective = {};
          this.periodRange = null;
          return;
        }

        this.loading = true;
        db.collection('objectives')
          .doc(this.objective.id)
          .get()
          .then((snapshot) => {
            this.thisObjective = snapshot.data();
            this.thisObjective.id = this.objective.id;
            this.periodRange = this.getCurrentDateRange();
            this.owner = this.thisObjective.parent.path;
            this.loading = false;
          });

        if (this.canLift) {
          this.parentRef = await db.doc(
            this.objective.parent.department || this.objective.parent.organization
          );
          this.parentName = (await this.parentRef.get()).data().name;
        }
      },
    },
  },

  methods: {
    formattedPeriod,

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

        if (this.thisObjective?.id) {
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
          if (this.hasNewOwner) {
            data.parent = this.parentRef;
          }
          await Objective.update(this.thisObjective.id, data);
          this.$emit('update', this.thisObjective);
        } else {
          const { id } = await Objective.create({
            name,
            description: description || '',
            weight: weight || 1,
            parent: this.activeItemRef,
            startDate: start,
            endDate: end,
          });
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

    close(e) {
      this.$emit('close', e);
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

.pkt-alert {
  margin: 1.5rem 0;
}
</style>

<template>
  <paged-drawer-wrapper ref="drawer" :visible="visible" @close="close">
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(objective ? 'admin.objective.change' : 'admin.objective.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(objective ? 'objective.updated' : 'admin.objective.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page>
      <form-section>
        <form-component
          v-model="thisObjective.name"
          input-type="textarea"
          name="name"
          :disabled="objective?.archived"
          :rows="2"
          :label="$t('fields.name')"
          rules="required"
        />

        <form-component
          v-model="thisObjective.description"
          input-type="textarea"
          :disabled="objective?.archived"
          :rows="2"
          name="description"
          :label="$t('fields.description')"
        />

        <form-component
          v-model="periodRange"
          input-type="date"
          name="period"
          :disabled="objective?.archived"
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

        <template v-if="!objective?.archived" #actions="{ handleSubmit, submitDisabled }">
          <btn-cancel :disabled="loading" @click="close" />
          <btn-save
            :label="objective ? $t('btn.updateObjective') : $t('btn.createObjective')"
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
            @onClick="
              $router.push({
                name: 'ObjectiveHome',
                params: { objectiveId: thisObjective.id },
                query: { createKeyResult: '1' },
              })
            "
          >
            {{ $t('btn.createKeyResult') }}
          </pkt-button>
        </template>
      </div>
    </template>

    <template #footer="{ isDone }">
      <template v-if="objective && !isDone">
        <archived-restore
          v-if="objective.archived"
          :restore="restore"
          object-type="objective"
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
import { isEqual } from 'date-fns';
import Objective from '@/db/Objective';
import firebase from 'firebase/compat/app';
import locale from 'flatpickr/dist/l10n/no';
import { PktButton } from '@oslokommune/punkt-vue2';
import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';
import PeriodShortcut from '@/components/period/PeriodShortcut.vue';

export default {
  name: 'EditObjective',

  components: {
    ArchivedRestore,
    PeriodShortcut,
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
  }),

  computed: {
    ...mapState(['activeItemRef']),

    isSuggestedPeriod() {
      return (
        this.periodRange &&
        this.newestObjective?.startDate &&
        this.newestObjective?.endDate &&
        isEqual(this.periodRange[0], this.newestObjective.startDate.toDate()) &&
        isEqual(this.periodRange[1], this.newestObjective.endDate.toDate())
      );
    },
  },

  watch: {
    visible: {
      immediate: true,
      async handler(visible) {
        if (!visible) {
          this.thisObjective = null;
          this.periodRange = null;
          return;
        }

        if (this.objective) {
          this.thisObjective = { ...this.objective };
          this.periodRange = this.getCurrentDateRange();
        } else {
          this.thisObjective = {};
          this.periodRange = null;
        }
      },
    },
  },

  methods: {
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

        if (this.objective) {
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
          await Objective.update(this.objective.id, data);
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
        await Objective.archive(this.objective.id);
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.objective.name })
        );
      }
      this.loading = false;
    },

    async restore() {
      try {
        await Objective.restore(this.objective.id);
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.objective.id })
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
</style>

<template>
  <paged-drawer-wrapper
    ref="drawer"
    :visible="!!thisKpi"
    :page-count="pageCount"
    @close="$emit('close')"
  >
    <template #title="{ isDone, isSuccess }">
      <template v-if="!isDone">
        {{ $t(editMode ? 'admin.measurement.change' : 'admin.measurement.new') }}
      </template>
      <template v-else-if="isSuccess">
        {{ $t(editMode ? 'admin.measurement.updated' : 'admin.measurement.created') }}
      </template>
      <template v-else>{{ $t('toaster.error.save') }}</template>
    </template>

    <template #page="{ pageIndex, prev }">
      <pkt-alert
        v-if="errorMessage"
        :title="$t('kpi.automation.error')"
        skin="error"
        class="mb-size-32"
        @click="$refs.drawer.goToPage(4)"
      >
        {{ errorMessage }}
        <i18n v-if="$refs.drawer.pageIndex !== 4" path="kpi.automation.reviewSettings">
          <a href="#" @click="$refs.drawer.goToPage(4)">{{
            $t('kpi.automation.automationLink')
          }}</a>
        </i18n>
      </pkt-alert>

      <form-section :hide-errors="true">
        <template v-if="pageIndex === 1">
          <form-component
            v-model="thisKpi.name"
            input-type="input"
            name="name"
            :label="$t('fields.name')"
            :disabled="thisKpi?.archived"
            rules="required"
          />

          <form-component
            v-model="thisKpi.description"
            input-type="textarea"
            :rows="8"
            name="description"
            :disabled="thisKpi?.archived"
            :label="$t('fields.description')"
          />
        </template>

        <template v-else-if="pageIndex === 2">
          <validation-provider rules="required" name="kpiType">
            <div class="pkt-form-group">
              <span class="pkt-form-label">{{ $t('fields.kpitype') }}</span>
              <div
                v-for="{ id, label, description } in kpiTypes"
                :key="id"
                class="pkt-form-group pkt-form-group--row"
              >
                <input
                  :id="id"
                  v-model="thisKpi.kpiType"
                  type="radio"
                  class="pkt-form-check-input pkt-form-check-input--tile"
                  name="radio-group"
                  :value="id"
                />
                <label class="pkt-form-label" :for="id">
                  {{ label }}
                  <span class="description">
                    {{ description }}
                  </span>
                </label>
              </div>

              <pkt-alert v-if="thisKpi.kpiType === 'ri'">
                {{ $t('kpi.help.resultIndicatorWarning') }}
              </pkt-alert>
            </div>
          </validation-provider>
        </template>

        <template v-else-if="pageIndex === 3">
          <form-component
            v-model="thisKpi.format"
            input-type="select"
            name="format"
            :label="$t('kpi.format')"
            rules="required"
            select-label="label"
            :select-options="formats"
            :select-reduce="(option) => option.id"
            type="text"
          />

          <form-component
            v-model="thisKpi.startValue"
            input-type="select"
            name="startValue"
            :label="$t('kpi.startValue')"
            rules="required"
            select-label="label"
            :select-options="startValues"
            :select-reduce="(option) => option.id"
            type="text"
          />

          <form-component
            v-model="thisKpi.preferredTrend"
            input-type="select"
            name="preferredTrend"
            :label="$t('kpi.preferredTrend')"
            rules="required"
            select-label="label"
            :select-options="trendOptions"
            :select-reduce="(option) => option.id"
            type="text"
          />

          <form-component
            v-model="thisKpi.updateFrequency"
            input-type="select"
            name="updateFrequency"
            :label="$t('kpi.updateFrequency.label')"
            rules="required"
            select-label="label"
            :select-options="updateFrequencies"
            :select-reduce="(option) => option.id"
            type="text"
          >
            <template #help>
              {{ $t('kpi.updateFrequency.help') }}
            </template>
          </form-component>
        </template>

        <template v-else-if="pageIndex === 4">
          <span class="pkt-form-label mb-size-8">{{ $t('kpi.automation.title') }}</span>

          <i18n path="kpi.help.updates" tag="p" class="mb-size-32">
            <template #readMoreLink>
              <router-link :to="{ name: 'Help', hash: '#målinger' }" target="_blank">
                {{ $t('kpi.help.readMoreHere') }}
              </router-link>
            </template>
          </i18n>

          <toggle-button
            v-model="thisKpi.auto"
            name="auto"
            :label="$t('kpi.automation.radio')"
          >
            <p>{{ $t('sheets.infoText') }}</p>

            <form-component
              input-type="input"
              type="text"
              :readonly="true"
              :copy-button="true"
              :value="serviceAccountAddress"
            />

            <google-sheets-form-group
              :sheet-id="thisKpi.sheetId"
              :sheet-url.sync="thisKpi.sheetUrl"
              :sheet-name.sync="thisKpi.sheetName"
              :sheet-cell.sync="thisKpi.sheetCell"
            />
          </toggle-button>
        </template>

        <template #actions="{ handleSubmit, submitDisabled }">
          <pkt-button
            v-if="pageIndex === 1"
            :text="$t('btn.cancel')"
            skin="tertiary"
            :disabled="loading || thisKpi?.archived"
            @onClick="thisKpi = null"
          />
          <pkt-button
            v-else
            :text="$t('btn.back')"
            skin="tertiary"
            :disabled="loading || thisKpi?.archived"
            @onClick="prev"
          />
          <btn-save
            :text="pageIndex === pageCount ? $t('btn.complete') : $t('btn.continue')"
            :disabled="submitDisabled || loading || thisKpi?.archived"
            variant="label-only"
            @click="handleSubmit(save)"
          />
        </template>
      </form-section>
    </template>

    <template #footer="{ isDone }">
      <template v-if="editMode && !isDone">
        <archived-restore
          v-if="thisKpi.archived"
          :restore="restore"
          :text="$t('kpi.archived')"
        />
        <div v-else class="button-row">
          <btn-delete
            :disabled="loading"
            :text="$t('admin.measurement.delete')"
            @click="archive"
          />
        </div>
      </template>
    </template>
  </paged-drawer-wrapper>
</template>

<script>
import { mapState } from 'vuex';
import { PktAlert, PktButton } from '@oslokommune/punkt-vue2';
import { functions } from '@/config/firebaseConfig';
import {
  kpiFormats,
  kpiStartValues,
  kpiTypes,
  kpiTrendOptions,
  kpiUpdateFrequencies,
} from '@/util/kpiHelpers';
import { FormSection, ToggleButton, BtnSave, BtnDelete } from '@/components/generic/form';
import ArchivedRestore from '@/components/ArchivedRestore.vue';
import GoogleSheetsFormGroup from '@/components/forms/partials/GoogleSheetsFormGroup.vue';
import Kpi from '@/db/Kpi';
import PagedDrawerWrapper from '@/components/drawers/PagedDrawerWrapper.vue';

export default {
  name: 'EditItemDrawer',

  components: {
    ArchivedRestore,
    PktAlert,
    PktButton,
    PagedDrawerWrapper,
    FormSection,
    GoogleSheetsFormGroup,
    ToggleButton,
    BtnSave,
    BtnDelete,
  },

  props: {
    kpi: {
      type: Object,
      required: false,
      default: null,
    },
  },

  data: () => ({
    thisKpi: null,
    pageCount: 4,
    loading: false,
    formats: kpiFormats(),
    startValues: kpiStartValues(),
    trendOptions: kpiTrendOptions(),
    kpiTypes: kpiTypes(),
    updateFrequencies: kpiUpdateFrequencies(),
    serviceAccountAddress: import.meta.env.VITE_SHEETS_SERVICE_ACCOUNT,
  }),

  computed: {
    ...mapState(['activeItemRef']),

    editMode() {
      return !!this.thisKpi?.id;
    },

    errorMessage() {
      return this.kpi?.error && this.kpi.auto ? this.showError(this.kpi.error) : null;
    },
  },

  mounted() {
    if (!this.kpi) {
      this.thisKpi = {
        name: '',
        description: '',
        format: 'integer',
        startValue: 'zero',
        preferredTrend: 'increase',
        kpiType: 'plain',
        updateFrequency: 'daily',
        sheetUrl: '',
        sheetName: '',
        sheetCell: '',
        api: true,
        auto: false,
      };
      return;
    }

    this.loading = true;
    this.thisKpi = this.kpi ? { id: this.kpi.id, ...this.kpi } : {};
    this.loading = false;
  },

  methods: {
    async save() {
      const { pageIndex, next } = this.$refs.drawer;

      if (pageIndex < this.pageCount) {
        next();
      } else {
        this.loading = true;

        try {
          const {
            auto,
            description,
            format,
            kpiType,
            name,
            preferredTrend,
            sheetCell,
            sheetId,
            sheetName,
            sheetUrl,
            startValue,
            updateFrequency,
          } = this.thisKpi;

          // For backwards compatibility, check for any previously configured sheet
          // details if the `auto` property doesn't exist on the model.
          const sheetsConfigured = Boolean(
            (sheetId || sheetUrl) && sheetName && sheetCell
          );

          const data = {
            auto: auto || (auto === undefined && sheetsConfigured),
            description,
            format,
            kpiType,
            name,
            preferredTrend,
            sheetCell,
            sheetName,
            sheetUrl: sheetUrl || '',
            startValue: startValue || 'zero',
            updateFrequency,
          };

          if (this.thisKpi?.id) {
            await Kpi.update(this.thisKpi.id, data);
            if (this.thisKpi.auto) {
              this.testConnection();
            }
          } else {
            const { id } = await Kpi.create({
              ...data,
              parent: this.activeItemRef,
            });
            this.thisKpi.id = id;
            this.$emit('create', this.thisKpi);
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
      try {
        this.loading = true;
        await Kpi.archive(this.thisKpi.id);
        this.thisKpi.archived = true;
        this.$refs.drawer.reset();
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.thisKpi.name })
        );
      } finally {
        this.loading = false;
      }
    },

    async restore() {
      try {
        this.loading = true;
        await Kpi.restore(this.thisKpi.id);
        this.thisKpi.archived = false;
      } catch {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.thisKpi.id })
        );
      } finally {
        this.loading = false;
      }
    },

    showError(msg) {
      if (['400', '403', '404'].includes(msg)) {
        return this.$t(`sheets.${msg}`);
      }
      if (msg.includes('Cannot find data in cell')) {
        const cell = msg.split('cell ')[1];
        return this.$t('sheets.noDataInCell', { cell });
      }
      return msg;
    },

    async testConnection() {
      try {
        await functions.httpsCallable('fetchKpiDataTrigger')(this.kpi.id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};
</script>

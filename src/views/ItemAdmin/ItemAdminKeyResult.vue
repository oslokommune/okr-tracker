<template>
  <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
  <div v-else-if="keyResult" class="details">
    <archived-restore v-if="keyResult.archived" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-keyResult" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="keyResult.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('keyResult.description') }}</span>
          <input v-model="keyResult.description" class="form__field" type="text" />
        </label>

        <validation-provider v-slot="{ errors }" rules="required" name="objective">
          <label class="form-group">
            <span class="form-label">{{ $t('keyResult.objective') }}</span>
            <v-select
              v-model="keyResult.objective"
              label="name"
              :options="objectives"
              :clearable="false"
              @input="changedObjective = true"
            >
              <template #option="option">
                {{ option.name }}
                <span v-if="option.period && option.period.name">
                  ({{ option.period.name }})
                </span>
              </template>
            </v-select>
            <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
          </label>
        </validation-provider>

        <form-component
          v-model="keyResult.unit"
          input-type="input"
          name="unit"
          :label="$t('keyResult.unit')"
          rules="required|max:25"
          type="text"
        />

        <div class="form-row">
          <form-component
            v-model.number="keyResult.startValue"
            input-type="input"
            name="startValue"
            :label="$t('keyResult.startValue')"
            rules="required"
            type="number"
          />

          <form-component
            v-model.number="keyResult.targetValue"
            input-type="input"
            name="targetValue"
            :label="$t('keyResult.targetValue')"
            rules="required"
            type="number"
          />

          <form-component
            v-model.number="keyResult.weight"
            input-type="input"
            name="weight"
            :label="$t('keyResult.weight')"
            rules="required|decimal|positiveNotZero"
            type="text"
          />
        </div>

        <toggle-button
          v-model="keyResult.auto"
          :label="$t('keyResult.automation.header')"
        >
          <p>
            <router-link :to="{ name: 'Help' }">
              {{ $t('keyResult.automation.readMore') }}
            </router-link>
          </p>

          <google-sheets-form-group
            :sheet-id.sync="keyResult.sheetId"
            :sheet-name.sync="keyResult.sheetName"
            :sheet-cell.sync="keyResult.sheetCell"
          />

          <div class="validation">
            <div v-if="loadingConnection" class="validation__loading">
              <i class="fa fa-spinner fa-pulse" />
              {{ $t('general.loading') }}
            </div>
            <div v-if="!loadingConnection && keyResult.error" class="validation__error">
              <i class="fa fa-exclamation-triangle" />
              {{ showError(keyResult.error) }}
            </div>
            <div v-if="!loadingConnection && keyResult.valid" class="validation__valid">
              <i class="fa fa-check-circle" />
              OK
            </div>
            <button class="btn validation-check" type="button" @click="testConnection">
              {{ $t('keyResult.automation.testConnection') }}
            </button>
          </div>
        </toggle-button>

        <toggle-button v-model="keyResult.api">
          <template #label>
            {{ $t('keyResult.api.radio') }}
            <i v-tooltip="$t('keyResult.api.tooltip')" class="icon fa fa-info-circle" />
          </template>

          <form-component
            input-type="input"
            type="text"
            label="API"
            rules="required"
            :readonly="true"
            :copy-button="true"
            :value="apiCurl(keyResult)"
          >
            <template #help>
              <span class="form-help">{{ $t('admin.curlHelp') }}</span>
            </template>
          </form-component>
        </toggle-button>

        <div v-if="keyResult.auto && keyResult.api" class="ok-alert ok-alert--warning">
          {{ $t('keyResult.apiAndKeyRes') }}
        </div>
      </form>
    </validation-observer>

    <div class="button-row">
      <btn-delete v-if="!keyResult.archived" :disabled="loading" @click="archive" />
      <btn-save form="update-keyResult" :disabled="loading" />
    </div>
  </div>
</template>

<script>
import { db, functions } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import { toastArchiveAndRevert } from '@/util';
import { BtnSave, BtnDelete } from '@/components/generic/form/buttons';
import ToggleButton from '@/components/generic/form/ToggleButton.vue';
import GoogleSheetsFormGroup from '@/components/forms/partials/GoogleSheetsFormGroup.vue';

export default {
  name: 'ItemAdminKeyResult',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
    ContentLoaderOkrDetails: () =>
      import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
    BtnSave,
    BtnDelete,
    ToggleButton,
    GoogleSheetsFormGroup,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  data: () => ({
    keyResult: null,
    objectives: [],
    changedObjective: false,
    loading: false,
    loadingConnection: false,
    isLoadingDetails: false,
  }),

  watch: {
    data: {
      immediate: true,
      async handler() {
        this.isLoadingDetails = true;
        const parent = await db
          .collection('slugs')
          .doc(this.data.parent.slug)
          .get()
          .then((snapshot) => snapshot.data().reference);
        this.$bind(
          'objectives',
          db.collection('objectives').where('parent', '==', parent)
        );
        this.$bind('keyResult', db.collection('keyResults').doc(this.data.id));
        this.isLoadingDetails = false;
      },
    },
    keyResult() {
      if (this.keyResult.auto === undefined) {
        this.$set(this.keyResult, 'auto', false);
      }
      if (this.keyResult.api === undefined) {
        this.$set(this.keyResult, 'api', false);
      }
    },
  },

  methods: {
    async update() {
      this.loading = true;

      try {
        const {
          id,
          name,
          weight,
          description,
          objective,
          auto,
          unit,
          startValue,
          targetValue,
          sheetId,
          sheetName,
          sheetCell,
          api,
        } = this.keyResult;

        const data = {
          name: name || '',
          weight: weight || 1,
          description: description || '',
          objective: db.collection('objectives').doc(objective.id),
          auto: auto || false,
          unit: unit || '',
          startValue: startValue || 0,
          targetValue: targetValue === undefined ? 100 : targetValue,
          sheetCell: sheetCell || '',
          sheetId: sheetId || '',
          sheetName: sheetName || '',
          api: api || false,
        };

        await KeyResult.update(id, data);

        if (this.changedObjective) {
          await this.$router.push({ query: {} });
          await this.$router.push({ query: { type: 'keyResult', id } });
        }

        this.$toasted.show(this.$t('toaster.savedChanges'));
      } catch (error) {
        console.log(error);
        this.$toasted.error(this.$t('toaster.error.save'));
      }

      this.loading = false;
    },
    async archive() {
      this.loading = true;
      try {
        await this.$router.push({
          query: { type: 'objective', id: this.keyResult.objective.id },
        });
        await KeyResult.archive(this.keyResult.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.keyResult.name, callback: restoreCallback });
      } catch (error) {
        this.loading = false;
        this.$toasted.error(
          this.$t('toaster.error.archive', { document: this.keyResult.name })
        );
        throw new Error(error.message);
      }
      this.loading = false;
    },

    async restore() {
      this.loading = true;

      try {
        await KeyResult.restore(this.keyResult.id);
        this.keyResult.archived = false;
        this.$toasted.show(this.$t('toaster.restored'));
      } catch (error) {
        this.$toasted.error(
          this.$t('toaster.error.restore', { document: this.keyResult.name })
        );
        throw new Error(error.message);
      }
      this.loading = false;
    },

    async testConnection() {
      this.loadingConnection = true;
      await this.update();
      try {
        const myCall = functions.httpsCallable('triggerScheduledFunction');
        await myCall(this.keyResult.id);
        this.$toasted.show(this.$t('general.success'));
      } catch (error) {
        this.loadingConnection = false;
        this.$toasted.error(error.message);
        throw new Error(error.message);
      }
      this.loadingConnection = false;
    },

    showError(msg) {
      if (msg === '403') {
        return this.$t('error.403');
      }
      if (msg === '404') {
        return this.$t('error.404');
      }

      if (msg.includes('Cannot find data in cell')) {
        const cell = msg.split('cell ')[1];
        return this.$t('error.noDataInCell', { cell });
      }
      return msg;
    },

    apiCurl: (keyResult) =>
      `curl -X POST -H "okr-team-secret: <YOUR SECRET>" -H "x-api-key: <YOUR API-KEY>" -H "Content-Type: application/json" -d '{ "progress": <VALUE> }'  ${
        import.meta.env.VITE_API_GATEWAY_URL
      }/keyres/${keyResult.id}`,
  },
};
</script>

<style lang="scss" scoped>
.validation {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-grey-100);
}

.validation__valid {
  padding: 0.5rem;
  background: var(--color-green);
  border-radius: 2px;
}

.validation__loading {
  padding: 0.5rem;
  border-radius: 2px;
}

.validation__error {
  padding: 0.5rem;
  background: var(--color-red);
  border-radius: 2px;
}

.validation-check {
  margin-top: 0.5rem;
}

.details {
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(var(--color-grey-400-rgb), 0.3);

  @media screen and (min-width: bp(l)) {
    align-self: flex-start;
    width: span(3, 0, span(10));
    margin-top: 0;
    margin-left: span(0, 1, span(10));
  }

  @media screen and (min-width: bp(xl)) {
    width: span(3, 0, span(10));
    margin-left: span(1, 2, span(10));
  }
}
</style>

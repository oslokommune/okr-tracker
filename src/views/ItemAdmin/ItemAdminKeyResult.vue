<template>
  <div v-if="keyResult">
    <archived-restore v-if="keyResult.archived" :delete-deep="deleteDeep" :restore="restore" />

    <validation-observer v-slot="{ handleSubmit }">
      <form id="update-keyresult" @submit.prevent="handleSubmit(update)">
        <form-component
          v-model="keyResult.name"
          input-type="input"
          name="name"
          :label="$t('fields.name')"
          rules="required"
          type="text"
          @edited-data="edit"
        />

        <label class="form-group">
          <span class="form-label">{{ $t('keyres.description') }}</span>
          <input v-model="keyResult.description" class="form__field" type="text" @input="edit"/>
        </label>

        <validation-provider v-slot="{ errors }" rules="required" name="objective">
          <label class="form-group">
            <span class="form-label">{{ $t('keyres.objective') }}</span>
            <v-select
              v-model="keyResult.objective"
              label="name"
              :options="objectives"
              :clearable="false"
              @input="changedObjective = true"
              @edited-data="edit"
            >
              <template #option="option">
                {{ option.name }}
                <span v-if="option.period && option.period.name"> ({{ option.period.name }}) </span>
              </template>
            </v-select>
            <span v-if="errors[0]" class="form-field--error">{{ errors[0] }}</span>
          </label>
        </validation-provider>

        <form-component
          v-model="keyResult.unit"
          input-type="input"
          name="unit"
          :label="$t('keyres.unit')"
          rules="required|max:25"
          type="text"
          @edited-data="edit"
        />

        <div class="form-row">
          <form-component
            v-model.number="keyResult.startValue"
            input-type="input"
            name="startValue"
            :label="$t('keyres.startValue')"
            rules="required"
            type="number"
            @edited-data="edit"
          />

          <form-component
            v-model.number="keyResult.targetValue"
            input-type="input"
            name="targetValue"
            :label="$t('keyres.targetValue')"
            rules="required"
            type="number"
            @edited-data="edit"
          />

          <form-component
            v-model.number="keyResult.weight"
            input-type="input"
            name="weight"
            :label="$t('keyres.weight')"
            rules="required|decimal|positiveNotZero"
            type="text"
            @edited-data="edit"
          />
        </div>

        <div class="toggle__container">
          <span class="toggle__label">
            {{ $t('keyres.api.radio') }}
            <i v-tooltip="$t('keyres.api.tooltip')" class="icon fa fa-info-circle" />
          </span>
          <label class="toggle">
            <input v-model="keyResult.api" class="toggle__input" type="checkbox" @edited-data="edit"/>
            <span class="toggle__switch"></span>
          </label>
        </div>

        <div class="toggle__container">
          <span class="toggle__label">{{ $t('keyres.automation.header') }}</span>
          <label class="toggle">
            <input v-model="keyResult.auto" class="toggle__input" type="checkbox" @edited-data="edit"/>
            <span class="toggle__switch"></span>
          </label>
        </div>

        <div v-if="keyResult.auto && keyResult.api" class="ok-alert ok-alert--warning">
          {{ $t('keyres.apiAndKeyRes') }}
        </div>

        <div v-if="keyResult.auto">
          <p>
            <router-link :to="{ name: 'Help' }">{{ $t('keyres.automation.readMore') }}</router-link>
          </p>

          <form-component
            v-model="keyResult.sheetId"
            :label="$t('keyres.automation.googleSheetId')"
            :rules="`${keyResult.auto ? 'required' : ''}`"
            input-type="input"
            name="sheetId"
            type="text"
            @edited-data="edit"
          >
            <template #help>
              <span class="form-help" v-html="$t('keyres.automation.googleSheetIdHelp')"></span>
            </template>
          </form-component>

          <form-component
            v-model="keyResult.sheetName"
            :label="$t('keyres.automation.sheetsTab')"
            :rules="`${keyResult.auto ? 'required' : ''}`"
            input-type="input"
            name="sheetTab"
            type="text"
            @edited-data="edit"
          >
            <template #help>
              <span class="form-help">{{ $t('keyres.automation.sheetsTabHelp') }}</span>
            </template>
          </form-component>

          <form-component
            v-model="keyResult.sheetCell"
            :label="$t('keyres.automation.sheetsCell')"
            :rules="`${keyResult.auto ? 'required' : ''}`"
            input-type="input"
            name="sheetCell"
            type="text"
            @edited-data="edit"
          >
            <template #help>
              <span class="form-help">{{ $t('keyres.automation.sheetsCellHelp') }}</span>
            </template>
          </form-component>

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
              {{ $t('keyres.automation.testConnection') }}
            </button>
          </div>
        </div>
      </form>
    </validation-observer>

    <label v-if="keyResult.api" class="form-group">
      <span class="form-label">API</span>
      <span class="form-help">Push updates with curl</span>
      <input :value="apiCurl(keyResult)" type="text" disabled class="form__field" />
    </label>

    <div class="button-row">
      <button class="btn btn--icon btn--pri" form="update-keyresult" :disabled="loading || !changes">
        <i class="icon fa fa-fw fa-save" />
        {{ $t('btn.saveChanges') }}
      </button>
      <button
        v-if="!keyResult.archived"
        class="btn btn--icon btn--danger btn--icon-pri"
        :disabled="loading"
        @click="archive"
      >
        <i class="icon fa fa-fw fa-trash" />
        {{ $t('btn.archive') }}
      </button>
    </div>
  </div>
</template>

<script>
import { db, functions } from '@/config/firebaseConfig';
import KeyResult from '@/db/KeyResult';
import { toastArchiveAndRevert } from '@/util';

export default {
  name: 'ItemAdminKeyResult',

  components: {
    ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
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
    changes: false
  }),

  watch: {
    data: {
      immediate: true,
      async handler() {
        const parent = await db
          .collection('slugs')
          .doc(this.data.parent.slug)
          .get()
          .then((snapshot) => snapshot.data().reference);
        this.$bind('objectives', db.collection('objectives').where('parent', '==', parent));
        this.$bind('keyResult', db.collection('keyResults').doc(this.data.id));
      },
    },
  },

  methods: {
    edit() {
      this.changes = true;
    },
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
      this.changes = false;
    },
    async archive() {
      this.loading = true;
      try {
        await this.$router.push({ query: { type: 'objective', id: this.keyResult.objective.id } });
        await KeyResult.archive(this.keyResult.id);

        const restoreCallback = this.restore.bind(this);

        toastArchiveAndRevert({ name: this.keyResult.name, callback: restoreCallback });
      } catch (error) {
        this.loading = false;
        this.$toasted.error(this.$t('toaster.error.archive', { document: this.keyResult.name }));
        throw new Error(error.message);
      }
      this.loading = false;
      this.changes = false;
    },

    async restore() {
      this.loading = true;

      try {
        await KeyResult.restore(this.keyResult.id);
        this.keyResult.archived = false;
        this.$toasted.show(this.$t('toaster.restored'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.restore', { document: this.keyResult.name }));
        throw new Error(error.message);
      }
      this.loading = false;
      this.changes = false;
    },

    async deleteDeep() {
      this.loading = true;

      try {
        await this.$router.push({ query: { type: 'objective', id: this.keyResult.objective.id } });
        await KeyResult.deleteDeep(this.keyResult.id);
        this.$toasted.show(this.$t('toaster.delete.permanently'));
      } catch (error) {
        this.$toasted.error(this.$t('toaster.error.delete', { document: this.keyResult.name }));
        throw new Error(error.message);
      }

      this.loading = false;
      this.changes = false
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
      if (msg === '403') return this.$t('error.403');
      if (msg === '404') return this.$t('error.404');

      if (msg.includes('Cannot find data in cell')) {
        const cell = msg.split('cell ')[1];
        return this.$t('error.noDataInCell', { cell });
      }
      return msg;
    },

    apiCurl: (keyResult) => {
      return `curl -X POST -H "okr-team-secret: <YOUR SECRET>" -H "x-api-key: <YOUR API-KEY>" -H "Content-Type: application/json" -d '{ "progress": <VALUE> }'  ${
        import.meta.env.VITE_API_GATEWAY_URL
      }/kpi/${keyResult.id}`;
    },
  },
};
</script>

<style lang="scss">
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
</style>

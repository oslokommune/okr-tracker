<template>
  <div>
    <form-component
      v-model="sheetUrlModel"
      input-type="input"
      name="sheetUrl"
      :label="$t('keyResult.automation.googleSheetUrl')"
      rules="required"
      type="url"
    >
      <template #help>
        <span v-html="$t('keyResult.automation.googleSheetUrlHelp')" />
      </template>
    </form-component>

    <div class="pkt-grid">
      <form-component
        v-model="sheetNameModel"
        class="pkt-cell pkt-cell--span12 pkt-cell--span6-tablet-up"
        input-type="input"
        name="sheetTab"
        :label="$t('keyResult.automation.sheetsTab')"
        :placeholder="$t('keyResult.automation.sheetsTabPlaceholder')"
        rules="required"
        type="text"
      >
        <template #help>
          <span v-html="$t('keyResult.automation.sheetsTabHelp')" />
        </template>
      </form-component>

      <form-component
        v-model="sheetCellModel"
        class="pkt-cell pkt-cell--span12 pkt-cell--span6-tablet-up"
        input-type="input"
        name="sheetCell"
        :label="$t('keyResult.automation.sheetsCell')"
        placeholder="A1"
        rules="required"
        type="text"
      >
        <template #help>
          <span v-html="$t('keyResult.automation.sheetsCellHelp')" />
        </template>
      </form-component>
    </div>
  </div>
</template>

<script>
const GOOGLE_SHEETS_URL_BASE = 'https://docs.google.com/spreadsheets/d/';

export default {
  name: 'GoogleSheetsFormGroup',

  props: {
    sheetId: {
      required: false,
      type: String,
      default: '',
    },
    sheetUrl: {
      required: false,
      type: String,
      default: '',
    },
    sheetName: {
      required: false,
      type: String,
      default: '',
    },
    sheetCell: {
      required: false,
      type: String,
      default: '',
    },
  },

  computed: {
    sheetUrlModel: {
      get() {
        // For backward compatibility with the old `sheetId`.
        if (!this.sheetUrl && this.sheetId) {
          return GOOGLE_SHEETS_URL_BASE + this.sheetId;
        }
        return this.sheetUrl;
      },
      set(value) {
        this.$emit('update:sheetUrl', value);
      },
    },
    sheetNameModel: {
      get() {
        return this.sheetName;
      },
      set(value) {
        this.$emit('update:sheetName', value);
      },
    },
    sheetCellModel: {
      get() {
        return this.sheetCell;
      },
      set(value) {
        this.$emit('update:sheetCell', value);
      },
    },
  },
};
</script>

<template>
  <div class="editObjective">
    <content-loader-okr-details v-if="isLoadingDetails"></content-loader-okr-details>
    <div v-else-if="!isLoadingDetails">
      <h1 class="heading">{{ objective.id? $t('admin.objective.change') : $t('admin.objective.new') }}</h1>
      <archived-restore v-if="objective && objective.archived" :restore="restore" :objectType="$t('archived.objective')"/>
      <form-section>
        <form-component
          v-model="objective.name"
          input-type="textarea"
          name="name"
          :rows="2"
          :label="$t('fields.name')"
          rules="required"
        />

        <form-component
          v-model="objective.description"
          input-type="textarea"
          :rows="2"
          name="description"
          :label="$t('fields.description')"
        />

        <form-component
          v-model="periodRange"
          input-type="date"
          name="period"
          :label="$t('fields.period')"
          :placeholder="$t('general.selectRange')"
          :date-picker-config="flatPickerConfig"
        />

        <template #actions="{ handleSubmit, submitDisabled }" v-if="!objective.archived">
          <btn-cancel :disabled="loading" @click="TOGGLE_DRAWER({show: false})" />
          <btn-save :label="objective.id? $t('btn.updateObjective') : $t('btn.createObjective')"
                    :disabled="!changed || loading"
                    @click="handleSubmit(update)" />

          <div class="delete">
            <btn-delete v-if="objective.id" :disabled="loading" @click="archive" />
          </div>
        </template>

      </form-section>
    </div>
  </div>

</template>

<script>
  import { mapMutations, mapState } from 'vuex';
  import Objective from '@/db/Objective';
  import { db } from '@/config/firebaseConfig';
  import firebase from 'firebase/app';
  import locale from 'flatpickr/dist/l10n/no';
  import { FormSection, BtnSave, BtnDelete, BtnCancel } from '@/components/generic/form';

  export default {
    name: 'EditObjective',

    components: {
      ArchivedRestore: () => import('@/components/ArchivedRestore.vue'),
      ContentLoaderOkrDetails: () =>
        import('@/components/ContentLoader/ContentLoaderItemAdminOKRDetails.vue'),
      FormSection,
      BtnSave,
      BtnDelete,
      BtnCancel,
    },

    props: {
      data: {
        type: Object,
        required: false,
      },
    },
    data: () => ({
      objective: {},
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
      isLoadingDetails: false,
      periodEdited: false
    }),

    computed: {
      ...mapState(['activeItemRef', 'periods']),
      changed() {
        const nameEdited = this.objective?.name !== this.data?.name;
        const descriptionEdited = this.objective?.description !== this.data?.description;
        const periodEdited = this.objective?.period !== this.data?.period;
        const startEndEdited = (this.periodRange?.[0].getTime() !== this.data?.startDate?.toDate().getTime())
          || (this.periodRange?.[1].getTime() !== this.data?.endDate?.toDate().getTime());

        if (nameEdited || descriptionEdited || periodEdited || startEndEdited) {
          return true;
        }
      }
    },

    watch: {
      data: {
        immediate: true,
        async handler() {
          this.isLoadingDetails = true;
          if (this.data?.objective.id) {
            this.objective = { ...this.data.objective, id: this.data.objective.id };
            this.periodRange = this.getCurrentDateRange();
          }
          this.isLoadingDetails = false;
        },
      },
    },

    methods: {
      ...mapMutations(['TOGGLE_DRAWER']),

      getCurrentDateRange() {
        if (this.objective.startDate && this.objective.endDate) {
          return [this.objective.startDate.toDate(), this.objective.endDate.toDate()];
        } else if (this.objective.period) {
          return [this.objective.period.startDate.toDate(), this.objective.period.endDate.toDate()];
        }
        return null;
      },
      async update() {
        this.loading = true;
        try {
          const { id, name, description, weight, period } = this.objective;
          const [start, end] = this.periodRange;

          if (id) {
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
            await Objective.update(id, data);
            await this.$router.push({ query: { type: 'objective', id } });

          } else {
            const { id } = await Objective.create({
              name,
              description: description || '',
              weight: weight || 1,
              parent: this.activeItemRef,
              startDate: start,
              endDate: end,
            });
            this.objective = { ...db.collection('objectives').doc(id), id: id };
            await this.$router.push({ query: { type: 'objective', id } });
          }

          this.TOGGLE_DRAWER({
            type: 'savedObjective',
            show: true,
            data: {
              objective: this.objective,
            },
          })

        } catch (error) {
          this.$toasted.error(this.$t('toaster.error.save'));
        }
        this.loading = false;
      },

      async archive() {
        this.loading = true;
        try {
          await Objective.archive(this.objective.id);
          this.objective.archived = true;
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
          this.objective.archived = false;
        } catch {
          this.$toasted.error(
            this.$t('toaster.error.restore', { document: this.objective.id })
          );
        }
      },
    },
  };
</script>
<style lang="scss" scoped>
  @use "@oslokommune/punkt-css/dist/scss/abstracts/mixins/typography" as *;

  .editObjective {
    padding: 0 2.5rem 2.5rem 2.5rem;
  }

  .heading {
    padding-bottom: 1rem;
    @include get-text("pkt-txt-30-medium");
    color: var(--color-text);
  }

  .details {
    padding: 0 2rem 0 2rem;
  }

  .form-row {
    display: grid;
    grid-gap: 0.5rem;
    grid-template-columns: minmax(10rem, 2fr) auto minmax(10rem, 2fr);
    align-items: end;
    margin: 1rem 0;

    & .form-group {
      margin: 0;
    }
    .form-field + .form-field {
      margin-left: 1rem;
    }
  }

  .delete {
    position: absolute;
    right: 2rem;
    bottom: 2rem;
  }

  .editObjective__footer {
    margin-top: auto;
    padding: 1rem;
    font-size: 0.79rem;
  }

</style>

<script>
import Btn from './BtnBase.vue';

export default {
  name: 'BtnCancel',

  components: {
    Btn,
  },
  extends: Btn,

  props: {
    label: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.cancel');
      },
    },
    variant: {
      type: String,
      required: false,
      default: 'tertiary',
    },
  },
};
</script>

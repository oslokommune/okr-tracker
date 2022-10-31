<script>
import Btn from './Btn.vue';

export default {
  name: 'BtnSave',
  extends: Btn,

  props: {
    label: {
      type: String,
      required: false,
      default() {
        return this.$t('btn.save');
      },
    },
    variant: {
      type: String,
      required: false,
      default: 'confirm',
    },
    icon: {
      type: String,
      required: false,
      default: 'save',
    },
  },
};
</script>

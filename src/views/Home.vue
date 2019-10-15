<template>
  <div>
    <h1>Home</h1>
    <add-product></add-product>

    <add-objective></add-objective>

    <hr />
  </div>
</template>

<script>
import { mapState } from "vuex";

import addProduct from "@/components/addProduct";
import addObjective from "@/components/addObjective";

export default {
  components: {
    addProduct,
    addObjective
  },
  computed: {
    ...mapState(["data"])
  }
};
</script>

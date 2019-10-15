<template>
  <div>
    <h1>Home</h1>
    <add-product></add-product>

    <add-objective></add-objective>

    <add-key-result></add-key-result>

    <hr />
  </div>
</template>

<script>
import { mapState } from "vuex";

import addProduct from "@/components/addProduct";
import addObjective from "@/components/addObjective";
import addKeyResult from "@/components/addKeyResult";

export default {
  components: {
    addProduct,
    addObjective,
    addKeyResult
  },
  computed: {
    ...mapState(["data"])
  }
};
</script>

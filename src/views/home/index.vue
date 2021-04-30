<template>
  <div>
    <common-graph></common-graph>
    <target-troops-graph></target-troops-graph>
  </div>
</template>

<script>
import CommonGraph from './CommonGraph'
import TargetTroopsGraph from './TargetTroopsGraph'
export default {
  name: 'HomePage',
  components: { CommonGraph, TargetTroopsGraph }
}
</script>

<style lang="scss" scoped></style>

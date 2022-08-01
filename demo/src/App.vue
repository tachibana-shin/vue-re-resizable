<template>
  <IResizable
    :defaultSize="{
      width: '220px',
      height: '100%'
    }"
    maxWidth="60%"
    minWidth="1"
    :enable="{
      top: false,
      right: true,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false
    }"
  >
    <div>hello</div>
  </IResizable>
</template>

<script lang="ts" setup>
import IResizable from "../../src/index.vue"
</script>

<style lang="scss" scoped>
div {
  background: red;
}
</style>

<template>
  <div
    class="resizer"
    :class="`resizer-${direction}`"
    @mousedown="emit('resize:start', $event)"
    @touchstart="emit('resize:start', $event)"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { Direction } from "./types"

defineProps<{
  direction: Direction
}>()
const emit = defineEmits<{
  (name: "resize:start", value: MouseEvent | TouchEvent): void
}>()
</script>

<style lang="scss" scoped>
@mixin rowSizeBase {
  width: 100%;
  height: 10px;
  top: 0px;
  left: 0px;
  cursor: row-resize;
}
@mixin colSizeBase {
  width: 10px;
  height: 100%;
  top: 0px;
  left: 0px;
  cursor: col-resize;
}
@mixin edgeBase {
  width: 20px;
  height: 20px;
  position: absolute;
}

.resizer {
  position: absolute;
  user-select: none;
  &.resizer-top {
    @include rowSizeBase;
    top: -5px;
  }
  &.resizer-right {
    @include colSizeBase;
    left: auto;
    right: -5px;
  }
  &.resizer-bottom {
    @include rowSizeBase;
    top: auto;
    bottom: -5px;
  }
  &.resizer-left {
    @include colSizeBase;
    left: -5px;
  }
  &.resizer-top-right {
    @include edgeBase;
    right: -10px;
    top: -10px;
    cursor: ne-resize;
  }
  &.resizer-bottom-right {
    @include edgeBase;
    right: -10px;
    bottom: -10px;
    cursor: se-resize;
  }
  &.resizer-bottom-left {
    @include edgeBase;
    left: -10px;
    bottom: -10px;
    cursor: sw-resize;
  }
  &.resizer-top-left {
    @include edgeBase;
    left: -10px;
    top: -10px;
    cursor: nw-resize;
  }
}
</style>

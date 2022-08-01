<template>
  <div
    ref="resizable"
    :style="{
      position: 'relative',
      userSelect: isResizing ? 'none' : 'auto',
      ...sizeStyle,
      maxWidth,
      maxHeight,
      minWidth,
      minHeight,
      boxSizing: 'border-box',
      flexShrink: 0,
      flexBasis: flexBasisRet
    }"
  >
    <div :style="backgroundStyle" v-if="isResizing" />
    <slot />

    <template v-if="enable">
      <Resizer
        v-for="[item] in Object.entries(enable).filter(([key, val]) => val)"
        :key="item"
        :direction="item as Direction"
        @resize:start="onResizeStart($event, item as Direction)"
        :style="resizerStyles?.[item as Direction]"
        :class="resizerClasses?.[item as Direction]"
      >
        <slot :name="`resizer-${item}`" />
      </Resizer>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {
  computed,
  reactive,
  Ref,
  ref,
  onMounted,
  onBeforeMount
} from "vue"
import {
  Direction,
  Enable,
  ResizerClasses,
  ResizerStyles,
  Size,
  NumberSize
} from "./types"
import { DEFAULT_SIZE } from "./DEFAULT_SIZE"
import {
  calculateNewMax,
  clamp,
  findClosestSnap,
  getStringSize,
  hasDirection,
  isMouseEvent,
  isTouchEvent,
  snap
} from "./helpers"
import Resizer from "./Resizer.vue"

const props = withDefaults(defineProps<{
  grid?: [number, number]
  snap?: {
    x?: number[]
    y?: number[]
  }
  snapGap?: number
  bounds?: "parent" | "window" | HTMLElement
  boundsByDirection?: boolean
  size?: Partial<Size>
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  lockAspectRatio?: boolean | number
  lockAspectRatioExtraWidth?: number
  lockAspectRatioExtraHeight?: number
  enable?: Enable

  resizerStyles?: ResizerStyles
  resizerClasses?: ResizerClasses

  defaultSize?: Partial<Size>
  scale?: number
  resizeRatio?: number
}>(), {
  enable: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    top: true,
    right: true,
    bottom: true,
    left: true,
    topRight: true,
    bottomRight: true,
    bottomLeft: true,
    topLeft: true
  },
  // eslint-disable-next-line vue/require-valid-default-prop
  grid: [1, 1],
  lockAspectRatio: false,
  lockAspectRatioExtraWidth: 0,
  lockAspectRatioExtraHeight: 0,
  scale: 1,
  resizeRatio: 1,
  snapGap: 0
})
const emit = defineEmits<{
  (
    name: "resize:start",
    value: {
      event: MouseEvent | TouchEvent
      direction: Direction
      el: HTMLDivElement
    }
  ): boolean | void
  (
    name: "resize:stop" | "resize",
    value: {
      event: MouseEvent | TouchEvent
      direction: Direction
      el: HTMLDivElement
      delta: NumberSize
    }
  ): void
}>()

const resizable = ref<HTMLDivElement>()

const parentNode = computed<HTMLElement | undefined>(
  () => resizable.value?.parentNode as HTMLElement
)
const window = computed(() => {
  return resizable.value?.ownerDocument.defaultView
})
const propsSize = computed<Size>(() => {
  const width =
    props.size?.width ?? props.defaultSize?.width ?? DEFAULT_SIZE.width
  const height =
    props.size?.height ?? props.defaultSize?.height ?? DEFAULT_SIZE.height

  return { width, height }
})
const size = {
  get value() {
    let width = 0
    let height = 0
    if (resizable.value && window.value) {
      const orgWidth = resizable.value.offsetWidth
      const orgHeight = resizable.value.offsetHeight
      // HACK: Set position `relative` to get parent size.
      //       This is because when re-resizable set `absolute`, I can not get base width correctly.
      const orgPosition = resizable.value.style.position
      if (orgPosition !== "relative") {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        resizable.value.style.position = "relative"
      }
      // INFO: Use original width or height if set auto.
      width =
        resizable.value.style.width !== "auto"
          ? resizable.value.offsetWidth
          : orgWidth
      height =
        resizable.value.style.height !== "auto"
          ? resizable.value.offsetHeight
          : orgHeight
      // Restore original position
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      resizable.value.style.position = orgPosition
    }
    return { width, height }
  }
}

// HACK: This class is used to calculate % size.
const baseClassName = "__resizable_base__"
const appendBase = () => {
  const win = window.value
  if (!win) {
    return null
  }
  const parent = parentNode.value
  if (!parent) {
    return null
  }
  const element = win.document.createElement("div")
  element.style.width = "100%"
  element.style.height = "100%"
  element.style.position = "absolute"
  element.style.transform = "scale(0, 0)"
  element.style.left = "0"
  element.style.flex = "0 0 100%"
  if (element.classList) {
    element.classList.add(baseClassName)
  } else {
    element.className += baseClassName
  }
  parent.appendChild(element)
  return element
}
const removeBase = (base: HTMLElement) => {
  const parent = parentNode.value
  if (!parent) {
    return
  }
  parent.removeChild(base)
}

function getParentSize(): NumberSize {
  if (!parentNode.value) {
    if (!window.value) {
      return { width: 0, height: 0 }
    }
    return {
      width: window.value.innerWidth,
      height: window.value.innerHeight
    }
  }
  const base = appendBase()
  if (!base) {
    return { width: 0, height: 0 }
  }
  // INFO: To calculate parent width with flex layout
  let wrapChanged = false
  const wrap = parentNode.value.style.flexWrap
  if (wrap !== "wrap") {
    wrapChanged = true
    parentNode.value.style.flexWrap = "wrap"
    // HACK: Use relative to get parent padding size
  }
  base.style.position = "relative"
  base.style.minWidth = "100%"
  base.style.minHeight = "100%"
  const size = {
    width: base.offsetWidth,
    height: base.offsetHeight
  }
  if (wrapChanged) {
    parentNode.value.style.flexWrap = wrap
  }
  removeBase(base)
  return size
}

function getSize(ref: Ref<number | string>, key: "width" | "height"): string {
  if (ref.value === undefined || ref.value === "auto") {
    return "auto"
  }

  if (propsSize.value[key].toString().endsWith("%")) {
    if (ref.value.toString().endsWith("%")) {
      return ref.value.toString()
    }
    const parentSize = getParentSize()
    const value = Number(ref.value.toString().replace("px", ""))
    const percent = (value / parentSize[key]) * 100
    return `${percent}%`
  }
  return getStringSize(ref.value)
}

const sizeStyle = computed<Size>(() => {
  const { size } = props
  const width =
    size && typeof size.width !== "undefined" && !isResizing.value
      ? getStringSize(size.width)
      : getSize(widthRet, "width")
  const height =
    size && typeof size.height !== "undefined" && !isResizing.value
      ? getStringSize(size.height)
      : getSize(heightRet, "height")
  return { width, height }
})

const isResizing = ref(false)
const directionRet = ref<Direction>("right")
const original = reactive<{
  x: number
  y: number
  width: number
  height: number
}>({
  x: 0,
  y: 0,
  width: 0,
  height: 0
})
const widthRet = ref<number | string>(propsSize.value.width)
const heightRet = ref<number | string>(propsSize.value.height)
const backgroundStyle = reactive<Record<string, string | number>>({
  height: "100%",
  width: "100%",
  backgroundColor: "rgba(0,0,0,0)",
  cursor: "auto",
  opacity: 0,
  position: "fixed",
  zIndex: 9999,
  top: "0",
  left: "0",
  bottom: "0",
  right: "0"
})
const flexBasisRet = ref<number | string>()

// static state

let flexDir: "row" | "column"
let ratio = 1
// For parent boundary
let parentLeft = 0
let parentTop = 0
// For boundary
let resizableLeft = 0
let resizableRight = 0
let resizableTop = 0
let resizableBottom = 0
// For target boundary
let targetLeft = 0
let targetTop = 0

onMounted(() => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const computedStyle = window.value!.getComputedStyle(resizable.value!)
  widthRet.value = widthRet.value ?? size.value.width
  heightRet.value = heightRet.value ?? size.value.height
  flexBasisRet.value =
    computedStyle.flexBasis !== "auto" ? computedStyle.flexBasis : undefined
})
onBeforeMount(() => {
  unbindEvents()
})

// helpers

function setBoundingClientRect() {
  // For parent boundary
  if (props.bounds === "parent") {
    const parent = parentNode.value
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      parentLeft = parentRect.left
      parentTop = parentRect.top
    }
  }

  // For target(html element) boundary
  if (props.bounds && typeof props.bounds !== "string") {
    const targetRect = props.bounds.getBoundingClientRect()
    targetLeft = targetRect.left
    targetTop = targetRect.top
  }

  // For boundary
  if (resizable.value) {
    const { left, top, right, bottom } = resizable.value.getBoundingClientRect()
    resizableLeft = left
    resizableRight = right
    resizableTop = top
    resizableBottom = bottom
  }
}
function calculateNewSizeFromDirection(clientX: number, clientY: number) {
  const scale = props.scale || 1
  const resizeRatio = props.resizeRatio || 1
  const {
    lockAspectRatio,
    lockAspectRatioExtraHeight,
    lockAspectRatioExtraWidth
  } = props
  let newWidth = original.width
  let newHeight = original.height
  const extraHeight = lockAspectRatioExtraHeight || 0
  const extraWidth = lockAspectRatioExtraWidth || 0

  if (hasDirection("right", directionRet.value)) {
    newWidth = original.width + ((clientX - original.x) * resizeRatio) / scale
    if (lockAspectRatio) {
      newHeight = (newWidth - extraWidth) / ratio + extraHeight
    }
  }
  if (hasDirection("left", directionRet.value)) {
    newWidth = original.width - ((clientX - original.x) * resizeRatio) / scale
    if (lockAspectRatio) {
      newHeight = (newWidth - extraWidth) / ratio + extraHeight
    }
  }
  if (hasDirection("bottom", directionRet.value)) {
    newHeight = original.height + ((clientY - original.y) * resizeRatio) / scale
    if (lockAspectRatio) {
      newWidth = (newHeight - extraHeight) * ratio + extraWidth
    }
  }
  if (hasDirection("top", directionRet.value)) {
    newHeight = original.height - ((clientY - original.y) * resizeRatio) / scale
    if (lockAspectRatio) {
      newWidth = (newHeight - extraHeight) * ratio + extraWidth
    }
  }
  return { newWidth, newHeight }
}
function calculateNewMaxFromBoundary(maxWidth?: number, maxHeight?: number) {
  const { boundsByDirection } = props
  const widthByDirection =
    boundsByDirection && hasDirection("left", directionRet.value)
  const heightByDirection =
    boundsByDirection && hasDirection("top", directionRet.value)
  let boundWidth
  let boundHeight
  if (props.bounds === "parent") {
    const parent = parentNode.value
    if (parent) {
      boundWidth = widthByDirection
        ? resizableRight - parentLeft
        : parent.offsetWidth + (parentLeft - resizableLeft)
      boundHeight = heightByDirection
        ? resizableBottom - parentTop
        : parent.offsetHeight + (parentTop - resizableTop)
    }
  } else if (props.bounds === "window") {
    if (window.value) {
      boundWidth = widthByDirection
        ? resizableRight
        : window.value.innerWidth - resizableLeft
      boundHeight = heightByDirection
        ? resizableBottom
        : window.value.innerHeight - resizableTop
    }
  } else if (props.bounds) {
    boundWidth = widthByDirection
      ? resizableRight - targetLeft
      : props.bounds.offsetWidth + (targetLeft - resizableLeft)
    boundHeight = heightByDirection
      ? resizableBottom - targetTop
      : props.bounds.offsetHeight + (targetTop - resizableTop)
  }
  if (boundWidth && Number.isFinite(boundWidth)) {
    maxWidth = maxWidth && maxWidth < boundWidth ? maxWidth : boundWidth
  }
  if (boundHeight && Number.isFinite(boundHeight)) {
    maxHeight = maxHeight && maxHeight < boundHeight ? maxHeight : boundHeight
  }
  return { maxWidth, maxHeight }
}
function calculateNewSizeFromAspectRatio(
  newWidth: number,
  newHeight: number,
  max: Partial<NumberSize>,
  min: Partial<NumberSize>
) {
  const {
    lockAspectRatio,
    lockAspectRatioExtraHeight,
    lockAspectRatioExtraWidth
  } = props
  const computedMinWidth = min.width ?? 10
  const computedMaxWidth =
    max.width === undefined || max.width < 0 ? newWidth : max.width
  const computedMinHeight = min.height ?? 10
  const computedMaxHeight =
    max.height === undefined || max.height < 0 ? newHeight : max.height
  const extraHeight = lockAspectRatioExtraHeight || 0
  const extraWidth = lockAspectRatioExtraWidth || 0
  if (lockAspectRatio) {
    const extraMinWidth = (computedMinHeight - extraHeight) * ratio + extraWidth
    const extraMaxWidth = (computedMaxHeight - extraHeight) * ratio + extraWidth
    const extraMinHeight = (computedMinWidth - extraWidth) / ratio + extraHeight
    const extraMaxHeight = (computedMaxWidth - extraWidth) / ratio + extraHeight
    const lockedMinWidth = Math.max(computedMinWidth, extraMinWidth)
    const lockedMaxWidth = Math.min(computedMaxWidth, extraMaxWidth)
    const lockedMinHeight = Math.max(computedMinHeight, extraMinHeight)
    const lockedMaxHeight = Math.min(computedMaxHeight, extraMaxHeight)
    newWidth = clamp(newWidth, lockedMinWidth, lockedMaxWidth)
    newHeight = clamp(newHeight, lockedMinHeight, lockedMaxHeight)
  } else {
    newWidth = clamp(newWidth, computedMinWidth, computedMaxWidth)
    newHeight = clamp(newHeight, computedMinHeight, computedMaxHeight)
  }
  return { newWidth, newHeight }
}
function createSizeForCssProperty(
  newSize: number | string,
  ref: Ref<number | string>,
  kind: "width" | "height"
): number | string {
  const propSize = propsSize.value[kind]
  return ref.value === "auto" &&
    original[kind] === newSize &&
    (propSize === undefined || propSize === "auto")
    ? "auto"
    : newSize
}
// --- helpers ---

function onResizeStart(event: MouseEvent | TouchEvent, direction: Direction) {
  if (!window.value) {
    return
  }
  let clientX = 0
  let clientY = 0
  if (isMouseEvent(event)) {
    clientX = event.clientX
    clientY = event.clientY
  } else if (isTouchEvent(event)) {
    clientX = event.touches[0].clientX
    clientY = event.touches[0].clientY
  }
  if (
    emit("resize:start", {
      event,
      direction,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      el: resizable.value!
    }) === false
  ) {
    return
  }

  // Fix #168
  if (props.size) {
    if (
      props.size.height !== undefined &&
      props.size.height !== heightRet.value
    ) {
      heightRet.value = props.size.height
    }
    if (props.size.width !== undefined && props.size.width !== widthRet.value) {
      widthRet.value = props.size.width
    }
  }

  // For lockAspectRatio case
  ratio =
    typeof props.lockAspectRatio === "number"
      ? props.lockAspectRatio
      : size.value.width / size.value.height

  let flexBasis
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const computedStyle = window.value.getComputedStyle(resizable.value!)
  if (computedStyle.flexBasis !== "auto") {
    const parent = parentNode.value
    if (parent) {
      const dir = window.value.getComputedStyle(parent).flexDirection
      flexDir = dir.startsWith("row") ? "row" : "column"
      flexBasis = computedStyle.flexBasis
    }
  }
  // For boundary
  setBoundingClientRect()
  bindEvents()

  original.x = clientX
  original.y = clientY
  original.width = size.value.width
  original.height = size.value.height
  isResizing.value = true
  backgroundStyle.cursor =
    window.value.getComputedStyle(event.target as HTMLElement).cursor || "auto"
  directionRet.value = direction
  flexBasisRet.value = flexBasis
}
function onMouseUp(event: MouseEvent | TouchEvent) {
  if (!isResizing.value || !resizable.value) {
    return
  }
  const delta = {
    width: size.value.width - original.width,
    height: size.value.height - original.height
  }
  emit("resize:stop", {
    event,
    direction: directionRet.value,
    el: resizable.value,
    delta
  })
  if (props.size) {
    if (props.size?.width !== undefined) widthRet.value = props.size.width
    if (props.size?.height !== undefined) widthRet.value = props.size.height
  }
  unbindEvents()
  isResizing.value = false
  backgroundStyle.cursor = "auto"
}
function onMouseMove(event: MouseEvent | TouchEvent) {
  if (!isResizing.value || !window.value) {
    return
  }
  if (window.value.TouchEvent && isTouchEvent(event)) {
    try {
      event.preventDefault()
      event.stopPropagation()
    } catch (e) {
      // Ignore on fail
    }
  }
  let { maxWidth, maxHeight, minWidth, minHeight } = props
  const clientX = isTouchEvent(event) ? event.touches[0].clientX : event.clientX
  const clientY = isTouchEvent(event) ? event.touches[0].clientY : event.clientY
  const parentSize = getParentSize()
  const max = calculateNewMax(
    parentSize,
    window.value.innerWidth,
    window.value.innerHeight,
    maxWidth,
    maxHeight,
    minWidth,
    minHeight
  )

  maxWidth = max.maxWidth
  maxHeight = max.maxHeight
  minWidth = max.minWidth
  minHeight = max.minHeight

  // Calculate new size
  let { newHeight, newWidth } = calculateNewSizeFromDirection(clientX, clientY)

  // Calculate max size from boundary settings
  const boundaryMax = calculateNewMaxFromBoundary(maxWidth, maxHeight)

  if (props.snap?.x) {
    newWidth = findClosestSnap(newWidth, props.snap.x, props.snapGap)
  }
  if (props.snap?.y) {
    newHeight = findClosestSnap(newHeight, props.snap.y, props.snapGap)
  }

  // Calculate new size from aspect ratio
  const newSize = calculateNewSizeFromAspectRatio(
    newWidth,
    newHeight,
    { width: boundaryMax.maxWidth, height: boundaryMax.maxHeight },
    { width: minWidth, height: minHeight }
  )
  newWidth = newSize.newWidth
  newHeight = newSize.newHeight

  if (props.grid) {
    const newGridWidth = snap(newWidth, props.grid[0])
    const newGridHeight = snap(newHeight, props.grid[1])
    const gap = props.snapGap || 0
    newWidth =
      gap === 0 || Math.abs(newGridWidth - newWidth) <= gap
        ? newGridWidth
        : newWidth
    newHeight =
      gap === 0 || Math.abs(newGridHeight - newHeight) <= gap
        ? newGridHeight
        : newHeight
  }

  const delta = {
    width: newWidth - original.width,
    height: newHeight - original.height
  }

  let newWidth2 = newWidth as string | number
  const width = widthRet.value
  if (width && typeof width === "string") {
    if (width.endsWith("%")) {
      const percent = (newWidth2 as number / parentSize.width) * 100
      newWidth2 = `${percent}%`
    } else if (width.endsWith("vw")) {
      const vw = (newWidth2 as number / window.value.innerWidth) * 100
      newWidth2 = `${vw}vw`
    } else if (width.endsWith("vh")) {
      const vh = (newWidth2 as number / window.value.innerHeight) * 100
      newWidth2 = `${vh}vh`
    }
  }

  let newHeight2 = newHeight as string | number
  const height = heightRet.value
  if (height && typeof height === "string") {
    if (height.endsWith("%")) {
      const percent = (newHeight2 as number / parentSize.height) * 100
      newHeight2 = `${percent}%`
    } else if (height.endsWith("vw")) {
      const vw = (newHeight2 as number / window.value.innerWidth) * 100
      newHeight2 = `${vw}vw`
    } else if (height.endsWith("vh")) {
      const vh = (newHeight2 as number / window.value.innerHeight) * 100
      newHeight2 = `${vh}vh`
    }
  }

  widthRet.value = createSizeForCssProperty(newWidth2, widthRet, "width")
  heightRet.value = createSizeForCssProperty(newHeight2, heightRet, "height")

  if (flexDir === "row") {
    flexBasisRet.value = widthRet.value
  } else if (flexDir === "column") {
    flexBasisRet.value = heightRet.value
  }

  emit("resize", {
    event,
    direction: directionRet.value,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    el: resizable.value!,
    delta
  })
}

function bindEvents() {
  if (window.value) {
    window.value.addEventListener("mouseup", onMouseUp)
    window.value.addEventListener("mousemove", onMouseMove)
    window.value.addEventListener("mouseleave", onMouseUp)
    window.value.addEventListener("touchmove", onMouseMove, {
      capture: true,
      passive: false
    })
    window.value.addEventListener("touchend", onMouseUp)
  }
}
function unbindEvents() {
  if (window.value) {
    window.value.removeEventListener("mouseup", onMouseUp)
    window.value.removeEventListener("mousemove", onMouseMove)
    window.value.removeEventListener("mouseleave", onMouseUp)
    window.value.removeEventListener("touchmove", onMouseMove, true)
    window.value.removeEventListener("touchend", onMouseUp)
  }
}
</script>

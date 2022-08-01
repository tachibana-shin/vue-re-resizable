export const clamp = (n: number, min: number, max: number): number =>
  Math.max(Math.min(n, max), min)
export const snap = (n: number, size: number): number =>
  Math.round(n / size) * size
export const hasDirection = (
  dir: "top" | "right" | "bottom" | "left",
  target: string
): boolean => new RegExp(dir, "i").test(target)

// INFO: In case of window is a Proxy and does not porxy Events correctly, use isTouchEvent & isMouseEvent to distinguish event type instead of `instanceof`.
export const isTouchEvent = (
  event: MouseEvent | TouchEvent
): event is TouchEvent => {
  return Boolean(
    (event as TouchEvent).touches && (event as TouchEvent).touches.length
  )
}

export const isMouseEvent = (
  event: MouseEvent | TouchEvent
): event is MouseEvent => {
  return (
    (event as MouseEvent).clientX !== undefined &&
    (event as MouseEvent).clientY !== undefined
  )
}

export const findClosestSnap = (
  n: number,
  snapArray: number[],
  snapGap = 0
): number => {
  const closestGapIndex = snapArray.reduce(
    (prev, curr, index) =>
      Math.abs(curr - n) < Math.abs(snapArray[prev] - n) ? index : prev,
    0
  )
  const gap = Math.abs(snapArray[closestGapIndex] - n)

  return snapGap === 0 || gap < snapGap ? snapArray[closestGapIndex] : n
}

export const getStringSize = (n: number | string): string => {
  n = n.toString()
  if (n === "auto") {
    return n
  }
  if (n.endsWith("px")) {
    return n
  }
  if (n.endsWith("%")) {
    return n
  }
  if (n.endsWith("vh")) {
    return n
  }
  if (n.endsWith("vw")) {
    return n
  }
  if (n.endsWith("vmax")) {
    return n
  }
  if (n.endsWith("vmin")) {
    return n
  }
  return `${n}px`
}

const getPixelSize = (
  size: undefined | string | number,
  parentSize: number,
  innerWidth: number,
  innerHeight: number
) => {
  if (size && typeof size === "string") {
    if (size.endsWith("px")) {
      return Number(size.replace("px", ""))
    }
    if (size.endsWith("%")) {
      const ratio = Number(size.replace("%", "")) / 100
      return parentSize * ratio
    }
    if (size.endsWith("vw")) {
      const ratio = Number(size.replace("vw", "")) / 100
      return innerWidth * ratio
    }
    if (size.endsWith("vh")) {
      const ratio = Number(size.replace("vh", "")) / 100
      return innerHeight * ratio
    }
  }
  return size
}

export const calculateNewMax = (
  parentSize: { width: number; height: number },
  innerWidth: number,
  innerHeight: number,
  maxWidth?: string | number,
  maxHeight?: string | number,
  minWidth?: string | number,
  minHeight?: string | number
) => {
  maxWidth = getPixelSize(maxWidth, parentSize.width, innerWidth, innerHeight)
  maxHeight = getPixelSize(
    maxHeight,
    parentSize.height,
    innerWidth,
    innerHeight
  )
  minWidth = getPixelSize(minWidth, parentSize.width, innerWidth, innerHeight)
  minHeight = getPixelSize(
    minHeight,
    parentSize.height,
    innerWidth,
    innerHeight
  )
  return {
    maxWidth: typeof maxWidth === "undefined" ? undefined : Number(maxWidth),
    maxHeight: typeof maxHeight === "undefined" ? undefined : Number(maxHeight),
    minWidth: typeof minWidth === "undefined" ? undefined : Number(minWidth),
    minHeight: typeof minHeight === "undefined" ? undefined : Number(minHeight)
  }
}

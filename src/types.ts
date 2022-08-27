export type Direction =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft"

export type Enable = {
  // eslint-disable-next-line no-unused-vars
  [name in Direction]?: boolean
}

export type ResizerClasses = {
  // eslint-disable-next-line no-unused-vars
  [name in Direction]?: string | string[] | Record<string, boolean>
}
export type ResizerStyles = {
  // eslint-disable-next-line no-unused-vars
  [name in Direction]?: string | number
}

export interface Size {
  width: string | number
  height: string | number
}

export interface NumberSize {
  width: number
  height: number
}

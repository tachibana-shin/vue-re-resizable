export declare type Direction = "top" | "right" | "bottom" | "left" | "top-right" | "bottom-right" | "bottom-left" | "top-left";
export declare type Enable = {
    [name in Direction]?: boolean;
};
export declare type ResizerClasses = {
    [name in Direction]?: string | string[] | Record<string, boolean>;
};
export declare type ResizerStyles = {
    [name in Direction]?: string | number;
};
export interface Size {
    width: string | number;
    height: string | number;
}
export interface NumberSize {
    width: number;
    height: number;
}

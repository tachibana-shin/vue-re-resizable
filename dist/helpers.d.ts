export declare const clamp: (n: number, min: number, max: number) => number;
export declare const snap: (n: number, size: number) => number;
export declare const hasDirection: (dir: "top" | "right" | "bottom" | "left", target: string) => boolean;
export declare const isTouchEvent: (event: MouseEvent | TouchEvent) => event is TouchEvent;
export declare const isMouseEvent: (event: MouseEvent | TouchEvent) => event is MouseEvent;
export declare const findClosestSnap: (n: number, snapArray: number[], snapGap?: number) => number;
export declare const getStringSize: (n: number | string) => string;
export declare const calculateNewMax: (parentSize: {
    width: number;
    height: number;
}, innerWidth: number, innerHeight: number, maxWidth?: string | number, maxHeight?: string | number, minWidth?: string | number, minHeight?: string | number) => {
    maxWidth: number | undefined;
    maxHeight: number | undefined;
    minWidth: number | undefined;
    minHeight: number | undefined;
};

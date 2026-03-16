/**
 * Type stub for `motion-dom`.
 *
 * framer-motion v12 imports its core animation types (MotionNodeOptions, etc.)
 * from `motion-dom`, but that package ships without a `dist/index.d.ts` file,
 * causing TypeScript to be unable to resolve `MotionNodeOptions` and therefore
 * stripping all animation props (`initial`, `animate`, `exit`, …) from every
 * `motion.*` component.
 *
 * This ambient module declaration provides the minimum types needed for
 * TypeScript to accept standard framer-motion usage in the application.
 */
declare module "motion-dom" {
  // ── Core animation target types ─────────────────────────────────────────
  export type TargetProperties = Record<string, unknown>;
  export type TargetAndTransition = Record<string, unknown>;
  export type AnyResolvedKeyframe = string | number | null;
  export type AnimationDefinition =
    | string
    | string[]
    | TargetAndTransition
    | boolean;
  export type KeyframeResolver = unknown;
  export type Batcher = unknown;
  export type SVGPathProperties = Record<string, unknown>;
  export type TransformProperties = Record<string, unknown>;
  export type JSAnimation = unknown;

  // ── Transition ──────────────────────────────────────────────────────────
  export interface Transition extends Record<string, unknown> {
    duration?: number;
    delay?: number;
    ease?: string | number[];
    type?: "tween" | "spring" | "inertia" | "keyframes";
    repeat?: number;
    repeatType?: "loop" | "reverse" | "mirror";
  }

  export type ValueTransition = Transition | Record<string, Transition>;

  // ── MotionValue ─────────────────────────────────────────────────────────
  export interface MotionValue<T = unknown> {
    get(): T;
    set(v: T): void;
    on(eventName: string, callback: (v: T) => void): () => void;
  }

  // ── MotionNodeOptions ───────────────────────────────────────────────────
  // This is the interface that framer-motion's MotionProps extends.
  // It must include all standard animation/interaction props.
  export interface MotionNodeOptions {
    initial?: boolean | string | string[] | TargetAndTransition;
    animate?: string | string[] | TargetAndTransition | boolean;
    exit?: string | string[] | TargetAndTransition;
    transition?: Transition;
    variants?: Record<
      string,
      TargetAndTransition | ((...args: unknown[]) => TargetAndTransition)
    >;
    whileHover?: string | TargetAndTransition;
    whileTap?: string | TargetAndTransition;
    whileDrag?: string | TargetAndTransition;
    whileFocus?: string | TargetAndTransition;
    whileInView?: string | TargetAndTransition;
    viewport?: {
      once?: boolean;
      margin?: string;
      amount?: number | "some" | "all";
      root?: unknown;
    };
    layout?: boolean | string;
    layoutId?: string;
    layoutDependency?: unknown;
    drag?: boolean | "x" | "y";
    dragConstraints?: unknown;
    dragElastic?:
      | number
      | boolean
      | { top?: number; right?: number; bottom?: number; left?: number };
    dragMomentum?: boolean;
    dragTransition?: Transition;
    dragSnapToOrigin?: boolean;
    dragPropagation?: boolean;
    transformTemplate?: (
      transform: Record<string, unknown>,
      generatedTransform: string,
    ) => string;
    custom?: unknown;
    inherit?: boolean;
    onAnimationStart?: (definition: AnimationDefinition) => void;
    onAnimationComplete?: (definition: AnimationDefinition) => void;
    onUpdate?: (latest: Record<string, unknown>) => void;
    onHoverStart?: (event: MouseEvent, info: unknown) => void;
    onHoverEnd?: (event: MouseEvent, info: unknown) => void;
    onTapStart?: (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: unknown,
    ) => void;
    onTap?: (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: unknown,
    ) => void;
    onTapCancel?: (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: unknown,
    ) => void;
    onPan?: (event: PointerEvent, info: unknown) => void;
    onPanStart?: (event: PointerEvent, info: unknown) => void;
    onPanEnd?: (event: PointerEvent, info: unknown) => void;
    onDrag?: (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: unknown,
    ) => void;
    onDragStart?: (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: unknown,
    ) => void;
    onDragEnd?: (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: unknown,
    ) => void;
    onDirectionLock?: (axis: "x" | "y") => void;
    onViewportEnter?: (entry: IntersectionObserverEntry | null) => void;
    onViewportLeave?: (entry: IntersectionObserverEntry | null) => void;
  }
}
